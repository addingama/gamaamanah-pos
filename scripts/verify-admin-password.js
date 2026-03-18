/**
 * Cek apakah password cocok dengan ADMIN_PASSWORD_HASH (base64) di .env
 * Jalankan: node scripts/verify-admin-password.js <password>
 * Generate hash base64 untuk .env: node scripts/verify-admin-password.js --generate <password>
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

function decodeHash(value) {
  const raw = value.trim();
  if (raw.startsWith("$2a$") || raw.startsWith("$2b$")) return raw;
  if (raw.startsWith("$10$") && !raw.startsWith("$2b$")) return "$2b$" + raw;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.startsWith("$2a$") || decoded.startsWith("$2b$")) return decoded;
  } catch (_) {}
  return null;
}

const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.error("File .env tidak ditemukan di root project.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const match = envContent.match(
  /ADMIN_PASSWORD_HASH\s*=\s*(?:'([^']*)'|"([^"]*)"|(\S+))/,
);
const hashRaw = match ? (match[1] ?? match[2] ?? match[3] ?? "").trim() : "";

if (process.argv[2] === "--generate") {
  const pwd = process.argv[3];
  if (!pwd) {
    console.log("Pakai: node scripts/verify-admin-password.js --generate <password>");
    process.exit(1);
  }
  const hash = bcrypt.hashSync(pwd, 10);
  const b64 = Buffer.from(hash, "utf8").toString("base64");
  console.log("Salin ke .env (base64, aman untuk petik satu/dua):");
  console.log('ADMIN_PASSWORD_HASH="' + b64 + '"');
  process.exit(0);
}

if (!hashRaw) {
  console.error("ADMIN_PASSWORD_HASH tidak ditemukan di .env.");
  process.exit(1);
}

const hash = decodeHash(hashRaw);
if (!hash) {
  console.error("ADMIN_PASSWORD_HASH di .env bukan hash bcrypt atau base64 yang valid.");
  process.exit(1);
}

const password = process.argv[2];
if (!password) {
  console.log("Pakai: node scripts/verify-admin-password.js <password>");
  console.log("Atau generate hash: node scripts/verify-admin-password.js --generate <password>");
  process.exit(1);
}

bcrypt
  .compare(password, hash)
  .then((ok) => {
    if (ok) {
      console.log("Password cocok.");
    } else {
      console.log("Password TIDAK cocok. Pastikan hash di .env sesuai dengan password ini.");
    }
    process.exit(ok ? 0 : 1);
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
