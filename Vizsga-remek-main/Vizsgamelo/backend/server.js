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
   HELPER
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
app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  db.query(
    "SELECT id, nev, email, szerepkor, profilkep FROM felhasznalok ORDER BY id DESC",
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: "DB hiba" });
      }

      const totalUsers = users.length;
      const adminCount = users.filter((u) => u.szerepkor === "admin").length;
      const normalUserCount = users.filter((u) => u.szerepkor !== "admin").length;
      const avatarCount = users.filter((u) => !!u.profilkep).length;

      res.json({
        stats: {
          totalUsers,
          adminCount,
          normalUserCount,
          avatarCount,
        },
        users,
      });
    }
  );
});

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

app.listen(PORT, () => {
  console.log(`🚀 Backend fut a ${PORT}-es porton`);
});