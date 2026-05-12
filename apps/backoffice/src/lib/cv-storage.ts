import path from "node:path";

export function getCvStorageRoot(): string {
  const configured = process.env.CV_STORAGE_ROOT?.trim();
  if (configured) return configured;
  return path.join(process.cwd(), "..", "..", "storage", "cvs");
}

export function resolveStoredPath(storedPath: string): string {
  const normalized = storedPath.replace(/\\/g, "/");
  if (normalized.startsWith("storage/cvs/")) {
    const rel = normalized.slice("storage/cvs/".length).replace(/\//g, path.sep);
    return path.join(getCvStorageRoot(), rel);
  }
  if (normalized.startsWith("uploads/cv/")) {
    return path.join(process.cwd(), normalized.replace(/\//g, path.sep));
  }
  return path.join(process.cwd(), normalized.replace(/\//g, path.sep));
}
