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

/* =====================================
   UPLOADS FOLDER (auto create)
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
   MULTER (image upload)
===================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "_" + Math.random().toString(16).slice(2) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
      if (err) return res.status(500).json({ error: "DB hiba" });

      if (results.length > 0) {
        return res.status(400).json({ error: "Email már létezik!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO felhasznalok (nev, email, jelszo, profilkep) VALUES (?, ?, ?, NULL)",
        [fullName, email, hashedPassword],
        (insertErr) => {
          if (insertErr)
            return res.status(500).json({ error: "Mentési hiba" });

          res.status(201).json({ message: "Sikeres regisztráció!" });
        }
      );
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
      if (err) return res.status(500).json({ error: "DB hiba" });

      if (results.length === 0)
        return res.status(401).json({ error: "Hibás adatok!" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.jelszo);

      if (!isMatch)
        return res.status(401).json({ error: "Hibás adatok!" });

      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

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
    }
  );
});

/* ===== PROFILE IMAGE UPLOAD ===== */
app.post("/api/profile/avatar", upload.single("avatar"), (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "Hiányzó userId" });
  if (!req.file) return res.status(400).json({ error: "Nincs fájl" });

  const imagePath = `/uploads/${req.file.filename}`;

  db.query(
    "UPDATE felhasznalok SET profilkep = ? WHERE id = ?",
    [imagePath, userId],
    (err) => {
      if (err) return res.status(500).json({ error: "DB hiba" });

      res.json({
        message: "Profilkép frissítve!",
        profilkep: imagePath,
      });
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