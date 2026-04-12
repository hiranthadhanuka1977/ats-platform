/**
 * Loads only DATABASE_URL from the monorepo root `.env` so Prisma works when
 * developers keep a single root `.env` (Next.js does not load parent dirs by default).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");

function loadDatabaseUrlFromFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (m) {
      let v = m[1].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (v) process.env.DATABASE_URL = v;
      return;
    }
  }
}

loadDatabaseUrlFromFile(path.join(repoRoot, ".env"));
loadDatabaseUrlFromFile(path.join(repoRoot, ".env.local"));
