import fs from "node:fs";
import path from "node:path";

function findRepoStorageCvs(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 8; i += 1) {
    const storageCvs = path.join(dir, "storage", "cvs");
    const myApps = path.join(dir, "apps", "my-applications");
    if (fs.existsSync(myApps) && fs.existsSync(storageCvs)) {
      return storageCvs;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function getCvStorageRoot(): string {
  const configured = process.env.CV_STORAGE_ROOT?.trim();
  if (configured) return path.resolve(configured);

  const fromWalk = findRepoStorageCvs(process.cwd());
  if (fromWalk) return fromWalk;

  // Fallback when cwd is apps/my-applications
  return path.resolve(process.cwd(), "..", "..", "storage", "cvs");
}

export function toStoredPath(candidateAccountId: string, filename: string): string {
  return path.join("storage", "cvs", candidateAccountId, filename).replace(/\\/g, "/");
}

export function resolveStoredPath(storedPath: string): string {
  const normalized = storedPath.replace(/\\/g, "/");
  if (normalized.startsWith("storage/cvs/")) {
    const rel = normalized.slice("storage/cvs/".length).replace(/\//g, path.sep);
    return path.join(getCvStorageRoot(), rel);
  }
  if (normalized.startsWith("uploads/cv/")) {
    // Backward-compat for older rows.
    return path.join(process.cwd(), normalized.replace(/\//g, path.sep));
  }
  return path.join(process.cwd(), normalized.replace(/\//g, path.sep));
}
