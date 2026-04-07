const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================
   UPLOADS FOLDER
===================================== */
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use("/uploads", express.static(UPLOAD_DIR));

/* =====================================
   DATABASE
===================================== */
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "exploree",
  waitForConnections: true,
  connectionLimit: 10,
});

const dbPromise = db.promise();

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB hiba:", err.message);
  } else {
    console.log("✅ DB connected");
    connection.release();
  }
});

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

function adminMiddleware(req, res, next) {
  db.query(
    "SELECT id, szerepkor FROM felhasznalok WHERE id = ? LIMIT 1",
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      if (!results.length) {
        return res.status(404).json({ error: "Felhasználó nem található!" });
      }

      if (results[0].szerepkor !== "admin") {
        return res.status(403).json({ error: "Nincs admin jogosultságod!" });
      }

      next();
    }
  );
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

async function createUniqueTourSlug(baseText) {
  const baseSlug = slugify(baseText) || `tura-${Date.now()}`;
  let candidate = baseSlug;
  let index = 2;

  while (true) {
    const [rows] = await dbPromise.query(
      "SELECT id FROM turak WHERE slug = ? LIMIT 1",
      [candidate]
    );

    if (!rows.length) {
      return candidate;
    }

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
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
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

function setHas(setObj, key) {
  return !!setObj && setObj.has(key);
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

  const missingColumns = [
    {
      name: "slug",
      sql: "ALTER TABLE turak ADD COLUMN slug VARCHAR(180) NULL AFTER id",
    },
    {
      name: "cim",
      sql: "ALTER TABLE turak ADD COLUMN cim VARCHAR(255) NULL AFTER slug",
    },
    {
      name: "rovid_leiras",
      sql: "ALTER TABLE turak ADD COLUMN rovid_leiras VARCHAR(255) NULL AFTER cim",
    },
    {
      name: "kategoria",
      sql: "ALTER TABLE turak ADD COLUMN kategoria VARCHAR(100) NULL AFTER leiras",
    },
    {
      name: "nehezseg",
      sql: "ALTER TABLE turak ADD COLUMN nehezseg VARCHAR(100) NULL AFTER kategoria",
    },
    {
      name: "idotartam",
      sql: "ALTER TABLE turak ADD COLUMN idotartam VARCHAR(100) NULL AFTER nehezseg",
    },
    {
      name: "badge",
      sql: "ALTER TABLE turak ADD COLUMN badge VARCHAR(120) NULL AFTER idotartam",
    },
    {
      name: "kep",
      sql: "ALTER TABLE turak ADD COLUMN kep VARCHAR(2000) NULL AFTER ar",
    },
    {
      name: "letszam_max",
      sql: "ALTER TABLE turak ADD COLUMN letszam_max INT NOT NULL DEFAULT 20 AFTER kep",
    },
    {
      name: "aktiv",
      sql: "ALTER TABLE turak ADD COLUMN aktiv TINYINT(1) NOT NULL DEFAULT 1 AFTER letszam_max",
    },
    {
      name: "created_at",
      sql: "ALTER TABLE turak ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER aktiv",
    },
    {
      name: "updated_at",
      sql: "ALTER TABLE turak ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    },
  ];

  for (const column of missingColumns) {
    const exists = await columnExists("turak", column.name);
    if (!exists) {
      await dbPromise.query(column.sql);
    }
  }

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

  const kepExists = await columnExists("turak", "kep");
  if (kepExists) {
    try {
      await dbPromise.query(
        "ALTER TABLE turak MODIFY COLUMN kep VARCHAR(2000) NULL"
      );
    } catch (error) {
      console.error("❌ kep oszlop módosítás hiba:", error.message);
    }
  }

  const slugIndexExists = await indexExists("turak", "uq_turak_slug");
  if (!slugIndexExists) {
    await dbPromise.query(
      "ALTER TABLE turak ADD UNIQUE KEY uq_turak_slug (slug)"
    );
  }
}

async function ensureFoglalasokTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS foglalasok (
      id INT NOT NULL AUTO_INCREMENT,
      felhasznalo_id INT NULL,
      tura_id INT NULL,
      tura_slug VARCHAR(180) DEFAULT NULL,
      tura_cim VARCHAR(255) DEFAULT NULL,
      datum DATE DEFAULT NULL,
      letszam INT NOT NULL DEFAULT 1,
      foglalo_nev VARCHAR(255) DEFAULT NULL,
      foglalo_email VARCHAR(255) DEFAULT NULL,
      foglalo_telefon VARCHAR(60) DEFAULT NULL,
      tapasztalat VARCHAR(100) DEFAULT 'Kezdő',
      egeszseg TEXT DEFAULT NULL,
      veszhelyzeti_nev VARCHAR(255) DEFAULT NULL,
      veszhelyzeti_telefon VARCHAR(60) DEFAULT NULL,
      felszereles_berles VARCHAR(50) DEFAULT 'Nem',
      megjegyzes TEXT DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'uj',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const missingColumns = [
    {
      name: "felhasznalo_id",
      sql: "ALTER TABLE foglalasok ADD COLUMN felhasznalo_id INT NULL AFTER id",
    },
    {
      name: "user_id",
      sql: "ALTER TABLE foglalasok ADD COLUMN user_id INT NULL AFTER felhasznalo_id",
    },
    {
      name: "tura_id",
      sql: "ALTER TABLE foglalasok ADD COLUMN tura_id INT NULL AFTER user_id",
    },
    {
      name: "tour_id",
      sql: "ALTER TABLE foglalasok ADD COLUMN tour_id INT NULL AFTER tura_id",
    },
    {
      name: "tura_slug",
      sql: "ALTER TABLE foglalasok ADD COLUMN tura_slug VARCHAR(180) NULL AFTER tour_id",
    },
    {
      name: "tour_slug",
      sql: "ALTER TABLE foglalasok ADD COLUMN tour_slug VARCHAR(180) NULL AFTER tura_slug",
    },
    {
      name: "tura_cim",
      sql: "ALTER TABLE foglalasok ADD COLUMN tura_cim VARCHAR(255) NULL AFTER tour_slug",
    },
    {
      name: "tour_title",
      sql: "ALTER TABLE foglalasok ADD COLUMN tour_title VARCHAR(255) NULL AFTER tura_cim",
    },
    {
      name: "datum",
      sql: "ALTER TABLE foglalasok ADD COLUMN datum DATE NULL AFTER tour_title",
    },
    {
      name: "date",
      sql: "ALTER TABLE foglalasok ADD COLUMN date DATE NULL AFTER datum",
    },
    {
      name: "letszam",
      sql: "ALTER TABLE foglalasok ADD COLUMN letszam INT NOT NULL DEFAULT 1 AFTER date",
    },
    {
      name: "people",
      sql: "ALTER TABLE foglalasok ADD COLUMN people INT NOT NULL DEFAULT 1 AFTER letszam",
    },
    {
      name: "nev",
      sql: "ALTER TABLE foglalasok ADD COLUMN nev VARCHAR(255) NULL AFTER people",
    },
    {
      name: "foglalo_nev",
      sql: "ALTER TABLE foglalasok ADD COLUMN foglalo_nev VARCHAR(255) NULL AFTER nev",
    },
    {
      name: "name",
      sql: "ALTER TABLE foglalasok ADD COLUMN name VARCHAR(255) NULL AFTER foglalo_nev",
    },
    {
      name: "foglalo_email",
      sql: "ALTER TABLE foglalasok ADD COLUMN foglalo_email VARCHAR(255) NULL AFTER name",
    },
    {
      name: "email",
      sql: "ALTER TABLE foglalasok ADD COLUMN email VARCHAR(255) NULL AFTER foglalo_email",
    },
    {
      name: "telefon",
      sql: "ALTER TABLE foglalasok ADD COLUMN telefon VARCHAR(60) NULL AFTER email",
    },
    {
      name: "foglalo_telefon",
      sql: "ALTER TABLE foglalasok ADD COLUMN foglalo_telefon VARCHAR(60) NULL AFTER telefon",
    },
    {
      name: "phone",
      sql: "ALTER TABLE foglalasok ADD COLUMN phone VARCHAR(60) NULL AFTER foglalo_telefon",
    },
    {
      name: "tapasztalat",
      sql: "ALTER TABLE foglalasok ADD COLUMN tapasztalat VARCHAR(100) DEFAULT 'Kezdő' AFTER phone",
    },
    {
      name: "experience",
      sql: "ALTER TABLE foglalasok ADD COLUMN experience VARCHAR(100) DEFAULT 'Kezdő' AFTER tapasztalat",
    },
    {
      name: "egeszseg",
      sql: "ALTER TABLE foglalasok ADD COLUMN egeszseg TEXT NULL AFTER experience",
    },
    {
      name: "health",
      sql: "ALTER TABLE foglalasok ADD COLUMN health TEXT NULL AFTER egeszseg",
    },
    {
      name: "veszhelyzeti_nev",
      sql: "ALTER TABLE foglalasok ADD COLUMN veszhelyzeti_nev VARCHAR(255) NULL AFTER health",
    },
    {
      name: "emergency_name",
      sql: "ALTER TABLE foglalasok ADD COLUMN emergency_name VARCHAR(255) NULL AFTER veszhelyzeti_nev",
    },
    {
      name: "veszhelyzeti_telefon",
      sql: "ALTER TABLE foglalasok ADD COLUMN veszhelyzeti_telefon VARCHAR(60) NULL AFTER emergency_name",
    },
    {
      name: "emergency_phone",
      sql: "ALTER TABLE foglalasok ADD COLUMN emergency_phone VARCHAR(60) NULL AFTER veszhelyzeti_telefon",
    },
    {
      name: "felszereles_berles",
      sql: "ALTER TABLE foglalasok ADD COLUMN felszereles_berles VARCHAR(50) DEFAULT 'Nem' AFTER emergency_phone",
    },
    {
      name: "rental",
      sql: "ALTER TABLE foglalasok ADD COLUMN rental VARCHAR(50) DEFAULT 'Nem' AFTER felszereles_berles",
    },
    {
      name: "megjegyzes",
      sql: "ALTER TABLE foglalasok ADD COLUMN megjegyzes TEXT NULL AFTER rental",
    },
    {
      name: "note",
      sql: "ALTER TABLE foglalasok ADD COLUMN note TEXT NULL AFTER megjegyzes",
    },
    {
      name: "status",
      sql: "ALTER TABLE foglalasok ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'uj' AFTER note",
    },
    {
      name: "created_at",
      sql: "ALTER TABLE foglalasok ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER status",
    },
    {
      name: "updated_at",
      sql: "ALTER TABLE foglalasok ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    },
  ];

  for (const column of missingColumns) {
    const exists = await columnExists("foglalasok", column.name);
    if (!exists) {
      try {
        await dbPromise.query(column.sql);
      } catch (error) {
        console.error(`❌ foglalasok.${column.name} hozzáadás hiba:`, error.message);
      }
    }
  }

  const indexes = [
    { name: "idx_foglalasok_tura", sql: "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_tura (tura_id)" },
    { name: "idx_foglalasok_tour", sql: "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_tour (tour_id)" },
    { name: "idx_foglalasok_user", sql: "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_user (felhasznalo_id)" },
    { name: "idx_foglalasok_user2", sql: "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_user2 (user_id)" },
    { name: "idx_foglalasok_status", sql: "ALTER TABLE foglalasok ADD INDEX idx_foglalasok_status (status)" },
  ];

  for (const idx of indexes) {
    const exists = await indexExists("foglalasok", idx.name);
    if (!exists) {
      try {
        await dbPromise.query(idx.sql);
      } catch (error) {
        console.error(`❌ ${idx.name} hiba:`, error.message);
      }
    }
  }

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
        status = COALESCE(NULLIF(status, ''), 'uj')
    `);
  } catch (error) {
    console.error("❌ foglalasok normalize hiba:", error.message);
  }

  try {
    if (await columnExists("foglalasok", "nev")) {
      await dbPromise.query(
        "ALTER TABLE foglalasok MODIFY COLUMN nev VARCHAR(255) NULL"
      );
    }
  } catch (error) {
    console.error("❌ foglalasok.nev modify hiba:", error.message);
  }

  try {
    if (await columnExists("foglalasok", "telefon")) {
      await dbPromise.query(
        "ALTER TABLE foglalasok MODIFY COLUMN telefon VARCHAR(60) NULL"
      );
    }
  } catch (error) {
    console.error("❌ foglalasok.telefon modify hiba:", error.message);
  }
}

async function ensureFoglalasVendegekTableShape() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS foglalas_vendegek (
      id INT NOT NULL AUTO_INCREMENT,
      foglalas_id INT NOT NULL,
      nev VARCHAR(255) NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      telefon VARCHAR(60) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const missingColumns = [
    {
      name: "foglalas_id",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN foglalas_id INT NOT NULL AFTER id",
    },
    {
      name: "booking_id",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN booking_id INT NULL AFTER foglalas_id",
    },
    {
      name: "nev",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN nev VARCHAR(255) NULL AFTER booking_id",
    },
    {
      name: "name",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN name VARCHAR(255) NULL AFTER nev",
    },
    {
      name: "email",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN email VARCHAR(255) NULL AFTER name",
    },
    {
      name: "telefon",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN telefon VARCHAR(60) NULL AFTER email",
    },
    {
      name: "phone",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN phone VARCHAR(60) NULL AFTER telefon",
    },
    {
      name: "created_at",
      sql: "ALTER TABLE foglalas_vendegek ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER phone",
    },
  ];

  for (const column of missingColumns) {
    const exists = await columnExists("foglalas_vendegek", column.name);
    if (!exists) {
      try {
        await dbPromise.query(column.sql);
      } catch (error) {
        console.error(`❌ foglalas_vendegek.${column.name} hozzáadás hiba:`, error.message);
      }
    }
  }

  const indexes = [
    {
      name: "idx_foglalas_vendegek_foglalas",
      sql: "ALTER TABLE foglalas_vendegek ADD INDEX idx_foglalas_vendegek_foglalas (foglalas_id)",
    },
    {
      name: "idx_foglalas_vendegek_booking",
      sql: "ALTER TABLE foglalas_vendegek ADD INDEX idx_foglalas_vendegek_booking (booking_id)",
    },
  ];

  for (const idx of indexes) {
    const exists = await indexExists("foglalas_vendegek", idx.name);
    if (!exists) {
      try {
        await dbPromise.query(idx.sql);
      } catch (error) {
        console.error(`❌ ${idx.name} hiba:`, error.message);
      }
    }
  }
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

async function ensureTables() {
  await ensureTurakTableShape();
  await ensureFoglalasokTableShape();
  await ensureFoglalasVendegekTableShape();
}

/* =====================================
   MULTER
===================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Csak képfájl tölthető fel!"));
    }
    cb(null, true);
  },
});

/* =====================================
   ROUTES
===================================== */

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend fut 🚀" });
});

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
app.get("/api/berles-termekek", (req, res) => {
  db.query(
    `SELECT id, nev, kategoria, marka, ar_per_nap, ertekeles, suly_kg, kep, leiras, darabszam, aktiv
     FROM berles_termekek
     WHERE aktiv = 1
     ORDER BY id DESC`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      res.json(results);
    }
  );
});

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
    return res
      .status(400)
      .json({ error: "A foglaló neve, email címe és telefonszáma kötelező!" });
  }

  if (!emergencyName || !emergencyPhone) {
    return res
      .status(400)
      .json({ error: "A vészhelyzeti kontakt adatai kötelezőek!" });
  }

  const guestCount = Math.max(0, parsedPeople - 1);
  const normalizedGuests = (Array.isArray(guests) ? guests : [])
    .slice(0, guestCount)
    .map((guest) => ({
      name: String(guest?.name || "").trim(),
      email: String(guest?.email || "").trim(),
      phone: String(guest?.phone || "").trim(),
    }));

  if (guestCount > 0 && normalizedGuests.length !== guestCount) {
    return res
      .status(400)
      .json({ error: "A vendégek száma nem egyezik a megadott létszámmal." });
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

    pushIfExists("tour_badge", tour.badge || null);
    pushIfExists("tour_dur", tour.idotartam || null);
    pushIfExists("tour_price", Number(tour.ar || 0));

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
            VALUES ${guestRows
              .map(() => `(${guestPlaceholders})`)
              .join(", ")}
            `,
            guestRows.flat()
          );
        }
      }
    }

    await connection.commit();

    const newJoinedCount = joinedCount + parsedPeople;
    const remainingPlaces = Math.max(0, maxPeople - newJoinedCount);

    res.status(201).json({
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
    const termekId = Number(rawItem.termekId);
    const mennyiseg = Number(rawItem.mennyiseg || 1);

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

      if (product.darabszam <= 0) {
        throw makeError(`${product.nev} elfogyott!`);
      }

      if (product.darabszam < item.mennyiseg) {
        throw makeError(
          `${product.nev} termékből csak ${product.darabszam} db maradt.`
        );
      }
    }

    let vegosszeg = 0;
    const insertRows = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.termekId);
      const lineTotal = product.ar_per_nap * item.mennyiseg * napok;

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
        product.ar_per_nap,
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
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  const fullName = `${lastName} ${firstName}`;

  db.query(
    "SELECT id FROM felhasznalok WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Email már létezik!" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO felhasznalok (nev, email, jelszo, profilkep, szerepkor) VALUES (?, ?, ?, NULL, 'user')",
          [fullName, email, hashedPassword],
          (insertErr) => {
            if (insertErr) {
              return res.status(500).json({ error: "Mentési hiba" });
            }

            res.status(201).json({ message: "Sikeres regisztráció!" });
          }
        );
      } catch (hashErr) {
        return res.status(500).json({ error: "Jelszó titkosítási hiba" });
      }
    }
  );
});

/* ===== LOGIN ===== */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM felhasznalok WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Hibás adatok!" });
      }

      const user = results[0];

      try {
        const isMatch = await bcrypt.compare(password, user.jelszo);

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
          },
        });
      } catch (compareErr) {
        return res.status(500).json({ error: "Belépési hiba" });
      }
    }
  );
});

/* ===== PROFILE GET ===== */
app.get("/api/profile", authMiddleware, (req, res) => {
  db.query(
    "SELECT id, nev, email, szerepkor, profilkep FROM felhasznalok WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Felhasználó nem található!" });
      }

      res.json(results[0]);
    }
  );
});

/* ===== PROFILE IMAGE UPLOAD ===== */
app.post(
  "/api/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs kiválasztott kép!" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    db.query(
      "SELECT profilkep FROM felhasznalok WHERE id = ?",
      [req.user.id],
      (selectErr, results) => {
        if (selectErr) {
          return res.status(500).json({ error: "DB hiba" });
        }

        const oldImage = results?.[0]?.profilkep || null;

        db.query(
          "UPDATE felhasznalok SET profilkep = ? WHERE id = ?",
          [imagePath, req.user.id],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: "DB hiba" });
            }

            if (oldImage && oldImage !== imagePath) {
              deleteLocalImage(oldImage);
            }

            res.json({
              message: "Profilkép frissítve!",
              profilkep: imagePath,
            });
          }
        );
      }
    );
  }
);

/* ===== PASSWORD CHANGE ===== */
app.put("/api/profile/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Minden mezőt tölts ki!" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Az új jelszó legyen legalább 6 karakter!" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Az új jelszavak nem egyeznek!" });
  }

  db.query(
    "SELECT id, jelszo FROM felhasznalok WHERE id = ?",
    [req.user.id],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      if (!results.length) {
        return res.status(404).json({ error: "Felhasználó nem található!" });
      }

      const dbUser = results[0];

      try {
        const isMatch = await bcrypt.compare(currentPassword, dbUser.jelszo);

        if (!isMatch) {
          return res.status(400).json({ error: "A jelenlegi jelszó hibás!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query(
          "UPDATE felhasznalok SET jelszo = ? WHERE id = ?",
          [hashedPassword, req.user.id],
          (updateErr) => {
            if (updateErr) {
              return res
                .status(500)
                .json({ error: "Nem sikerült a jelszó módosítása!" });
            }

            res.json({ message: "Jelszó sikeresen módosítva!" });
          }
        );
      } catch (hashErr) {
        return res.status(500).json({ error: "Jelszó módosítási hiba" });
      }
    }
  );
});

/* ===== ADMIN DASHBOARD ===== */
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [usersRows] = await dbPromise.query(
        "SELECT id, nev, email, szerepkor, profilkep FROM felhasznalok ORDER BY id DESC"
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

      const users = usersRows || [];
      const tours = (tourRows || []).map(mapTourRow);

      const totalUsers = users.length;
      const adminCount = users.filter((u) => u.szerepkor === "admin").length;
      const normalUserCount = users.filter(
        (u) => u.szerepkor !== "admin"
      ).length;
      const avatarCount = users.filter((u) => !!u.profilkep).length;

      const totalTours = tours.length;
      const activeTours = tours.filter((t) => t.active).length;
      const inactiveTours = tours.filter((t) => !t.active).length;

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
        },
        users,
        tours,
      });
    } catch (error) {
      console.error("❌ ADMIN DASHBOARD HIBA:", error.message);
      res
        .status(500)
        .json({ error: "Nem sikerült betölteni az admin adatokat." });
    }
  }
);

/* ===== ADMIN ROLE UPDATE ===== */
app.put(
  "/api/admin/users/:id/role",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
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

    db.query(
      "SELECT id, nev, email, szerepkor, profilkep FROM felhasznalok WHERE id = ? LIMIT 1",
      [targetId],
      (findErr, results) => {
        if (findErr) {
          return res.status(500).json({ error: "DB hiba" });
        }

        if (!results.length) {
          return res.status(404).json({ error: "Felhasználó nem található!" });
        }

        db.query(
          "UPDATE felhasznalok SET szerepkor = ? WHERE id = ?",
          [szerepkor, targetId],
          (updateErr) => {
            if (updateErr) {
              return res
                .status(500)
                .json({ error: "Nem sikerült frissíteni a szerepkört!" });
            }

            res.json({
              message: "Szerepkör sikeresen frissítve!",
              user: {
                ...results[0],
                szerepkor,
              },
            });
          }
        );
      }
    );
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
          error:
            "A cím, leírás, kategória, nehézség és időtartam kötelező!",
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
      insertValues.push(title.trim());

      insertColumns.push("rovid_leiras");
      insertValues.push(shortDesc?.trim() || null);

      insertColumns.push("leiras");
      insertValues.push(desc.trim());

      insertColumns.push("kategoria");
      insertValues.push(category.trim());

      insertColumns.push("nehezseg");
      insertValues.push(level.trim());

      insertColumns.push("idotartam");
      insertValues.push(dur.trim());

      insertColumns.push("badge");
      insertValues.push(badge?.trim() || "EXPLORE");

      insertColumns.push("ar");
      insertValues.push(parsedPrice);

      insertColumns.push("kep");
      insertValues.push(
        img?.trim() ||
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400"
      );

      insertColumns.push("letszam_max");
      insertValues.push(parsedMaxPeople);

      insertColumns.push("aktiv");
      insertValues.push(1);

      if (await columnExists("turak", "nev")) {
        insertColumns.push("nev");
        insertValues.push(title.trim());
      }

      if (await columnExists("turak", "helyszin")) {
        insertColumns.push("helyszin");
        insertValues.push(category.trim());
      }

      if (await columnExists("turak", "datum")) {
        insertColumns.push("datum");
        insertValues.push(
          isValidSqlDateString(date) ? date : getTodaySqlDate()
        );
      }

      if (await columnExists("turak", "szervezo_id")) {
        insertColumns.push("szervezo_id");
        insertValues.push(req.user.id || null);
      }

      const placeholders = insertColumns.map(() => "?").join(", ");

      const [insertResult] = await dbPromise.query(
        `INSERT INTO turak (${insertColumns.join(
          ", "
        )}) VALUES (${placeholders})`,
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
  res.status(400).json({ error: err.message });
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