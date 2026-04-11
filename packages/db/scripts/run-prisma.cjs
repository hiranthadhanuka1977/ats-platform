/**
 * Loads DATABASE_URL from repo root `.env` (or `packages/db/.env`) before invoking Prisma.
 * npm workspace scripts run with cwd in `packages/db`, so Prisma does not see the root `.env` by default.
 */
const path = require("path");
const { spawnSync } = require("child_process");

// __dirname is packages/db/scripts → repo root is ../../../
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node run-prisma.cjs <prisma args...>");
  process.exit(1);
}

const prismaCwd = path.join(__dirname, "..");
const result = spawnSync("npx", ["prisma", ...args], {
  cwd: prismaCwd,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
