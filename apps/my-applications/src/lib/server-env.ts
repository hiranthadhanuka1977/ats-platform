import path from "node:path";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";

let loaded = false;

function loadServerEnvFilesOnce() {
  if (loaded) return;
  loaded = true;

  const appRoot = process.cwd();
  const repoRoot = path.resolve(appRoot, "../..");
  const candidates = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(appRoot, ".env"),
    path.join(appRoot, ".env.local"),
  ];

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      loadEnv({ path: filePath, override: false });
    }
  }
}

export function getServerEnv(name: string): string {
  const direct = process.env[name];
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  loadServerEnvFilesOnce();
  const loadedValue = process.env[name];
  return typeof loadedValue === "string" ? loadedValue.trim() : "";
}
