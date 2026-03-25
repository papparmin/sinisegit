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
          "INSERT INTO felhasznalok (nev, email, jelszo, profilkep) VALUES (?, ?, ?, NULL)",
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