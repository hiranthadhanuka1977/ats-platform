/**
 * Creates the PostgreSQL database named in DATABASE_URL if it does not exist.
 * Reads repo root `.env` (run: npm run db:create from root).
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadDatabaseUrl() {
  const envPath = path.join(__dirname, "..", "..", "..", ".env");
  const raw = fs.readFileSync(envPath, "utf8");
  const m = raw.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
  if (!m) throw new Error("DATABASE_URL not found in repo root .env");
  return m[1].trim();
}

async function main() {
  const databaseUrl = loadDatabaseUrl();
  const target = new URL(databaseUrl);
  const dbName = target.pathname.replace(/^\//, "").split("/")[0] || "postgres";
  if (dbName === "postgres") {
    console.log("DATABASE_URL already points at `postgres`; nothing to create.");
    return;
  }

  target.pathname = "/postgres";
  const adminUrl = target.toString();

  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (rows.length > 0) {
      console.log(`Database "${dbName}" already exists.`);
      return;
    }
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database "${dbName}".`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
