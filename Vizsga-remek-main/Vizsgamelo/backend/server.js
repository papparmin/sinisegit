require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =====================================
   UPLOADS FOLDER
===================================== */
const UPLOAD_DIR = path.join(__dirname, "uploads");
const BERLES_UPLOAD_DIR = path.join(UPLOAD_DIR, "berles");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(BERLES_UPLOAD_DIR)) {
  fs.mkdirSync(BERLES_UPLOAD_DIR, { recursive: true });
}

app.use("/uploads", express.static(UPLOAD_DIR));

/* =====================================
   DATABASE
===================================== */
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "exploree",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

const dbPromise = db.promise();

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB kapcsolat hiba:");
    console.error(err);
  } else {
    console.log("✅ DB connected");
    connection.release();
  }
});

/* =====================================
   MAIL
===================================== */
const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASS || "",
  },
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMoneyHu(value) {
  return `${Number(value || 0).toLocaleString("hu-HU")} Ft`;
}

function toLocalSqlDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFutureSqlDate(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 0));
  return toLocalSqlDate(d);
}

function formatDateHu(value) {
  if (!value) return "—";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function normalizePaymentMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (["helyszinen", "atutalas", "online"].includes(normalized)) {
    return normalized;
  }

  return "helyszinen";
}

function getPaymentMethodLabel(value) {
  if (value === "atutalas") return "Banki átutalás";
  if (value === "online") {
    return "Online fizetés (bankkártya / Apple Pay / Google Pay)";
  }
  return "Helyszíni fizetés";
}

function getPaymentStatusFromMethod(value) {
  if (value === "atutalas") return "pending";
  if (value === "online") return "pending";
  return "unpaid";
}

function getPaymentStatusLabel(value) {
  if (value === "pending") return "Fizetésre vár";
  if (value === "paid") return "Kifizetve";
  return "Helyszínen fizetendő";
}

function getTransferReference(bookingId) {
  return `EXPLORE-${bookingId}`;
}

function getBankTransferConfig() {
  return {
    accountName: String(process.env.BANK_ACCOUNT_NAME || "EXPLORE").trim(),
    bankName: String(process.env.BANK_NAME || "").trim(),
    accountNumber: String(process.env.BANK_ACCOUNT_NUMBER || "").trim(),
    iban: String(process.env.BANK_IBAN || "").trim(),
    swift: String(process.env.BANK_SWIFT || "").trim(),
    notice: String(
      process.env.BANK_TRANSFER_NOTICE ||
        "Kérlek, a közleménybe írd be a megadott utalási azonosítót."
    ).trim(),
  };
}

async function sendContactReplyEmail({ toEmail, toName, subject, adminReply }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("A levélküldéshez hiányzik a MAIL_USER vagy MAIL_PASS.");
  }

  const fromName = process.env.MAIL_FROM_NAME || "EXPLORE";
  const safeName = String(toName || "Érdeklődő").trim() || "Érdeklődő";
  const safeSubject =
    String(subject || "Kapcsolati megkeresés").trim() ||
    "Kapcsolati megkeresés";
  const safeReply = String(adminReply || "").trim();

  await mailTransporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `Válasz az üzenetedre – ${safeSubject}`,
    text: `Szia ${safeName}!

Köszönjük, hogy írtál nekünk.

Az üzenetedre az alábbi választ küldjük:

${safeReply}

Üdv,
${fromName}
${process.env.MAIL_USER}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
        <p>Szia ${escapeHtml(safeName)}!</p>
        <p>Köszönjük, hogy írtál nekünk.</p>
        <p>Az üzenetedre az alábbi választ küldjük:</p>
        <div style="padding: 14px 16px; background: #f5f7f8; border: 1px solid #dfe5e8; border-radius: 10px; white-space: pre-wrap;">${escapeHtml(
          safeReply
        )}</div>
        <p style="margin-top: 18px;">Üdv,<br/><strong>${escapeHtml(
          fromName
        )}</strong></p>
      </div>
    `,
  });
}

async function sendBookingConfirmationEmail({
  toEmail,
  toName,
  bookingId,
  tourTitle,
  date,
  people,
  paymentMethod,
  paymentStatus,
  paymentAmount,
  paymentReference,
  paymentDueDate,
  bankTransfer,
}) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error(
      "A visszaigazoló emailhez hiányzik a MAIL_USER vagy MAIL_PASS."
    );
  }

  const fromName = process.env.MAIL_FROM_NAME || "EXPLORE";
  const safeName = String(toName || "Vendég").trim() || "Vendég";
  const safeTourTitle = String(tourTitle || "EXPLORE túra").trim();
  const safeDate = formatDateHu(date);
  const safePeople = Number(people || 1);
  const paymentLabel = getPaymentMethodLabel(paymentMethod);
  const paymentStatusLabel = getPaymentStatusLabel(paymentStatus);
  const paymentAmountLabel = formatMoneyHu(paymentAmount);

  const transferTextBlock =
    paymentMethod === "atutalas"
      ? `

Átutalási adatok:
Kedvezményezett: ${bankTransfer?.accountName || "—"}
Bank: ${bankTransfer?.bankName || "—"}
Számlaszám: ${bankTransfer?.accountNumber || "—"}
IBAN: ${bankTransfer?.iban || "—"}
SWIFT: ${bankTransfer?.swift || "—"}
Közlemény: ${paymentReference || "—"}
Határidő: ${formatDateHu(paymentDueDate)}
Megjegyzés: ${bankTransfer?.notice || "—"}`
      : "";

  const transferHtmlBlock =
    paymentMethod === "atutalas"
      ? `
        <div style="margin-top: 16px; padding: 16px; background: #f7fbf7; border: 1px solid #d9ead9; border-radius: 12px;">
          <p style="margin: 0 0 8px;"><strong>Átutalási adatok</strong></p>
          <p style="margin: 0 0 6px;"><strong>Kedvezményezett:</strong> ${escapeHtml(
            bankTransfer?.accountName || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>Bank:</strong> ${escapeHtml(
            bankTransfer?.bankName || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>Számlaszám:</strong> ${escapeHtml(
            bankTransfer?.accountNumber || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>IBAN:</strong> ${escapeHtml(
            bankTransfer?.iban || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>SWIFT:</strong> ${escapeHtml(
            bankTransfer?.swift || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>Közlemény:</strong> ${escapeHtml(
            paymentReference || "—"
          )}</p>
          <p style="margin: 0 0 6px;"><strong>Határidő:</strong> ${escapeHtml(
            formatDateHu(paymentDueDate)
          )}</p>
          <p style="margin: 0;"><strong>Megjegyzés:</strong> ${escapeHtml(
            bankTransfer?.notice || "—"
          )}</p>
        </div>
      `
      : "";

  await mailTransporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `Foglalás visszaigazolás – ${safeTourTitle}`,
    text: `Szia ${safeName}!

Köszönjük a foglalást, sikeresen rögzítettük az adataidat.

Foglalás azonosító: #${bookingId}
Túra: ${safeTourTitle}
Dátum: ${safeDate}
Létszám: ${safePeople} fő
Fizetési mód: ${paymentLabel}
Fizetési állapot: ${paymentStatusLabel}
Becsült végösszeg: ${paymentAmountLabel}${transferTextBlock}

Hamarosan további információkat is küldünk.

Üdv,
${fromName}
${process.env.MAIL_USER}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
        <p>Szia ${escapeHtml(safeName)}!</p>
        <p>Köszönjük a foglalást, sikeresen rögzítettük az adataidat.</p>

        <div style="padding: 16px; background: #f4f8f4; border: 1px solid #dbe7db; border-radius: 12px;">
          <p style="margin: 0 0 8px;"><strong>Foglalás azonosító:</strong> #${escapeHtml(
            bookingId
          )}</p>
          <p style="margin: 0 0 8px;"><strong>Túra:</strong> ${escapeHtml(
            safeTourTitle
          )}</p>
          <p style="margin: 0 0 8px;"><strong>Dátum:</strong> ${escapeHtml(
            safeDate
          )}</p>
          <p style="margin: 0 0 8px;"><strong>Létszám:</strong> ${escapeHtml(
            String(safePeople)
          )} fő</p>
          <p style="margin: 0 0 8px;"><strong>Fizetési mód:</strong> ${escapeHtml(
            paymentLabel
          )}</p>
          <p style="margin: 0 0 8px;"><strong>Fizetési állapot:</strong> ${escapeHtml(
            paymentStatusLabel
          )}</p>
          <p style="margin: 0;"><strong>Becsült végösszeg:</strong> ${escapeHtml(
            paymentAmountLabel
          )}</p>
        </div>

        ${transferHtmlBlock}

        <p style="margin-top: 18px;">Hamarosan további információkat is küldünk.</p>
        <p>Üdv,<br/><strong>${escapeHtml(fromName)}</strong></p>
      </div>
    `,
  });
}

/* =====================================
   JWT
===================================== */
const JWT_SECRET = process.env.JWT_SECRET || "vizsga_secret";

/* =====================================
   AUTH MIDDLEWARE
===================================== */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Nincs token!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Érvénytelen token!" });
  }
}

async function adminMiddleware(req, res, next) {
  try {
    const [rows] = await dbPromise.query(
      "SELECT id, szerepkor FROM felhasznalok WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Felhasználó nem található!" });
    }

    if (rows[0].szerepkor !== "admin") {
      return res.status(403).json({ error: "Nincs admin jogosultságod!" });
    }

    next();
  } catch (error) {
    console.error("❌ ADMIN MIDDLEWARE HIBA:", error.message);
    return res.status(500).json({ error: "DB hiba" });
  }
}

/* =====================================
   HELPERS
===================================== */
function deleteLocalImage(relativePath) {
  if (!relativePath) return;
  if (!relativePath.startsWith("/uploads/")) return;

  const safePath = relativePath.replace(/^\//, "");
  const filePath = path.join(__dirname, safePath);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
}

function makeError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function slugify(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function isValidSqlDateString(value) {
  if (!value || typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

function getTodaySqlDate() {
  return new Date().toISOString().slice(0, 10);
}

function calculateAge(dateValue) {
  if (!dateValue) return null;

  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 0 || age > 120) return null;
  return age;
}

function getAgeGroup(age) {
  if (typeof age !== "number" || Number.isNaN(age)) return null;
  if (age < 18) return "18 év alatt";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  return "55+";
}

function normalizeCity(value) {
  const city = String(value || "").trim();
  return city || "";
}

function setHas(setObj, key) {
  return !!setObj && setObj.has(key);
}

function pickExistingColumn(columns, names = []) {
  for (const name of names) {
    if (setHas(columns, name)) return name;
  }
  return null;
}

function nullSafeExpr(expr, fallbackSqlLiteral) {
  if (!expr) return fallbackSqlLiteral;
  return `COALESCE(NULLIF(${expr}, ''), ${fallbackSqlLiteral})`;
}

async function tableExists(tableName) {
  const [rows] = await dbPromise.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await dbPromise.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE ?`,
    [columnName]
  );
  return rows.length > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await dbPromise.query(`SHOW INDEX FROM \`${tableName}\``);
  return rows.some((row) => row.Key_name === indexName);
}

async function getTableColumnsSet(tableName) {
  const exists = await tableExists(tableName);
  if (!exists) return new Set();

  const [rows] = await dbPromise.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set(rows.map((row) => row.Field));
}

async function addColumnIfMissing(tableName, columnName, sqlTypeAndOptions) {
  const exists = await columnExists(tableName, columnName);
  if (!exists) {
    await dbPromise.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${sqlTypeAndOptions}`
    );
  }
}

async function addIndexIfMissing(tableName, indexName, indexSql) {
  const exists = await indexExists(tableName, indexName);
  if (!exists) {
    await dbPromise.query(indexSql);
  }
}

function getFoglalasTourIdExpr(columns) {
  const hasTuraId = setHas(columns, "tura_id");
  const hasTourId = setHas(columns, "tour_id");

  if (hasTuraId && hasTourId) return "COALESCE(tura_id, tour_id)";
  if (hasTuraId) return "tura_id";
  if (hasTourId) return "tour_id";

  return null;
}

function getFoglalasPeopleExpr(columns) {
  const hasLetszam = setHas(columns, "letszam");
  const hasPeople = setHas(columns, "people");

  if (hasLetszam && hasPeople) {
    return "COALESCE(NULLIF(letszam, 0), NULLIF(people, 0), 1)";
  }

  if (hasLetszam) return "COALESCE(NULLIF(letszam, 0), 1)";
  if (hasPeople) return "COALESCE(NULLIF(people, 0), 1)";

  return null;
}

async function getTourStatsJoinSql() {
  const columns = await getTableColumnsSet("foglalasok");
  const tourIdExpr = getFoglalasTourIdExpr(columns);
  const peopleExpr = getFoglalasPeopleExpr(columns);
  const hasStatus = setHas(columns, "status");

  if (!tourIdExpr || !peopleExpr || !hasStatus) {
    return `
      LEFT JOIN (
        SELECT NULL AS stat_tour_id, 0 AS joined_count
      ) f ON 1 = 0
    `;
  }

  return `
    LEFT JOIN (
      SELECT
        ${tourIdExpr} AS stat_tour_id,
        SUM(${peopleExpr}) AS joined_count
      FROM foglalasok
      WHERE status IN ('uj', 'confirmed', 'paid')
        AND ${tourIdExpr} IS NOT NULL
      GROUP BY ${tourIdExpr}
    ) f ON f.stat_tour_id = t.id
  `;
}

async function createUniqueTourSlug(baseText) {
  const baseSlug = slugify(baseText) || `tura-${Date.now()}`;
  let candidate = baseSlug;
  let index = 2;

  while (true) {
    const [rows] = await dbPromise.query(
      "SELECT id FROM turak WHERE slug = ? LIMIT 1",
      [candidate]
    );

    if (!rows.length) return candidate;

    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
}

function mapTourRow(row) {
  const maxPeople = Number(row.letszam_max || 20);
  const joinedCount = Number(row.joined_count || 0);
  const remainingPlaces = Math.max(0, maxPeople - joinedCount);

  return {
    id: row.id,
    slug: row.slug || `tura-${row.id}`,
    title: row.cim || row.nev || `Túra #${row.id}`,
    shortDesc: row.rovid_leiras || "",
    desc: row.leiras || "",
    category: row.kategoria || row.helyszin || "Általános",
    level: row.nehezseg || "Kezdő",
    dur: row.idotartam || "1 Nap",
    badge: row.badge || "EXPLORE",
    price: Number(row.ar || 0),
    img:
      row.kep ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400",
    maxPeople,
    joinedCount,
    remainingPlaces,
    soldOut: remainingPlaces <= 0,
    active: typeof row.aktiv === "undefined" ? true : !!row.aktiv,
    createdAt: row.created_at || row.letrehozva || null,
    updatedAt: row.updated_at || null,
  };
}

function mapRentalRow(row) {
  return {
    id: row.id,
    nev: row.nev || "Termék",
    kategoria: row.kategoria || "Egyéb",
    marka: row.marka || "EXPLORE",
    ar_per_nap: Number(row.ar_per_nap || 0),
    ertekeles:
      row.ertekeles === null || typeof row.ertekeles === "undefined"
        ? null
        : Number(row.ertekeles),
    suly_kg:
      row.suly_kg === null || typeof row.suly_kg === "undefined"
        ? null
        : Number(row.suly_kg),
    kep: row.kep || null,
    leiras: row.leiras || "",
    darabszam: Number(row.darabszam || 0),
    aktiv: !!row.aktiv,
  };
}

function parseBooleanInput(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (["1", "true", "igen", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "nem", "no", "off"].includes(normalized)) return false;

  return defaultValue;
}

function parseNullableNumber(value) {
  if (value === null || typeof value === "undefined") return null;

  const clean = String(value).trim();
  if (!clean) return null;

  const parsed = Number(clean);
  if (Number.isNaN(parsed)) return null;

  return parsed;
}

function parseNonNegativeInt(value, defaultValue = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return defaultValue;
  return Math.floor(parsed);
}

function normalizeExternalOrUploadImage(value) {
  const clean = String(value || "").trim();
  if (!clean) return null;

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/uploads/")
  ) {
    return clean;
  }

  return null;
}

function getRentalImagePathFromRequest(req, fallback = null) {
  const removeImage = parseBooleanInput(
    req.body?.removeKep ?? req.body?.removeImage,
    false
  );

  if (removeImage) {
    return null;
  }

  if (req.file) {
    return `/uploads/berles/${req.file.filename}`;
  }

  const bodyImage = normalizeExternalOrUploadImage(
    req.body?.kep || req.body?.img || ""
  );

  if (bodyImage) {
    return bodyImage;
  }

  return fallback || null;
}

/* =====================================
   SCHEMA / TABLE FIXERS
===================================== */
async function ensureFelhasznalokTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS felhasznalok (
      id INT NOT NULL AUTO_INCREMENT,
      nev VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      jelszo VARCHAR(255) NOT NULL,
      szerepkor ENUM('user','admin') DEFAULT 'user',
      aktiv TINYINT(1) DEFAULT 1,
      profilkep VARCHAR(500) DEFAULT NULL,
      varos VARCHAR(255) DEFAULT NULL,
      szuletesi_datum DATE DEFAULT NULL,
      letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_felhasznalok_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await addColumnIfMissing("felhasznalok", "profilkep", "VARCHAR(500) NULL");
  await addColumnIfMissing("felhasznalok", "varos", "VARCHAR(255) NULL");
  await addColumnIfMissing("felhasznalok", "szuletesi_datum", "DATE NULL");
  await addColumnIfMissing("felhasznalok", "nem", "VARCHAR(50) NULL");
  await addColumnIfMissing(
    "felhasznalok",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  await addIndexIfMissing(
    "felhasznalok",
    "uq_felhasznalok_email",
    "ALTER TABLE felhasznalok ADD UNIQUE KEY uq_felhasznalok_email (email)"
  );
}

async function ensureKapcsolatUzenetekTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS kapcsolat_uzenetek (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NULL,
      nev VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      targy VARCHAR(255) DEFAULT NULL,
      uzenet TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'uj',
      admin_valasz TEXT DEFAULT NULL,
      admin_id INT NULL,
      valaszolva_ekkor DATETIME DEFAULT NULL,
      letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await addColumnIfMissing("kapcsolat_uzenetek", "user_id", "INT NULL");
  await addColumnIfMissing("kapcsolat_uzenetek", "nev", "VARCHAR(255) NULL");
  await addColumnIfMissing("kapcsolat_uzenetek", "email", "VARCHAR(255) NULL");
  await addColumnIfMissing("kapcsolat_uzenetek", "targy", "VARCHAR(255) NULL");
  await addColumnIfMissing("kapcsolat_uzenetek", "uzenet", "TEXT NULL");
  await addColumnIfMissing(
    "kapcsolat_uzenetek",
    "status",
    "VARCHAR(50) NOT NULL DEFAULT 'uj'"
  );
  await addColumnIfMissing("kapcsolat_uzenetek", "admin_valasz", "TEXT NULL");
  await addColumnIfMissing("kapcsolat_uzenetek", "admin_id", "INT NULL");
  await addColumnIfMissing(
    "kapcsolat_uzenetek",
    "valaszolva_ekkor",
    "DATETIME NULL"
  );
  await addColumnIfMissing(
    "kapcsolat_uzenetek",
    "letrehozva",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
  );
}

async function ensureTurakTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS turak (
      id INT NOT NULL AUTO_INCREMENT,
      slug VARCHAR(180) NOT NULL,
      cim VARCHAR(255) NOT NULL,
      rovid_leiras VARCHAR(255) DEFAULT NULL,
      leiras TEXT NOT NULL,
      kategoria VARCHAR(100) NOT NULL,
      nehezseg VARCHAR(100) NOT NULL,
      idotartam VARCHAR(100) NOT NULL,
      badge VARCHAR(120) DEFAULT NULL,
      ar INT NOT NULL DEFAULT 0,
      kep VARCHAR(2000) DEFAULT NULL,
      letszam_max INT NOT NULL DEFAULT 20,
      aktiv TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_turak_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await addColumnIfMissing("turak", "slug", "VARCHAR(180) NULL");
  await addColumnIfMissing("turak", "cim", "VARCHAR(255) NULL");
  await addColumnIfMissing("turak", "rovid_leiras", "VARCHAR(255) NULL");
  await addColumnIfMissing("turak", "leiras", "TEXT NULL");
  await addColumnIfMissing("turak", "kategoria", "VARCHAR(100) NULL");
  await addColumnIfMissing("turak", "nehezseg", "VARCHAR(100) NULL");
  await addColumnIfMissing("turak", "idotartam", "VARCHAR(100) NULL");
  await addColumnIfMissing("turak", "badge", "VARCHAR(120) NULL");
  await addColumnIfMissing("turak", "ar", "INT NOT NULL DEFAULT 0");
  await addColumnIfMissing("turak", "kep", "VARCHAR(2000) NULL");
  await addColumnIfMissing("turak", "letszam_max", "INT NOT NULL DEFAULT 20");
  await addColumnIfMissing("turak", "aktiv", "TINYINT(1) NOT NULL DEFAULT 1");
  await addColumnIfMissing(
    "turak",
    "created_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
  );
  await addColumnIfMissing(
    "turak",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  const hasOldNev = await columnExists("turak", "nev");
  const hasOldHelyszin = await columnExists("turak", "helyszin");
  const hasOldLeiras = await columnExists("turak", "leiras");

  const nevExpr = hasOldNev ? "NULLIF(nev, '')" : "NULL";
  const helyszinExpr = hasOldHelyszin ? "NULLIF(helyszin, '')" : "NULL";
  const leirasExpr = hasOldLeiras ? "NULLIF(leiras, '')" : "NULL";

  await dbPromise.query(`
    UPDATE turak
    SET
      slug = COALESCE(NULLIF(slug, ''), CONCAT('tura-', id)),
      cim = COALESCE(NULLIF(cim, ''), ${nevExpr}, CONCAT('Túra #', id)),
      rovid_leiras = COALESCE(
        NULLIF(rovid_leiras, ''),
        LEFT(COALESCE(${leirasExpr}, ${helyszinExpr}, 'Explore túra'), 255)
      ),
      kategoria = COALESCE(NULLIF(kategoria, ''), ${helyszinExpr}, 'Általános'),
      nehezseg = COALESCE(NULLIF(nehezseg, ''), 'Kezdő'),
      idotartam = COALESCE(NULLIF(idotartam, ''), '1 Nap'),
      badge = COALESCE(NULLIF(badge, ''), 'EXPLORE'),
      kep = COALESCE(
        NULLIF(kep, ''),
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400'
      ),
      letszam_max = COALESCE(NULLIF(letszam_max, 0), 20),
      aktiv = COALESCE(aktiv, 1)
  `);

  await addIndexIfMissing(
    "turak",
    "uq_turak_slug",
    "ALTER TABLE turak ADD UNIQUE KEY uq_turak_slug (slug)"
  );
}

async function ensureFoglalasokTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS foglalasok (
      id INT NOT NULL AUTO_INCREMENT,
      felhasznalo_id INT NULL,
      user_id INT NULL,
      tura_id INT NULL,
      tour_id INT NULL,
      tura_slug VARCHAR(180) DEFAULT NULL,
      tour_slug VARCHAR(180) DEFAULT NULL,
      tura_cim VARCHAR(255) DEFAULT NULL,
      tour_title VARCHAR(255) DEFAULT NULL,
      datum DATE DEFAULT NULL,
      date DATE DEFAULT NULL,
      letszam INT NOT NULL DEFAULT 1,
      people INT NOT NULL DEFAULT 1,
      nev VARCHAR(255) DEFAULT NULL,
      foglalo_nev VARCHAR(255) DEFAULT NULL,
      name VARCHAR(255) DEFAULT NULL,
      foglalo_email VARCHAR(255) DEFAULT NULL,
      email VARCHAR(255) DEFAULT NULL,
      telefon VARCHAR(60) DEFAULT NULL,
      foglalo_telefon VARCHAR(60) DEFAULT NULL,
      phone VARCHAR(60) DEFAULT NULL,
      tapasztalat VARCHAR(100) DEFAULT 'Kezdő',
      experience VARCHAR(100) DEFAULT 'Kezdő',
      egeszseg TEXT DEFAULT NULL,
      health TEXT DEFAULT NULL,
      veszhelyzeti_nev VARCHAR(255) DEFAULT NULL,
      emergency_name VARCHAR(255) DEFAULT NULL,
      veszhelyzeti_telefon VARCHAR(60) DEFAULT NULL,
      emergency_phone VARCHAR(60) DEFAULT NULL,
      felszereles_berles VARCHAR(50) DEFAULT 'Nem',
      rental VARCHAR(50) DEFAULT 'Nem',
      megjegyzes TEXT DEFAULT NULL,
      note TEXT DEFAULT NULL,
      payment_method VARCHAR(50) DEFAULT 'helyszinen',
      payment_status VARCHAR(50) DEFAULT 'unpaid',
      payment_amount INT NOT NULL DEFAULT 0,
      payment_reference VARCHAR(120) DEFAULT NULL,
      payment_due_date DATE DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'uj',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const cols = [
    ["felhasznalo_id", "INT NULL"],
    ["user_id", "INT NULL"],
    ["tura_id", "INT NULL"],
    ["tour_id", "INT NULL"],
    ["tura_slug", "VARCHAR(180) NULL"],
    ["tour_slug", "VARCHAR(180) NULL"],
    ["tura_cim", "VARCHAR(255) NULL"],
    ["tour_title", "VARCHAR(255) NULL"],
    ["datum", "DATE NULL"],
    ["date", "DATE NULL"],
    ["letszam", "INT NOT NULL DEFAULT 1"],
    ["people", "INT NOT NULL DEFAULT 1"],
    ["nev", "VARCHAR(255) NULL"],
    ["foglalo_nev", "VARCHAR(255) NULL"],
    ["name", "VARCHAR(255) NULL"],
    ["foglalo_email", "VARCHAR(255) NULL"],
    ["email", "VARCHAR(255) NULL"],
    ["telefon", "VARCHAR(60) NULL"],
    ["foglalo_telefon", "VARCHAR(60) NULL"],
    ["phone", "VARCHAR(60) NULL"],
    ["tapasztalat", "VARCHAR(100) DEFAULT 'Kezdő'"],
    ["experience", "VARCHAR(100) DEFAULT 'Kezdő'"],
    ["egeszseg", "TEXT NULL"],
    ["health", "TEXT NULL"],
    ["veszhelyzeti_nev", "VARCHAR(255) NULL"],
    ["emergency_name", "VARCHAR(255) NULL"],
    ["veszhelyzeti_telefon", "VARCHAR(60) NULL"],
    ["emergency_phone", "VARCHAR(60) NULL"],
    ["felszereles_berles", "VARCHAR(50) DEFAULT 'Nem'"],
    ["rental", "VARCHAR(50) DEFAULT 'Nem'"],
    ["megjegyzes", "TEXT NULL"],
    ["note", "TEXT NULL"],
    ["payment_method", "VARCHAR(50) DEFAULT 'helyszinen'"],
    ["payment_status", "VARCHAR(50) DEFAULT 'unpaid'"],
    ["payment_amount", "INT NOT NULL DEFAULT 0"],
    ["payment_reference", "VARCHAR(120) NULL"],
    ["payment_due_date", "DATE NULL"],
    ["status", "VARCHAR(50) NOT NULL DEFAULT 'uj'"],
    ["created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    [
      "updated_at",
      "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ],
  ];

  for (const [name, sql] of cols) {
    await addColumnIfMissing("foglalasok", name, sql);
  }

  await addIndexIfMissing(
    "foglalasok",
    "idx_foglalasok_tura",
    "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_tura (tura_id)"
  );
  await addIndexIfMissing(
    "foglalasok",
    "idx_foglalasok_tour",
    "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_tour (tour_id)"
  );
  await addIndexIfMissing(
    "foglalasok",
    "idx_foglalasok_user",
    "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_user (felhasznalo_id)"
  );
  await addIndexIfMissing(
    "foglalasok",
    "idx_foglalasok_user2",
    "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_user2 (user_id)"
  );
  await addIndexIfMissing(
    "foglalasok",
    "idx_foglalasok_status",
    "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_status (status)"
  );

  try {
    await dbPromise.query(`
      UPDATE foglalasok
      SET
        letszam = COALESCE(NULLIF(letszam, 0), NULLIF(people, 0), 1),
        people = COALESCE(NULLIF(people, 0), NULLIF(letszam, 0), 1),
        nev = COALESCE(NULLIF(nev, ''), NULLIF(foglalo_nev, ''), NULLIF(name, '')),
        foglalo_nev = COALESCE(NULLIF(foglalo_nev, ''), NULLIF(nev, ''), NULLIF(name, '')),
        name = COALESCE(NULLIF(name, ''), NULLIF(foglalo_nev, ''), NULLIF(nev, '')),
        telefon = COALESCE(NULLIF(telefon, ''), NULLIF(foglalo_telefon, ''), NULLIF(phone, '')),
        foglalo_telefon = COALESCE(NULLIF(foglalo_telefon, ''), NULLIF(telefon, ''), NULLIF(phone, '')),
        phone = COALESCE(NULLIF(phone, ''), NULLIF(foglalo_telefon, ''), NULLIF(telefon, '')),
        payment_method = COALESCE(NULLIF(payment_method, ''), 'helyszinen'),
        payment_status = COALESCE(NULLIF(payment_status, ''), 'unpaid'),
        payment_amount = COALESCE(payment_amount, 0),
        payment_reference = NULLIF(payment_reference, ''),
        payment_due_date = payment_due_date,
        status = COALESCE(NULLIF(status, ''), 'uj')
    `);
  } catch (error) {
    console.error("❌ foglalasok normalize hiba:", error.message);
  }
}

async function ensureFoglalasVendegekTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS foglalas_vendegek (
      id INT NOT NULL AUTO_INCREMENT,
      foglalas_id INT NOT NULL,
      booking_id INT NULL,
      nev VARCHAR(255) DEFAULT NULL,
      name VARCHAR(255) DEFAULT NULL,
      email VARCHAR(255) DEFAULT NULL,
      telefon VARCHAR(60) DEFAULT NULL,
      phone VARCHAR(60) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const cols = [
    ["foglalas_id", "INT NOT NULL"],
    ["booking_id", "INT NULL"],
    ["nev", "VARCHAR(255) NULL"],
    ["name", "VARCHAR(255) NULL"],
    ["email", "VARCHAR(255) NULL"],
    ["telefon", "VARCHAR(60) NULL"],
    ["phone", "VARCHAR(60) NULL"],
    ["created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ];

  for (const [name, sql] of cols) {
    await addColumnIfMissing("foglalas_vendegek", name, sql);
  }

  await addIndexIfMissing(
    "foglalas_vendegek",
    "idx_foglalas_vendegek_foglalas",
    "ALTER TABLE foglalas_vendegek ADD INDEX idx_foglalas_vendegek_foglalas (foglalas_id)"
  );
  await addIndexIfMissing(
    "foglalas_vendegek",
    "idx_foglalas_vendegek_booking",
    "ALTER TABLE foglalas_vendegek ADD INDEX idx_foglalas_vendegek_booking (booking_id)"
  );
}

async function seedRentalProductsIfEmpty() {
  const [rows] = await dbPromise.query(
    "SELECT COUNT(*) AS dbCount FROM berles_termekek"
  );
  const count = Number(rows?.[0]?.dbCount || 0);

  if (count > 0) return;

  const demoItems = [
    [
      "Trekking hátizsák 45L",
      "Hátizsák",
      "EXPLORE",
      5990,
      4.8,
      1.4,
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400",
      "Kényelmes, többnapos túrákra is alkalmas hátizsák.",
      6,
      1,
    ],
    [
      "Könnyű sátor 2 személyes",
      "Sátor",
      "NordPeak",
      8990,
      4.7,
      2.2,
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1400",
      "Gyorsan állítható, vízálló túrasátor.",
      4,
      1,
    ],
    [
      "Téli hálózsák",
      "Hálózsák",
      "TrailForge",
      4490,
      4.6,
      1.8,
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1400",
      "Hűvösebb időre tervezett, meleg hálózsák.",
      8,
      1,
    ],
    [
      "Önfelfújó matrac",
      "Matrac",
      "AlpineEdge",
      2990,
      4.5,
      0.9,
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1400",
      "Kompakt és kényelmes alátámasztás éjszakára.",
      10,
      1,
    ],
    [
      "Túrabot pár",
      "Trekking",
      "RiverRun",
      1990,
      4.4,
      0.6,
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1400",
      "Állítható hosszúságú, stabil túrabot szett.",
      12,
      1,
    ],
    [
      "Fejlámpa 400 lumen",
      "Biztonság",
      "SummitLab",
      1490,
      4.7,
      0.2,
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1400",
      "Erős fényű, esti túrákhoz ideális fejlámpa.",
      15,
      1,
    ],
    [
      "Gázfőző szett",
      "Főzés",
      "StoneWolf",
      3490,
      4.5,
      0.7,
      "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?w=1400",
      "Kompakt főzőkészlet gyors melegítéshez.",
      5,
      1,
    ],
    [
      "Thermo kulacs 1L",
      "Víz",
      "EXPLORE",
      990,
      4.3,
      0.4,
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1400",
      "Hidegen és melegen is sokáig tartja az italt.",
      20,
      1,
    ],
    [
      "Esőkabát",
      "Ruházat",
      "NordPeak",
      2590,
      4.4,
      0.5,
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400",
      "Vízlepergető, könnyű és jól pakolható kabát.",
      9,
      1,
    ],
    [
      "Túranavigáció GPS",
      "Navigáció",
      "TrailForge",
      7990,
      4.8,
      0.3,
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400",
      "Offline térképpel is használható kézi GPS eszköz.",
      3,
      1,
    ],
    [
      "SUP mellény",
      "Biztonság",
      "RiverRun",
      1790,
      4.2,
      0.6,
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400",
      "Vízi programokhoz kényelmes mentőmellény.",
      7,
      1,
    ],
    [
      "Prémium túrahátizsák 65L",
      "Hátizsák",
      "AlpineEdge",
      7490,
      4.9,
      1.9,
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400",
      "Nagy kapacitású, többnapos utakra tervezve.",
      4,
      1,
    ],
  ];

  await dbPromise.query(
    `INSERT INTO berles_termekek
      (nev, kategoria, marka, ar_per_nap, ertekeles, suly_kg, kep, leiras, darabszam, aktiv)
     VALUES ?`,
    [demoItems]
  );
}

async function tryMigrateOldBerlesTable() {
  const hasOldBerles = await tableExists("berles");
  if (!hasOldBerles) return;

  const [newRows] = await dbPromise.query(
    "SELECT COUNT(*) AS dbCount FROM berles_termekek"
  );
  const newCount = Number(newRows?.[0]?.dbCount || 0);
  if (newCount > 0) return;

  const oldCols = await getTableColumnsSet("berles");
  if (!oldCols.size) return;

  const nevCol = pickExistingColumn(oldCols, [
    "nev",
    "cim",
    "name",
    "termek_nev",
  ]);
  const katCol = pickExistingColumn(oldCols, ["kategoria", "category"]);
  const markaCol = pickExistingColumn(oldCols, ["marka", "brand"]);
  const arCol = pickExistingColumn(oldCols, [
    "ar_per_nap",
    "napi_ar",
    "ar",
    "price",
  ]);
  const ertekelesCol = pickExistingColumn(oldCols, ["ertekeles", "rating"]);
  const sulyCol = pickExistingColumn(oldCols, ["suly_kg", "suly", "weight"]);
  const kepCol = pickExistingColumn(oldCols, ["kep", "img", "image", "image_url"]);
  const leirasCol = pickExistingColumn(oldCols, ["leiras", "description"]);
  const darabCol = pickExistingColumn(oldCols, [
    "darabszam",
    "keszlet",
    "stock",
    "db",
  ]);
  const aktivCol = pickExistingColumn(oldCols, ["aktiv", "active"]);

  const nevExpr = nullSafeExpr(nevCol, "'Termék'");
  const katExpr = nullSafeExpr(katCol, "'Egyéb'");
  const markaExpr = nullSafeExpr(markaCol, "'EXPLORE'");
  const arExpr = arCol ? `COALESCE(${arCol}, 0)` : "0";
  const ertekelesExpr = ertekelesCol ? `COALESCE(${ertekelesCol}, 4.5)` : "4.5";
  const sulyExpr = sulyCol ? `COALESCE(${sulyCol}, NULL)` : "NULL";
  const kepExpr = nullSafeExpr(
    kepCol,
    "'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1400'"
  );
  const leirasExpr = nullSafeExpr(leirasCol, "'Bérelhető felszerelés'");
  const darabExpr = darabCol ? `COALESCE(${darabCol}, 0)` : "0";
  const aktivExpr = aktivCol ? `COALESCE(${aktivCol}, 1)` : "1";

  await dbPromise.query(`
    INSERT INTO berles_termekek
      (nev, kategoria, marka, ar_per_nap, ertekeles, suly_kg, kep, leiras, darabszam, aktiv)
    SELECT
      ${nevExpr},
      ${katExpr},
      ${markaExpr},
      ${arExpr},
      ${ertekelesExpr},
      ${sulyExpr},
      ${kepExpr},
      ${leirasExpr},
      ${darabExpr},
      ${aktivExpr}
    FROM berles
  `);
}

async function ensureBerlesTermekekTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS berles_termekek (
      id INT NOT NULL AUTO_INCREMENT,
      nev VARCHAR(255) NOT NULL,
      kategoria VARCHAR(100) DEFAULT NULL,
      marka VARCHAR(100) DEFAULT NULL,
      ar_per_nap INT NOT NULL DEFAULT 0,
      ertekeles DECIMAL(3,2) DEFAULT NULL,
      suly_kg DECIMAL(6,2) DEFAULT NULL,
      kep VARCHAR(2000) DEFAULT NULL,
      leiras TEXT DEFAULT NULL,
      darabszam INT NOT NULL DEFAULT 0,
      aktiv TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const cols = [
    ["nev", "VARCHAR(255) NOT NULL DEFAULT 'Termék'"],
    ["kategoria", "VARCHAR(100) NULL"],
    ["marka", "VARCHAR(100) NULL"],
    ["ar_per_nap", "INT NOT NULL DEFAULT 0"],
    ["ertekeles", "DECIMAL(3,2) NULL"],
    ["suly_kg", "DECIMAL(6,2) NULL"],
    ["kep", "VARCHAR(2000) NULL"],
    ["leiras", "TEXT NULL"],
    ["darabszam", "INT NOT NULL DEFAULT 0"],
    ["aktiv", "TINYINT(1) NOT NULL DEFAULT 1"],
    ["created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    [
      "updated_at",
      "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ],
  ];

  for (const [name, sql] of cols) {
    await addColumnIfMissing("berles_termekek", name, sql);
  }

  await tryMigrateOldBerlesTable();
  await seedRentalProductsIfEmpty();
}

async function ensureBerlesRendelesekTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS berles_rendelesek (
      id INT NOT NULL AUTO_INCREMENT,
      felhasznalo_id INT NOT NULL,
      termek_id INT NOT NULL,
      termek_nev VARCHAR(255) NOT NULL,
      mennyiseg INT NOT NULL DEFAULT 1,
      kezd DATE NOT NULL,
      vege DATE NOT NULL,
      napi_ar INT NOT NULL DEFAULT 0,
      vegosszeg INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'uj',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const cols = [
    ["felhasznalo_id", "INT NOT NULL DEFAULT 0"],
    ["termek_id", "INT NOT NULL DEFAULT 0"],
    ["termek_nev", "VARCHAR(255) NOT NULL DEFAULT 'Termék'"],
    ["mennyiseg", "INT NOT NULL DEFAULT 1"],
    ["kezd", "DATE NOT NULL"],
    ["vege", "DATE NOT NULL"],
    ["napi_ar", "INT NOT NULL DEFAULT 0"],
    ["vegosszeg", "INT NOT NULL DEFAULT 0"],
    ["status", "VARCHAR(50) NOT NULL DEFAULT 'uj'"],
    ["created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    [
      "updated_at",
      "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ],
  ];

  for (const [name, sql] of cols) {
    await addColumnIfMissing("berles_rendelesek", name, sql);
  }

  await addIndexIfMissing(
    "berles_rendelesek",
    "idx_berles_rendelesek_user",
    "ALTER TABLE berles_rendelesek ADD INDEX idx_berles_rendelesek_user (felhasznalo_id)"
  );
  await addIndexIfMissing(
    "berles_rendelesek",
    "idx_berles_rendelesek_termek",
    "ALTER TABLE berles_rendelesek ADD INDEX idx_berles_rendelesek_termek (termek_id)"
  );
  await addIndexIfMissing(
    "berles_rendelesek",
    "idx_berles_rendelesek_status",
    "ALTER TABLE berles_rendelesek ADD INDEX idx_berles_rendelesek_status (status)"
  );
}

async function getRentalStatsSafe() {
  try {
    const exists = await tableExists("berles_rendelesek");

    if (!exists) {
      return {
        totalRentalOrders: 0,
        pendingRentalOrders: 0,
        totalRentalRevenue: 0,
      };
    }

    const [rows] = await dbPromise.query(`
      SELECT
        COUNT(*) AS totalRentalOrders,
        SUM(CASE WHEN status = 'uj' THEN 1 ELSE 0 END) AS pendingRentalOrders,
        COALESCE(SUM(vegosszeg), 0) AS totalRentalRevenue
      FROM berles_rendelesek
    `);

    const stats = rows?.[0] || {};

    return {
      totalRentalOrders: Number(stats.totalRentalOrders || 0),
      pendingRentalOrders: Number(stats.pendingRentalOrders || 0),
      totalRentalRevenue: Number(stats.totalRentalRevenue || 0),
    };
  } catch (error) {
    console.error("❌ RENTAL STATS HIBA:", error.message);
    return {
      totalRentalOrders: 0,
      pendingRentalOrders: 0,
      totalRentalRevenue: 0,
    };
  }
}

async function ensureAdminUserIfEmpty() {
  const [rows] = await dbPromise.query(
    "SELECT COUNT(*) AS dbCount FROM felhasznalok"
  );
  const count = Number(rows?.[0]?.dbCount || 0);

  if (count > 0) return;

  const hashedPassword = await bcrypt.hash("Teszt123!", 10);

  await dbPromise.query(
    `INSERT INTO felhasznalok
      (nev, email, jelszo, szerepkor, aktiv, profilkep, varos, szuletesi_datum)
     VALUES (?, ?, ?, 'admin', 1, NULL, NULL, NULL)`,
    ["Admin", "admin@explore.hu", hashedPassword]
  );

  console.log("✅ Alap admin felhasználó létrehozva: admin@explore.hu / Teszt123!");
}

async function ensureTables() {
  await ensureFelhasznalokTableShape();
  await ensureKapcsolatUzenetekTableShape();
  await ensureTurakTableShape();
  await ensureFoglalasokTableShape();
  await ensureFoglalasVendegekTableShape();
  await ensureBerlesTermekekTableShape();
  await ensureBerlesRendelesekTableShape();
  await ensureAdminUserIfEmpty();
}

/* =====================================
   MULTER
===================================== */
function buildUploadFileName(file, prefix = "img") {
  const ext = (path.extname(file.originalname || "") || ".jpg").toLowerCase();
  const rawBase = path.basename(file.originalname || prefix, ext);
  const safeBase = slugify(rawBase) || prefix;

  return `${safeBase}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 10)}${ext}`;
}

function imageFileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Csak képfájl tölthető fel!"));
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    cb(null, buildUploadFileName(file, "avatar"));
  },
});

const berlesStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BERLES_UPLOAD_DIR),
  filename: (req, file, cb) => {
    cb(null, buildUploadFileName(file, "berles"));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

const uploadBerlesImage = multer({
  storage: berlesStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

/* =====================================
   ROUTES
===================================== */

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend fut 🚀" });
});

/* ===== KAPCSOLAT / ÍRJ NEKÜNK ===== */
app.post("/api/contact", async (req, res) => {
  try {
    const { nev, email, targy, uzenet } = req.body;

    if (!nev || !String(nev).trim()) {
      return res.status(400).json({ error: "A név megadása kötelező." });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Az email cím megadása kötelező." });
    }

    if (!uzenet || !String(uzenet).trim()) {
      return res.status(400).json({ error: "Az üzenet megadása kötelező." });
    }

    const cleanNev = String(nev).trim();
    const cleanEmail = String(email).trim();
    const cleanTargy = String(targy || "").trim() || null;
    const cleanUzenet = String(uzenet).trim();

    await dbPromise.query(
      `
      INSERT INTO kapcsolat_uzenetek
      (user_id, nev, email, targy, uzenet, status)
      VALUES (?, ?, ?, ?, ?, 'uj')
      `,
      [null, cleanNev, cleanEmail, cleanTargy, cleanUzenet]
    );

    return res.status(201).json({
      message:
        "Köszönjük az üzenetedet! Hamarosan felvesszük veled a kapcsolatot.",
    });
  } catch (error) {
    console.error("❌ CONTACT HIBA:", error.message);
    return res.status(500).json({
      error: "Nem sikerült elküldeni az üzenetet. Próbáld meg újra.",
    });
  }
});

/* ===== ADMIN CONTACT MESSAGES ===== */
app.get(
  "/api/admin/contact-messages",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [rows] = await dbPromise.query(`
        SELECT
          ku.id,
          ku.user_id,
          ku.nev,
          ku.email,
          ku.targy,
          ku.uzenet,
          ku.status,
          ku.admin_valasz,
          ku.admin_id,
          ku.valaszolva_ekkor,
          ku.letrehozva,
          f.nev AS admin_nev
        FROM kapcsolat_uzenetek ku
        LEFT JOIN felhasznalok f ON f.id = ku.admin_id
        ORDER BY ku.letrehozva DESC, ku.id DESC
      `);

      res.json(rows || []);
    } catch (error) {
      console.error("❌ ADMIN CONTACT LIST HIBA:", error.message);
      res.status(500).json({ error: "Nem sikerült betölteni az üzeneteket." });
    }
  }
);

app.put(
  "/api/admin/contact-messages/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const { status } = req.body;

      if (!messageId || Number.isNaN(messageId)) {
        return res.status(400).json({ error: "Érvénytelen üzenet azonosító!" });
      }

      if (!["uj", "folyamatban", "megvalaszolva", "lezarva"].includes(status)) {
        return res.status(400).json({ error: "Érvénytelen státusz!" });
      }

      const [existing] = await dbPromise.query(
        "SELECT id FROM kapcsolat_uzenetek WHERE id = ? LIMIT 1",
        [messageId]
      );

      if (!existing.length) {
        return res.status(404).json({ error: "Az üzenet nem található!" });
      }

      await dbPromise.query(
        "UPDATE kapcsolat_uzenetek SET status = ? WHERE id = ?",
        [status, messageId]
      );

      res.json({ message: "Üzenet státusz frissítve." });
    } catch (error) {
      console.error("❌ ADMIN CONTACT STATUS HIBA:", error.message);
      res.status(500).json({ error: "Nem sikerült frissíteni a státuszt." });
    }
  }
);

app.put(
  "/api/admin/contact-messages/:id/reply",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const { adminValasz } = req.body;

      if (!messageId || Number.isNaN(messageId)) {
        return res.status(400).json({ error: "Érvénytelen üzenet azonosító!" });
      }

      if (!adminValasz || !String(adminValasz).trim()) {
        return res.status(400).json({ error: "Az admin válasz nem lehet üres." });
      }

      const [rows] = await dbPromise.query(
        `
        SELECT id, nev, email, targy
        FROM kapcsolat_uzenetek
        WHERE id = ?
        LIMIT 1
        `,
        [messageId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Az üzenet nem található!" });
      }

      const targetMessage = rows[0];
      const cleanReply = String(adminValasz).trim();

      await sendContactReplyEmail({
        toEmail: targetMessage.email,
        toName: targetMessage.nev,
        subject: targetMessage.targy || "Kapcsolati megkeresés",
        adminReply: cleanReply,
      });

      await dbPromise.query(
        `
        UPDATE kapcsolat_uzenetek
        SET
          admin_valasz = ?,
          admin_id = ?,
          status = 'megvalaszolva',
          valaszolva_ekkor = NOW()
        WHERE id = ?
        `,
        [cleanReply, req.user.id, messageId]
      );

      res.json({ message: "Admin válasz elmentve és emailben elküldve." });
    } catch (error) {
      console.error("❌ ADMIN CONTACT REPLY HIBA:", error);
      res.status(500).json({
        error:
          error?.message || "Nem sikerült elmenteni és elküldeni a választ.",
      });
    }
  }
);

app.delete(
  "/api/admin/contact-messages/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const messageId = Number(req.params.id);

      if (!messageId || Number.isNaN(messageId)) {
        return res.status(400).json({ error: "Érvénytelen üzenet azonosító!" });
      }

      const [existing] = await dbPromise.query(
        "SELECT id FROM kapcsolat_uzenetek WHERE id = ? LIMIT 1",
        [messageId]
      );

      if (!existing.length) {
        return res.status(404).json({ error: "Az üzenet nem található!" });
      }

      await dbPromise.query("DELETE FROM kapcsolat_uzenetek WHERE id = ?", [
        messageId,
      ]);

      res.json({ message: "Üzenet sikeresen törölve." });
    } catch (error) {
      console.error("❌ CONTACT DELETE HIBA:", error.message);
      res.status(500).json({ error: "Nem sikerült törölni az üzenetet." });
    }
  }
);

/* ===== TÚRÁK LISTA MINDENKINEK ===== */
app.get("/api/tours", async (req, res) => {
  try {
    const statsJoinSql = await getTourStatsJoinSql();

    const [rows] = await dbPromise.query(`
      SELECT
        t.id,
        t.slug,
        t.cim,
        t.rovid_leiras,
        t.leiras,
        t.kategoria,
        t.nehezseg,
        t.idotartam,
        t.badge,
        t.ar,
        t.kep,
        t.letszam_max,
        t.aktiv,
        t.created_at,
        t.updated_at,
        COALESCE(f.joined_count, 0) AS joined_count
      FROM turak t
      ${statsJoinSql}
      WHERE t.aktiv = 1
      ORDER BY t.id DESC
    `);

    res.json(rows.map(mapTourRow));
  } catch (error) {
    console.error("❌ TOURS GET HIBA:", error.message);
    res.status(500).json({ error: "Nem sikerült betölteni a túrákat." });
  }
});

/* ===== EGY TÚRA LEKÉRÉSE ===== */
app.get("/api/tours/:identifier", async (req, res) => {
  try {
    const identifier = String(req.params.identifier || "").trim();
    const numericId = Number(identifier);
    const safeNumericId = Number.isNaN(numericId) ? -1 : numericId;
    const statsJoinSql = await getTourStatsJoinSql();

    const [rows] = await dbPromise.query(
      `
      SELECT
        t.id,
        t.slug,
        t.cim,
        t.rovid_leiras,
        t.leiras,
        t.kategoria,
        t.nehezseg,
        t.idotartam,
        t.badge,
        t.ar,
        t.kep,
        t.letszam_max,
        t.aktiv,
        t.created_at,
        t.updated_at,
        COALESCE(f.joined_count, 0) AS joined_count
      FROM turak t
      ${statsJoinSql}
      WHERE t.aktiv = 1
        AND (t.slug = ? OR t.id = ?)
      LIMIT 1
      `,
      [identifier, safeNumericId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "A túra nem található." });
    }

    res.json(mapTourRow(rows[0]));
  } catch (error) {
    console.error("❌ TOUR GET ONE HIBA:", error.message);
    res.status(500).json({ error: "Nem sikerült betölteni a túrát." });
  }
});

/* ===== BÉRLÉS TERMÉKEK LISTA ===== */
app.get("/api/berles-termekek", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT
        id,
        nev,
        kategoria,
        marka,
        ar_per_nap,
        ertekeles,
        suly_kg,
        kep,
        leiras,
        darabszam,
        aktiv
      FROM berles_termekek
      WHERE aktiv = 1
      ORDER BY id DESC
    `);

    res.json((rows || []).map(mapRentalRow));
  } catch (error) {
    console.error("❌ BERLES TERMÉKEK HIBA:", error.message);
    return res.status(500).json({ error: "DB hiba" });
  }
});

/* ===== ADMIN BÉRLÉS TERMÉKEK LISTA ===== */
app.get(
  "/api/admin/berles-termekek",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [rows] = await dbPromise.query(`
        SELECT
          id,
          nev,
          kategoria,
          marka,
          ar_per_nap,
          ertekeles,
          suly_kg,
          kep,
          leiras,
          darabszam,
          aktiv,
          created_at,
          updated_at
        FROM berles_termekek
        ORDER BY id DESC
      `);

      res.json((rows || []).map(mapRentalRow));
    } catch (error) {
      console.error("❌ ADMIN BÉRLÉS LISTA HIBA:", error.message);
      return res.status(500).json({ error: "Nem sikerült betölteni a termékeket." });
    }
  }
);

/* ===== ADMIN BÉRLÉS TERMÉK LÉTREHOZÁS ===== */
app.post(
  "/api/admin/berles-termekek",
  authMiddleware,
  adminMiddleware,
  uploadBerlesImage.single("kep"),
  async (req, res) => {
    try {
      const nev = String(req.body.nev || "").trim();
      const kategoria = String(req.body.kategoria || "Egyéb").trim() || "Egyéb";
      const marka = String(req.body.marka || "EXPLORE").trim() || "EXPLORE";
      const leiras = String(req.body.leiras || "").trim() || null;

      const arPerNap = parseNonNegativeInt(req.body.ar_per_nap, 0);
      const darabszam = parseNonNegativeInt(req.body.darabszam, 0);
      const aktiv = parseBooleanInput(req.body.aktiv, true) ? 1 : 0;

      const ertekeles = parseNullableNumber(req.body.ertekeles);
      const sulyKg = parseNullableNumber(req.body.suly_kg);
      const kep = getRentalImagePathFromRequest(req, null);

      if (!nev) {
        return res.status(400).json({ error: "A termék neve kötelező!" });
      }

      if (ertekeles !== null && (ertekeles < 0 || ertekeles > 5)) {
        return res.status(400).json({ error: "Az értékelés 0 és 5 között lehet." });
      }

      if (sulyKg !== null && sulyKg < 0) {
        return res.status(400).json({ error: "A súly nem lehet negatív." });
      }

      const [insertResult] = await dbPromise.query(
        `
        INSERT INTO berles_termekek
          (nev, kategoria, marka, ar_per_nap, ertekeles, suly_kg, kep, leiras, darabszam, aktiv)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nev,
          kategoria,
          marka,
          arPerNap,
          ertekeles,
          sulyKg,
          kep,
          leiras,
          darabszam,
          aktiv,
        ]
      );

      const [rows] = await dbPromise.query(
        `
        SELECT
          id,
          nev,
          kategoria,
          marka,
          ar_per_nap,
          ertekeles,
          suly_kg,
          kep,
          leiras,
          darabszam,
          aktiv
        FROM berles_termekek
        WHERE id = ?
        LIMIT 1
        `,
        [insertResult.insertId]
      );

      return res.status(201).json({
        message: "Bérlés termék sikeresen létrehozva!",
        item: mapRentalRow(rows[0]),
      });
    } catch (error) {
      console.error("❌ ADMIN BÉRLÉS CREATE HIBA:", error.message);
      return res.status(500).json({
        error: error.message || "Nem sikerült létrehozni a bérlés terméket.",
      });
    }
  }
);

/* ===== ADMIN BÉRLÉS TERMÉK FRISSÍTÉS ===== */
app.put(
  "/api/admin/berles-termekek/:id",
  authMiddleware,
  adminMiddleware,
  uploadBerlesImage.single("kep"),
  async (req, res) => {
    try {
      const itemId = Number(req.params.id);

      if (!itemId || Number.isNaN(itemId)) {
        return res.status(400).json({ error: "Érvénytelen termék azonosító!" });
      }

      const [existingRows] = await dbPromise.query(
        `
        SELECT
          id,
          nev,
          kategoria,
          marka,
          ar_per_nap,
          ertekeles,
          suly_kg,
          kep,
          leiras,
          darabszam,
          aktiv
        FROM berles_termekek
        WHERE id = ?
        LIMIT 1
        `,
        [itemId]
      );

      if (!existingRows.length) {
        return res.status(404).json({ error: "A termék nem található!" });
      }

      const existing = existingRows[0];
      const hasBody = (field) =>
        Object.prototype.hasOwnProperty.call(req.body || {}, field);

      const nev = hasBody("nev")
        ? String(req.body.nev || "").trim()
        : String(existing.nev || "").trim();

      const kategoria = hasBody("kategoria")
        ? String(req.body.kategoria || "").trim() || "Egyéb"
        : String(existing.kategoria || "Egyéb").trim();

      const marka = hasBody("marka")
        ? String(req.body.marka || "").trim() || "EXPLORE"
        : String(existing.marka || "EXPLORE").trim();

      const leiras = hasBody("leiras")
        ? String(req.body.leiras || "").trim() || null
        : existing.leiras || null;

      const arPerNap = hasBody("ar_per_nap")
        ? parseNonNegativeInt(req.body.ar_per_nap, Number(existing.ar_per_nap || 0))
        : Number(existing.ar_per_nap || 0);

      const darabszam = hasBody("darabszam")
        ? parseNonNegativeInt(req.body.darabszam, Number(existing.darabszam || 0))
        : Number(existing.darabszam || 0);

      const aktiv = hasBody("aktiv")
        ? (parseBooleanInput(req.body.aktiv, !!existing.aktiv) ? 1 : 0)
        : Number(existing.aktiv ? 1 : 0);

      const ertekeles = hasBody("ertekeles")
        ? parseNullableNumber(req.body.ertekeles)
        : existing.ertekeles === null || typeof existing.ertekeles === "undefined"
        ? null
        : Number(existing.ertekeles);

      const sulyKg = hasBody("suly_kg")
        ? parseNullableNumber(req.body.suly_kg)
        : existing.suly_kg === null || typeof existing.suly_kg === "undefined"
        ? null
        : Number(existing.suly_kg);

      const nextKep = getRentalImagePathFromRequest(req, existing.kep || null);

      if (!nev) {
        return res.status(400).json({ error: "A termék neve kötelező!" });
      }

      if (ertekeles !== null && (ertekeles < 0 || ertekeles > 5)) {
        return res.status(400).json({ error: "Az értékelés 0 és 5 között lehet." });
      }

      if (sulyKg !== null && sulyKg < 0) {
        return res.status(400).json({ error: "A súly nem lehet negatív." });
      }

      await dbPromise.query(
        `
        UPDATE berles_termekek
        SET
          nev = ?,
          kategoria = ?,
          marka = ?,
          ar_per_nap = ?,
          ertekeles = ?,
          suly_kg = ?,
          kep = ?,
          leiras = ?,
          darabszam = ?,
          aktiv = ?
        WHERE id = ?
        `,
        [
          nev,
          kategoria,
          marka,
          arPerNap,
          ertekeles,
          sulyKg,
          nextKep,
          leiras,
          darabszam,
          aktiv,
          itemId,
        ]
      );

      if (existing.kep && existing.kep !== nextKep) {
        deleteLocalImage(existing.kep);
      }

      const [rows] = await dbPromise.query(
        `
        SELECT
          id,
          nev,
          kategoria,
          marka,
          ar_per_nap,
          ertekeles,
          suly_kg,
          kep,
          leiras,
          darabszam,
          aktiv
        FROM berles_termekek
        WHERE id = ?
        LIMIT 1
        `,
        [itemId]
      );

      return res.json({
        message: "Bérlés termék sikeresen frissítve!",
        item: mapRentalRow(rows[0]),
      });
    } catch (error) {
      console.error("❌ ADMIN BÉRLÉS UPDATE HIBA:", error.message);
      return res.status(500).json({
        error: error.message || "Nem sikerült frissíteni a bérlés terméket.",
      });
    }
  }
);

/* ===== ADMIN BÉRLÉS TERMÉK TÖRLÉS ===== */
app.delete(
  "/api/admin/berles-termekek/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const itemId = Number(req.params.id);

      if (!itemId || Number.isNaN(itemId)) {
        return res.status(400).json({ error: "Érvénytelen termék azonosító!" });
      }

      const [rows] = await dbPromise.query(
        "SELECT id, kep FROM berles_termekek WHERE id = ? LIMIT 1",
        [itemId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "A termék nem található!" });
      }

      const existing = rows[0];

      await dbPromise.query("DELETE FROM berles_termekek WHERE id = ?", [itemId]);

      if (existing.kep) {
        deleteLocalImage(existing.kep);
      }

      return res.json({ message: "Bérlés termék sikeresen törölve." });
    } catch (error) {
      console.error("❌ ADMIN BÉRLÉS DELETE HIBA:", error.message);
      return res.status(500).json({
        error: error.message || "Nem sikerült törölni a bérlés terméket.",
      });
    }
  }
);

/* ===== ADMIN BÉRLÉS TERMÉK STÁTUSZ ===== */
app.put(
  "/api/admin/berles-termekek/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const itemId = Number(req.params.id);

      if (!itemId || Number.isNaN(itemId)) {
        return res.status(400).json({ error: "Érvénytelen termék azonosító!" });
      }

      const aktiv = parseBooleanInput(req.body?.aktiv, true) ? 1 : 0;

      const [rows] = await dbPromise.query(
        "SELECT id FROM berles_termekek WHERE id = ? LIMIT 1",
        [itemId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "A termék nem található!" });
      }

      await dbPromise.query(
        "UPDATE berles_termekek SET aktiv = ? WHERE id = ?",
        [aktiv, itemId]
      );

      return res.json({
        message: aktiv
          ? "A bérlés termék újra aktív."
          : "A bérlés termék inaktív lett.",
      });
    } catch (error) {
      console.error("❌ ADMIN BÉRLÉS STATUS HIBA:", error.message);
      return res.status(500).json({
        error: error.message || "Nem sikerült frissíteni a termék státuszát.",
      });
    }
  }
);

/* ===== TÚRA FOGLALÁS ===== */
app.post("/api/foglalas", authMiddleware, async (req, res) => {
  const {
    tourId,
    date,
    people,
    name,
    email,
    phone,
    experience,
    health,
    emergencyName,
    emergencyPhone,
    rental,
    note,
    paymentMethod,
    guests,
  } = req.body;

  if (!tourId) {
    return res.status(400).json({ error: "Hiányzik a túra azonosító!" });
  }

  if (!date || !isValidSqlDateString(date)) {
    return res.status(400).json({ error: "Adj meg érvényes dátumot!" });
  }

  const parsedPeople = Number(people);

  if (!parsedPeople || Number.isNaN(parsedPeople) || parsedPeople < 1) {
    return res.status(400).json({ error: "A létszám minimum 1 fő lehet!" });
  }

  if (parsedPeople > 20) {
    return res.status(400).json({ error: "Egyszerre maximum 20 fő foglalható!" });
  }

  if (!name || !email || !phone) {
    return res.status(400).json({
      error: "A foglaló neve, email címe és telefonszáma kötelező!",
    });
  }

  if (!emergencyName || !emergencyPhone) {
    return res.status(400).json({
      error: "A vészhelyzeti kontakt adatai kötelezőek!",
    });
  }

  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
  const paymentStatus = getPaymentStatusFromMethod(normalizedPaymentMethod);

  const guestCount = Math.max(0, parsedPeople - 1);
  const normalizedGuests = (Array.isArray(guests) ? guests : [])
    .slice(0, guestCount)
    .map((guest) => ({
      name: String(guest?.name || "").trim(),
      email: String(guest?.email || "").trim(),
      phone: String(guest?.phone || "").trim(),
    }));

  if (guestCount > 0 && normalizedGuests.length !== guestCount) {
    return res.status(400).json({
      error: "A vendégek száma nem egyezik a megadott létszámmal.",
    });
  }

  for (let i = 0; i < normalizedGuests.length; i += 1) {
    if (!normalizedGuests[i].name) {
      return res
        .status(400)
        .json({ error: `A(z) ${i + 1}. vendég neve kötelező!` });
    }
  }

  let connection;

  try {
    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const identifier = String(tourId).trim();
    const numericId = Number(identifier);
    const safeNumericId = Number.isNaN(numericId) ? -1 : numericId;

    const [tourRows] = await connection.query(
      `
      SELECT id, slug, cim, badge, idotartam, ar, aktiv, letszam_max
      FROM turak
      WHERE aktiv = 1 AND (slug = ? OR id = ?)
      LIMIT 1
      FOR UPDATE
      `,
      [identifier, safeNumericId]
    );

    if (!tourRows.length) {
      throw makeError("A kiválasztott túra nem található.", 404);
    }

    const tour = tourRows[0];
    const paymentAmount = Number(tour.ar || 0) * parsedPeople;

    const foglalasColumns = await getTableColumnsSet("foglalasok");
    const tourIdExpr = getFoglalasTourIdExpr(foglalasColumns);
    const peopleExpr = getFoglalasPeopleExpr(foglalasColumns);

    let joinedCount = 0;

    if (tourIdExpr && peopleExpr && setHas(foglalasColumns, "status")) {
      const [joinedRows] = await connection.query(
        `
        SELECT COALESCE(SUM(${peopleExpr}), 0) AS joinedCount
        FROM foglalasok
        WHERE ${tourIdExpr} = ?
          AND status IN ('uj', 'confirmed', 'paid')
        `,
        [tour.id]
      );

      joinedCount = Number(joinedRows?.[0]?.joinedCount || 0);
    }

    const maxPeople = Number(tour.letszam_max || 20);

    if (joinedCount + parsedPeople > maxPeople) {
      const remaining = Math.max(0, maxPeople - joinedCount);
      throw makeError(
        remaining <= 0
          ? "Ez a túra már betelt!"
          : `Erre a túrára már csak ${remaining} főnek maradt hely.`,
        400
      );
    }

    const insertColumns = [];
    const insertValues = [];

    const pushIfExists = (columnName, value) => {
      if (setHas(foglalasColumns, columnName)) {
        insertColumns.push(columnName);
        insertValues.push(value);
      }
    };

    pushIfExists("felhasznalo_id", req.user.id);
    pushIfExists("user_id", req.user.id);

    pushIfExists("tura_id", tour.id);
    pushIfExists("tour_id", tour.id);

    pushIfExists("tura_slug", tour.slug);
    pushIfExists("tour_slug", tour.slug);

    pushIfExists("tura_cim", tour.cim);
    pushIfExists("tour_title", tour.cim);

    pushIfExists("datum", date);
    pushIfExists("date", date);

    pushIfExists("letszam", parsedPeople);
    pushIfExists("people", parsedPeople);

    pushIfExists("nev", String(name).trim());
    pushIfExists("foglalo_nev", String(name).trim());
    pushIfExists("name", String(name).trim());

    pushIfExists("foglalo_email", String(email).trim());
    pushIfExists("email", String(email).trim());

    pushIfExists("telefon", String(phone).trim());
    pushIfExists("foglalo_telefon", String(phone).trim());
    pushIfExists("phone", String(phone).trim());

    pushIfExists("tapasztalat", String(experience || "Kezdő").trim());
    pushIfExists("experience", String(experience || "Kezdő").trim());

    pushIfExists("egeszseg", String(health || "").trim() || null);
    pushIfExists("health", String(health || "").trim() || null);

    pushIfExists("veszhelyzeti_nev", String(emergencyName).trim());
    pushIfExists("emergency_name", String(emergencyName).trim());

    pushIfExists("veszhelyzeti_telefon", String(emergencyPhone).trim());
    pushIfExists("emergency_phone", String(emergencyPhone).trim());

    pushIfExists("felszereles_berles", String(rental || "Nem").trim());
    pushIfExists("rental", String(rental || "Nem").trim());

    pushIfExists("megjegyzes", String(note || "").trim() || null);
    pushIfExists("note", String(note || "").trim() || null);

    pushIfExists("payment_method", normalizedPaymentMethod);
    pushIfExists("payment_status", paymentStatus);
    pushIfExists("payment_amount", paymentAmount);

    pushIfExists("status", "uj");

    if (!insertColumns.length) {
      throw makeError("A foglalás tábla szerkezete hibás.", 500);
    }

    const placeholders = insertColumns.map(() => "?").join(", ");

    const [insertResult] = await connection.query(
      `
      INSERT INTO foglalasok (${insertColumns.join(", ")})
      VALUES (${placeholders})
      `,
      insertValues
    );

    const bookingId = insertResult.insertId;

    let paymentReference = null;
    let paymentDueDate = null;
    let bankTransfer = null;

    if (normalizedPaymentMethod === "atutalas") {
      paymentReference = getTransferReference(bookingId);
      paymentDueDate = getFutureSqlDate(3);
      bankTransfer = getBankTransferConfig();

      const updateCols = [];
      const updateVals = [];

      if (setHas(foglalasColumns, "payment_reference")) {
        updateCols.push("payment_reference = ?");
        updateVals.push(paymentReference);
      }

      if (setHas(foglalasColumns, "payment_due_date")) {
        updateCols.push("payment_due_date = ?");
        updateVals.push(paymentDueDate);
      }

      if (updateCols.length > 0) {
        updateVals.push(bookingId);

        await connection.query(
          `UPDATE foglalasok SET ${updateCols.join(", ")} WHERE id = ?`,
          updateVals
        );
      }
    }

    if (normalizedGuests.length > 0) {
      const guestColumns = await getTableColumnsSet("foglalas_vendegek");

      if (guestColumns.size > 0) {
        const guestInsertColumns = [];

        const pushGuestColIfExists = (columnName) => {
          if (setHas(guestColumns, columnName)) {
            guestInsertColumns.push(columnName);
          }
        };

        pushGuestColIfExists("foglalas_id");
        pushGuestColIfExists("booking_id");
        pushGuestColIfExists("nev");
        pushGuestColIfExists("name");
        pushGuestColIfExists("email");
        pushGuestColIfExists("telefon");
        pushGuestColIfExists("phone");

        if (guestInsertColumns.length > 0) {
          const guestRows = normalizedGuests.map((guest) => {
            const row = [];

            for (const col of guestInsertColumns) {
              if (col === "foglalas_id" || col === "booking_id") {
                row.push(bookingId);
              } else if (col === "nev" || col === "name") {
                row.push(guest.name);
              } else if (col === "email") {
                row.push(guest.email || null);
              } else if (col === "telefon" || col === "phone") {
                row.push(guest.phone || null);
              }
            }

            return row;
          });

          const guestPlaceholders = guestInsertColumns.map(() => "?").join(", ");

          await connection.query(
            `
            INSERT INTO foglalas_vendegek (${guestInsertColumns.join(", ")})
            VALUES ${guestRows.map(() => `(${guestPlaceholders})`).join(", ")}
            `,
            guestRows.flat()
          );
        }
      }
    }

    await connection.commit();

    let emailSent = false;
    let emailWarning = "";

    try {
      await sendBookingConfirmationEmail({
        toEmail: String(email).trim(),
        toName: String(name).trim(),
        bookingId,
        tourTitle: tour.cim,
        date,
        people: parsedPeople,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus,
        paymentAmount,
        paymentReference,
        paymentDueDate,
        bankTransfer,
      });

      emailSent = true;
    } catch (mailError) {
      console.error("❌ BOOKING EMAIL HIBA:", mailError.message);
      emailWarning =
        mailError?.message || "A visszaigazoló email küldése nem sikerült.";
    }

    const newJoinedCount = joinedCount + parsedPeople;
    const remainingPlaces = Math.max(0, maxPeople - newJoinedCount);

    return res.status(201).json({
      message: "Foglalás sikeresen rögzítve!",
      booking: {
        id: bookingId,
        tourId: tour.id,
        tourTitle: tour.cim,
        date,
        people: parsedPeople,
        guests: normalizedGuests.length,
        joinedCount: newJoinedCount,
        remainingPlaces,
      },
      payment: {
        method: normalizedPaymentMethod,
        methodLabel: getPaymentMethodLabel(normalizedPaymentMethod),
        status: paymentStatus,
        statusLabel: getPaymentStatusLabel(paymentStatus),
        amount: paymentAmount,
        reference: paymentReference,
        dueDate: paymentDueDate,
      },
      bankTransfer:
        normalizedPaymentMethod === "atutalas"
          ? {
              ...bankTransfer,
              reference: paymentReference,
              dueDate: paymentDueDate,
              dueDateLabel: formatDateHu(paymentDueDate),
            }
          : null,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("❌ FOGLALAS HIBA:", error.message);

    return res
      .status(error.status || 500)
      .json({ error: error.message || "Foglalási hiba történt." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/* ===== BÉRLÉS CHECKOUT / KOSÁR LEZÁRÁS ===== */
app.post("/api/berles/checkout", authMiddleware, async (req, res) => {
  const { items, kezd, vege } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Üres a kosár!" });
  }

  if (!kezd || !vege) {
    return res.status(400).json({ error: "Add meg a kezdő és végdátumot!" });
  }

  const kezdDate = new Date(`${kezd}T00:00:00`);
  const vegeDate = new Date(`${vege}T00:00:00`);

  if (Number.isNaN(kezdDate.getTime()) || Number.isNaN(vegeDate.getTime())) {
    return res.status(400).json({ error: "Érvénytelen dátum!" });
  }

  if (vegeDate < kezdDate) {
    return res
      .status(400)
      .json({ error: "A végdátum nem lehet korábbi, mint a kezdődátum!" });
  }

  const napok =
    Math.floor((vegeDate - kezdDate) / (1000 * 60 * 60 * 24)) + 1;

  const normalizedMap = new Map();

  for (const rawItem of items) {
    const termekId = Number(rawItem.termekId || rawItem.id);
    const mennyiseg = Number(rawItem.mennyiseg || rawItem.quantity || 1);

    if (!termekId || Number.isNaN(termekId)) continue;
    if (!mennyiseg || Number.isNaN(mennyiseg) || mennyiseg < 1) continue;

    normalizedMap.set(
      termekId,
      (normalizedMap.get(termekId) || 0) + mennyiseg
    );
  }

  const normalizedItems = Array.from(normalizedMap.entries()).map(
    ([termekId, mennyiseg]) => ({
      termekId,
      mennyiseg,
    })
  );

  if (!normalizedItems.length) {
    return res.status(400).json({ error: "Nincs érvényes termék a kosárban!" });
  }

  let connection;

  try {
    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const ids = normalizedItems.map((item) => item.termekId);

    const [products] = await connection.query(
      `SELECT id, nev, ar_per_nap, darabszam, aktiv
       FROM berles_termekek
       WHERE id IN (?)
       FOR UPDATE`,
      [ids]
    );

    if (products.length !== ids.length) {
      throw makeError("Egy vagy több termék nem található!");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of normalizedItems) {
      const product = productMap.get(item.termekId);

      if (!product) {
        throw makeError("Egy vagy több termék nem található!");
      }

      if (!product.aktiv) {
        throw makeError(`${product.nev} jelenleg nem aktív.`);
      }

      if (Number(product.darabszam) <= 0) {
        throw makeError(`${product.nev} elfogyott!`);
      }

      if (Number(product.darabszam) < item.mennyiseg) {
        throw makeError(
          `${product.nev} termékből csak ${product.darabszam} db maradt.`
        );
      }
    }

    let vegosszeg = 0;
    const insertRows = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.termekId);
      const lineTotal = Number(product.ar_per_nap || 0) * item.mennyiseg * napok;

      await connection.query(
        "UPDATE berles_termekek SET darabszam = darabszam - ? WHERE id = ?",
        [item.mennyiseg, item.termekId]
      );

      insertRows.push([
        req.user.id,
        item.termekId,
        product.nev,
        item.mennyiseg,
        kezd,
        vege,
        Number(product.ar_per_nap || 0),
        lineTotal,
        "uj",
      ]);

      vegosszeg += lineTotal;
    }

    await connection.query(
      `INSERT INTO berles_rendelesek
      (felhasznalo_id, termek_id, termek_nev, mennyiseg, kezd, vege, napi_ar, vegosszeg, status)
      VALUES ?`,
      [insertRows]
    );

    await connection.commit();

    res.json({
      message: "Sikeres foglalás!",
      napok,
      vegosszeg,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("❌ CHECKOUT HIBA:", error.message);

    return res
      .status(error.status || 500)
      .json({ error: error.message || "Foglalási hiba" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/* ===== REGISTER ===== */
app.post("/api/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nev,
      email,
      password,
      city,
      varos,
      birthDate,
      szuletesi_datum,
      gender,
      nem,
    } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");
    const cleanFirstName = String(firstName || "").trim();
    const cleanLastName = String(lastName || "").trim();
    const cleanFullName =
      String(nev || "").trim() ||
      `${cleanLastName} ${cleanFirstName}`.trim() ||
      cleanFirstName ||
      cleanLastName;

    const cleanCity = normalizeCity(city || varos || "");
    const cleanBirthDate = birthDate || szuletesi_datum || null;
    const cleanNem = String(gender || nem || "").trim() || null;

    if (!cleanFullName || !cleanEmail || !cleanPassword) {
      return res
        .status(400)
        .json({ error: "A név, email és jelszó megadása kötelező!" });
    }

    if (cleanPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "A jelszó legalább 6 karakter legyen!" });
    }

    if (cleanBirthDate && !isValidSqlDateString(cleanBirthDate)) {
      return res.status(400).json({ error: "Érvénytelen születési dátum!" });
    }

    const [existing] = await dbPromise.query(
      "SELECT id FROM felhasznalok WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email már létezik!" });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    await dbPromise.query(
      `INSERT INTO felhasznalok
        (nev, email, varos, szuletesi_datum, nem, jelszo, profilkep, szerepkor, aktiv)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'user', 1)`,
      [
        cleanFullName,
        cleanEmail,
        cleanCity || null,
        cleanBirthDate || null,
        cleanNem,
        hashedPassword,
      ]
    );

    res.status(201).json({ message: "Sikeres regisztráció!" });
  } catch (error) {
    console.error("❌ REGISTER HIBA:", error.message);
    return res.status(500).json({ error: "Mentési hiba" });
  }
});

/* ===== LOGIN ===== */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "Hiányzó adatok!" });
    }

    const [results] = await dbPromise.query(
      "SELECT * FROM felhasznalok WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Hibás adatok!" });
    }

    const user = results[0];

    if (Number(user.aktiv) === 0) {
      return res.status(403).json({ error: "Ez a felhasználó inaktív!" });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.jelszo);

    if (!isMatch) {
      return res.status(401).json({ error: "Hibás adatok!" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Sikeres belépés!",
      token,
      user: {
        id: user.id,
        nev: user.nev,
        email: user.email,
        szerepkor: user.szerepkor,
        profilkep: user.profilkep,
        varos: user.varos || "",
        szuletesi_datum: user.szuletesi_datum || null,
        nem: user.nem || null,
        eletkor: calculateAge(user.szuletesi_datum),
      },
    });
  } catch (error) {
    console.error("❌ LOGIN HIBA:", error.message);
    return res.status(500).json({ error: "Belépési hiba" });
  }
});

/* ===== PROFILE GET ===== */
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const [results] = await dbPromise.query(
      "SELECT id, nev, email, szerepkor, profilkep, varos, szuletesi_datum, nem FROM felhasznalok WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található!" });
    }

    const dbUser = results[0];

    res.json({
      ...dbUser,
      eletkor: calculateAge(dbUser.szuletesi_datum),
    });
  } catch (error) {
    console.error("❌ PROFILE GET HIBA:", error.message);
    return res.status(500).json({ error: "DB hiba" });
  }
});

/* ===== PROFILE IMAGE UPLOAD ===== */
app.post(
  "/api/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nincs kiválasztott kép!" });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const [results] = await dbPromise.query(
        "SELECT profilkep FROM felhasznalok WHERE id = ? LIMIT 1",
        [req.user.id]
      );

      if (!results.length) {
        return res.status(404).json({ error: "Felhasználó nem található!" });
      }

      const oldImage = results?.[0]?.profilkep || null;

      await dbPromise.query(
        "UPDATE felhasznalok SET profilkep = ? WHERE id = ?",
        [imagePath, req.user.id]
      );

      if (oldImage && oldImage !== imagePath) {
        deleteLocalImage(oldImage);
      }

      res.json({
        message: "Profilkép frissítve!",
        profilkep: imagePath,
      });
    } catch (error) {
      console.error("❌ PROFILE AVATAR HIBA:", error.message);
      return res.status(500).json({ error: "DB hiba" });
    }
  }
);

/* ===== PASSWORD CHANGE ===== */
app.put("/api/profile/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Minden mezőt tölts ki!" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ error: "Az új jelszó legyen legalább 6 karakter!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Az új jelszavak nem egyeznek!" });
    }

    const [results] = await dbPromise.query(
      "SELECT id, jelszo FROM felhasznalok WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Felhasználó nem található!" });
    }

    const dbUser = results[0];

    const isMatch = await bcrypt.compare(currentPassword, dbUser.jelszo);

    if (!isMatch) {
      return res.status(400).json({ error: "A jelenlegi jelszó hibás!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dbPromise.query(
      "UPDATE felhasznalok SET jelszo = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    res.json({ message: "Jelszó sikeresen módosítva!" });
  } catch (error) {
    console.error("❌ PASSWORD CHANGE HIBA:", error.message);
    return res.status(500).json({ error: "Jelszó módosítási hiba" });
  }
});

/* ===== ADMIN DASHBOARD ===== */
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [usersRows] = await dbPromise.query(
        `SELECT
          id,
          nev,
          email,
          szerepkor,
          profilkep,
          varos,
          szuletesi_datum,
          nem,
          aktiv,
          letrehozva
         FROM felhasznalok
         ORDER BY id DESC`
      );

      const statsJoinSql = await getTourStatsJoinSql();

      const [tourRows] = await dbPromise.query(`
        SELECT
          t.id,
          t.slug,
          t.cim,
          t.rovid_leiras,
          t.leiras,
          t.kategoria,
          t.nehezseg,
          t.idotartam,
          t.badge,
          t.ar,
          t.kep,
          t.letszam_max,
          t.aktiv,
          t.created_at,
          t.updated_at,
          COALESCE(f.joined_count, 0) AS joined_count
        FROM turak t
        ${statsJoinSql}
        ORDER BY t.id DESC
      `);

      const rentalStats = await getRentalStatsSafe();

      const users = (usersRows || []).map((u) => ({
        ...u,
        varos: normalizeCity(u.varos),
        eletkor: calculateAge(u.szuletesi_datum),
      }));

      const tours = (tourRows || []).map(mapTourRow);

      const totalUsers = users.length;
      const adminCount = users.filter((u) => u.szerepkor === "admin").length;
      const normalUserCount = users.filter((u) => u.szerepkor !== "admin").length;
      const avatarCount = users.filter((u) => !!u.profilkep).length;

      const totalTours = tours.length;
      const activeTours = tours.filter((t) => t.active).length;
      const inactiveTours = tours.filter((t) => !t.active).length;

      const usersWithCity = users.filter((u) => !!u.varos);
      const usersWithAge = users.filter((u) => typeof u.eletkor === "number");

      const cityMap = new Map();
      for (const u of usersWithCity) {
        const key = u.varos;
        cityMap.set(key, (cityMap.get(key) || 0) + 1);
      }

      const cityStats = Array.from(cityMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, "hu"));

      const ageGroupOrder = [
        "18 év alatt",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55+",
      ];

      const ageMap = new Map();
      for (const u of usersWithAge) {
        const group = getAgeGroup(u.eletkor);
        if (!group) continue;
        ageMap.set(group, (ageMap.get(group) || 0) + 1);
      }

      const ageGroups = ageGroupOrder
        .filter((label) => ageMap.has(label))
        .map((label) => ({
          label,
          count: ageMap.get(label) || 0,
        }));

      const ageValues = usersWithAge.map((u) => u.eletkor);
      const averageAge = ageValues.length
        ? Math.round(ageValues.reduce((sum, n) => sum + n, 0) / ageValues.length)
        : 0;
      const youngestAge = ageValues.length ? Math.min(...ageValues) : 0;
      const oldestAge = ageValues.length ? Math.max(...ageValues) : 0;

      res.json({
        stats: {
          totalUsers,
          adminCount,
          normalUserCount,
          avatarCount,
          totalTours,
          activeTours,
          inactiveTours,
          totalRentalOrders: rentalStats.totalRentalOrders,
          pendingRentalOrders: rentalStats.pendingRentalOrders,
          totalRentalRevenue: rentalStats.totalRentalRevenue,
          averageAge,
          youngestAge,
          oldestAge,
          knownCityCount: usersWithCity.length,
        },
        users,
        tours,
        cityStats,
        ageGroups,
      });
    } catch (error) {
      console.error("❌ ADMIN DASHBOARD HIBA:", error.message);
      res.status(500).json({ error: "Nem sikerült betölteni az admin adatokat." });
    }
  }
);

/* ===== ADMIN ROLE UPDATE ===== */
app.put(
  "/api/admin/users/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      const { szerepkor } = req.body;

      if (!targetId || Number.isNaN(targetId)) {
        return res.status(400).json({ error: "Érvénytelen user azonosító!" });
      }

      if (!["admin", "user"].includes(szerepkor)) {
        return res.status(400).json({ error: "Érvénytelen szerepkör!" });
      }

      if (req.user.id === targetId && szerepkor !== "admin") {
        return res
          .status(400)
          .json({ error: "Saját magadat nem rakhatod vissza userre." });
      }

      const [results] = await dbPromise.query(
        "SELECT id, nev, email, szerepkor, profilkep FROM felhasznalok WHERE id = ? LIMIT 1",
        [targetId]
      );

      if (!results.length) {
        return res.status(404).json({ error: "Felhasználó nem található!" });
      }

      await dbPromise.query(
        "UPDATE felhasznalok SET szerepkor = ? WHERE id = ?",
        [szerepkor, targetId]
      );

      res.json({
        message: "Szerepkör sikeresen frissítve!",
        user: {
          ...results[0],
          szerepkor,
        },
      });
    } catch (error) {
      console.error("❌ ADMIN ROLE UPDATE HIBA:", error.message);
      return res
        .status(500)
        .json({ error: "Nem sikerült frissíteni a szerepkört!" });
    }
  }
);

/* ===== ADMIN TOUR CREATE ===== */
app.post(
  "/api/admin/tours",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        shortDesc,
        desc,
        category,
        level,
        dur,
        badge,
        price,
        img,
        date,
        maxPeople,
      } = req.body;

      if (!title || !desc || !category || !level || !dur) {
        return res.status(400).json({
          error: "A cím, leírás, kategória, nehézség és időtartam kötelező!",
        });
      }

      const parsedPrice = Number(price);
      const parsedMaxPeople = Number(maxPeople || 20);

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "Érvénytelen ár!" });
      }

      if (
        Number.isNaN(parsedMaxPeople) ||
        parsedMaxPeople < 1 ||
        parsedMaxPeople > 500
      ) {
        return res.status(400).json({ error: "Érvénytelen maximális létszám!" });
      }

      const finalSlug = await createUniqueTourSlug(title);

      const insertColumns = [];
      const insertValues = [];

      insertColumns.push("slug");
      insertValues.push(finalSlug);

      insertColumns.push("cim");
      insertValues.push(String(title).trim());

      insertColumns.push("rovid_leiras");
      insertValues.push(String(shortDesc || "").trim() || null);

      insertColumns.push("leiras");
      insertValues.push(String(desc).trim());

      insertColumns.push("kategoria");
      insertValues.push(String(category).trim());

      insertColumns.push("nehezseg");
      insertValues.push(String(level).trim());

      insertColumns.push("idotartam");
      insertValues.push(String(dur).trim());

      insertColumns.push("badge");
      insertValues.push(String(badge || "EXPLORE").trim());

      insertColumns.push("ar");
      insertValues.push(parsedPrice);

      insertColumns.push("kep");
      insertValues.push(
        String(img || "").trim() ||
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400"
      );

      insertColumns.push("letszam_max");
      insertValues.push(parsedMaxPeople);

      insertColumns.push("aktiv");
      insertValues.push(1);

      if (await columnExists("turak", "nev")) {
        insertColumns.push("nev");
        insertValues.push(String(title).trim());
      }

      if (await columnExists("turak", "helyszin")) {
        insertColumns.push("helyszin");
        insertValues.push(String(category).trim());
      }

      if (await columnExists("turak", "datum")) {
        insertColumns.push("datum");
        insertValues.push(isValidSqlDateString(date) ? date : getTodaySqlDate());
      }

      if (await columnExists("turak", "szervezo_id")) {
        insertColumns.push("szervezo_id");
        insertValues.push(req.user.id || null);
      }

      const placeholders = insertColumns.map(() => "?").join(", ");

      const [insertResult] = await dbPromise.query(
        `INSERT INTO turak (${insertColumns.join(", ")}) VALUES (${placeholders})`,
        insertValues
      );

      const statsJoinSql = await getTourStatsJoinSql();

      const [rows] = await dbPromise.query(
        `
        SELECT
          t.id,
          t.slug,
          t.cim,
          t.rovid_leiras,
          t.leiras,
          t.kategoria,
          t.nehezseg,
          t.idotartam,
          t.badge,
          t.ar,
          t.kep,
          t.letszam_max,
          t.aktiv,
          t.created_at,
          t.updated_at,
          COALESCE(f.joined_count, 0) AS joined_count
        FROM turak t
        ${statsJoinSql}
        WHERE t.id = ?
        LIMIT 1
        `,
        [insertResult.insertId]
      );

      res.status(201).json({
        message: "Túra sikeresen létrehozva!",
        tour: mapTourRow(rows[0]),
      });
    } catch (error) {
      console.error("❌ TOUR CREATE HIBA:", error.message);
      res.status(500).json({
        error: error.message || "Nem sikerült létrehozni a túrát.",
      });
    }
  }
);

/* ===== ADMIN TOUR UPDATE ===== */
app.put(
  "/api/admin/tours/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tourId = Number(req.params.id);

      if (!tourId || Number.isNaN(tourId)) {
        return res.status(400).json({ error: "Érvénytelen túra azonosító!" });
      }

      const {
        title,
        shortDesc,
        desc,
        category,
        level,
        dur,
        badge,
        price,
        img,
        maxPeople,
      } = req.body;

      const parsedPrice = Number(price);
      const parsedMaxPeople = Number(maxPeople);

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: "A cím kötelező!" });
      }

      if (!desc || !String(desc).trim()) {
        return res.status(400).json({ error: "A leírás kötelező!" });
      }

      if (!category || !String(category).trim()) {
        return res.status(400).json({ error: "A kategória kötelező!" });
      }

      if (!level || !String(level).trim()) {
        return res.status(400).json({ error: "A nehézség kötelező!" });
      }

      if (!dur || !String(dur).trim()) {
        return res.status(400).json({ error: "Az időtartam kötelező!" });
      }

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "Érvénytelen ár!" });
      }

      if (
        Number.isNaN(parsedMaxPeople) ||
        parsedMaxPeople < 1 ||
        parsedMaxPeople > 500
      ) {
        return res.status(400).json({
          error: "A maximális létszám 1 és 500 között lehet!",
        });
      }

      const [existing] = await dbPromise.query(
        "SELECT id, slug FROM turak WHERE id = ? LIMIT 1",
        [tourId]
      );

      if (!existing.length) {
        return res.status(404).json({ error: "A túra nem található!" });
      }

      await dbPromise.query(
        `
        UPDATE turak
        SET
          cim = ?,
          rovid_leiras = ?,
          leiras = ?,
          kategoria = ?,
          nehezseg = ?,
          idotartam = ?,
          badge = ?,
          ar = ?,
          kep = ?,
          letszam_max = ?
        WHERE id = ?
        `,
        [
          String(title).trim(),
          String(shortDesc || "").trim() || null,
          String(desc).trim(),
          String(category).trim(),
          String(level).trim(),
          String(dur).trim(),
          String(badge || "EXPLORE").trim(),
          parsedPrice,
          String(img || "").trim() ||
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400",
          parsedMaxPeople,
          tourId,
        ]
      );

      if (await columnExists("turak", "nev")) {
        await dbPromise.query("UPDATE turak SET nev = ? WHERE id = ?", [
          String(title).trim(),
          tourId,
        ]);
      }

      if (await columnExists("turak", "helyszin")) {
        await dbPromise.query("UPDATE turak SET helyszin = ? WHERE id = ?", [
          String(category).trim(),
          tourId,
        ]);
      }

      const statsJoinSql = await getTourStatsJoinSql();

      const [rows] = await dbPromise.query(
        `
        SELECT
          t.id,
          t.slug,
          t.cim,
          t.rovid_leiras,
          t.leiras,
          t.kategoria,
          t.nehezseg,
          t.idotartam,
          t.badge,
          t.ar,
          t.kep,
          t.letszam_max,
          t.aktiv,
          t.created_at,
          t.updated_at,
          COALESCE(f.joined_count, 0) AS joined_count
        FROM turak t
        ${statsJoinSql}
        WHERE t.id = ?
        LIMIT 1
        `,
        [tourId]
      );

      res.json({
        message: "Túra sikeresen frissítve!",
        tour: mapTourRow(rows[0]),
      });
    } catch (error) {
      console.error("❌ TOUR UPDATE HIBA:", error.message);
      res.status(500).json({
        error: error.message || "Nem sikerült frissíteni a túrát.",
      });
    }
  }
);

/* ===== ADMIN TOUR STATUS UPDATE ===== */
app.put(
  "/api/admin/tours/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tourId = Number(req.params.id);

      if (!tourId || Number.isNaN(tourId)) {
        return res.status(400).json({ error: "Érvénytelen túra azonosító!" });
      }

      const aktiv = req.body.aktiv ? 1 : 0;

      const [existing] = await dbPromise.query(
        "SELECT id FROM turak WHERE id = ? LIMIT 1",
        [tourId]
      );

      if (!existing.length) {
        return res.status(404).json({ error: "A túra nem található!" });
      }

      await dbPromise.query("UPDATE turak SET aktiv = ? WHERE id = ?", [
        aktiv,
        tourId,
      ]);

      const statsJoinSql = await getTourStatsJoinSql();

      const [rows] = await dbPromise.query(
        `
        SELECT
          t.id,
          t.slug,
          t.cim,
          t.rovid_leiras,
          t.leiras,
          t.kategoria,
          t.nehezseg,
          t.idotartam,
          t.badge,
          t.ar,
          t.kep,
          t.letszam_max,
          t.aktiv,
          t.created_at,
          t.updated_at,
          COALESCE(f.joined_count, 0) AS joined_count
        FROM turak t
        ${statsJoinSql}
        WHERE t.id = ?
        LIMIT 1
        `,
        [tourId]
      );

      res.json({
        message: aktiv
          ? "A túra újra látható mindenkinek."
          : "A túra elrejtve.",
        tour: mapTourRow(rows[0]),
      });
    } catch (error) {
      console.error("❌ TOUR STATUS HIBA:", error.message);
      res.status(500).json({ error: "Nem sikerült frissíteni a túrát." });
    }
  }
);

/* =====================================
   ERROR HANDLER
===================================== */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(err.status || 400).json({ error: err.message || "Ismeretlen hiba" });
});

/* =====================================
   START
===================================== */
const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await ensureTables();

    app.listen(PORT, () => {
      console.log(`🚀 Backend fut a ${PORT}-es porton`);
    });
  } catch (error) {
    console.error("❌ Indítási hiba:", error.message);
    process.exit(1);
  }
}

startServer();