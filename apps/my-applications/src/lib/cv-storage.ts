import path from "node:path";

export function getCvStorageRoot(): string {
  const configured = process.env.CV_STORAGE_ROOT?.trim();
  if (configured) return configured;
  // Default shared storage folder at repo root.
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "..", "storage", "cvs");
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
    return path.join(/*turbopackIgnore: true*/ process.cwd(), normalized.replace(/\//g, path.sep));
  }
  return path.join(/*turbopackIgnore: true*/ process.cwd(), normalized.replace(/\//g, path.sep));
}
