const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/* =====================================
   FIX BEÁLLÍTÁSOK A TE PROJEKTEDHEZ
===================================== */

const PROJECT_DIR = __dirname;

// SQL mentés helye
const DB_INIT_DIR = path.join(PROJECT_DIR, "db_init");
const TEMP_DUMP_FILE = path.join(DB_INIT_DIR, "exploree.sql.tmp");
const FINAL_DUMP_FILE = path.join(DB_INIT_DIR, "exploree.sql");

// A te docker-compose.yml alapján
const DB_SERVICE = "db";
const DB_NAME = "exploree";
const DB_USER = "root";
const DB_PASSWORD = "rootpw";

// Linkek
const FRONTEND_URL = "http://localhost:8100";
const PHPMYADMIN_URL = "http://localhost:8101";
const BACKEND_URL = "http://localhost:5050";

/* =====================================
   SEGÉDEK
===================================== */

function logInfo(text) {
  console.log("\x1b[36m%s\x1b[0m", text);
}

function logWarn(text) {
  console.log("\x1b[33m%s\x1b[0m", text);
}

function logSuccess(text) {
  console.log("\x1b[32m%s\x1b[0m", text);
}

function logError(text) {
  console.error("\x1b[31m%s\x1b[0m", text);
}

function ensureDbInitDir() {
  if (!fs.existsSync(DB_INIT_DIR)) {
    fs.mkdirSync(DB_INIT_DIR, { recursive: true });
  }
}

function saveDatabase() {
  logInfo("💾 Adatbázis mentése folyamatban...");

  try {
    if (fs.existsSync(TEMP_DUMP_FILE)) {
      fs.unlinkSync(TEMP_DUMP_FILE);
    }

    const dumpCommand =
      `docker compose exec -T ${DB_SERVICE} ` +
      `mysqldump -u${DB_USER} -p${DB_PASSWORD} --skip-extended-insert ${DB_NAME} > "${TEMP_DUMP_FILE}"`;

    execSync(dumpCommand, {
      cwd: PROJECT_DIR,
      stdio: "ignore",
      shell: true,
    });

    fs.renameSync(TEMP_DUMP_FILE, FINAL_DUMP_FILE);
    logSuccess(`✅ Adatbázis sikeresen elmentve: ${FINAL_DUMP_FILE}`);
    return true;
  } catch (err) {
    logError("❌ Nem sikerült elmenteni az adatbázist.");

    if (fs.existsSync(TEMP_DUMP_FILE)) {
      fs.unlinkSync(TEMP_DUMP_FILE);
    }

    return false;
  }
}

function shutdownDocker() {
  try {
    logInfo("🛑 Konténerek leállítása...");
    execSync("docker compose down", {
      cwd: PROJECT_DIR,
      stdio: "inherit",
      shell: true,
    });
    logSuccess("✅ Minden leállt.");
  } catch (err) {
    logError("⚠️ Hiba történt a konténerek leállításakor.");
  }
}

/* =====================================
   INDÍTÁS
===================================== */

ensureDbInitDir();

console.clear();
logWarn("⏳ Az Exploree rendszer indítása folyamatban...");

let systemReady = false;
let shuttingDown = false;

const docker = spawn("docker", ["compose", "up", "-d", "--build"], {
  cwd: PROJECT_DIR,
  stdio: "inherit",
  shell: true,
});

docker.on("close", (code) => {
  if (code === 0) {
    systemReady = true;

    console.clear();
    logSuccess("✅ A RENDSZER ELINDULT!");
    console.log("--------------------------------------------------");
    console.log(`🌍 WEBOLDAL:      ${FRONTEND_URL}`);
    console.log(`🗄️ phpMyAdmin:    ${PHPMYADMIN_URL}`);
    console.log(`⚙️ BACKEND API:   ${BACKEND_URL}`);
    console.log(`💾 SQL MENTÉS:    ${FINAL_DUMP_FILE}`);
    console.log("--------------------------------------------------");
    logWarn("🛑 Leállításhoz és automatikus mentéshez nyomj: CTRL + C");
  } else {
    logError("❌ Hiba történt a Docker indításakor.");
    process.exit(1);
  }
});

/* =====================================
   LEÁLLÍTÁS
===================================== */

process.on("SIGINT", () => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("");
  logWarn("⏳ Leállítás folyamatban...");

  if (!systemReady) {
    logWarn("⚠️ A rendszer nem indult el teljesen, csak leállítom a konténereket.");
    shutdownDocker();
    process.exit(0);
  }

  const dumpSuccessful = saveDatabase();

  if (!dumpSuccessful) {
    logWarn("⚠️ A mentés nem sikerült, de leállítom a konténereket.");
  }

  shutdownDocker();
  process.exit(0);
});