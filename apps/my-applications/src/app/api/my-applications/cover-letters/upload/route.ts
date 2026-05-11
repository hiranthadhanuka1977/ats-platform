import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCvStorageRoot } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Map<string, string>([
  ["application/pdf", ".pdf"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/msword", ".doc"],
]);

function extFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return ".pdf";
  if (lower.endsWith(".docx")) return ".docx";
  if (lower.endsWith(".doc")) return ".doc";
  return "";
}

function resolveMimeAndExt(file: File): { mime: string; ext: string } | null {
  const nameExt = extFromName(file.name);
  let mime = (file.type || "").trim();
  if (!mime || mime === "application/octet-stream") {
    if (nameExt === ".pdf") mime = "application/pdf";
    else if (nameExt === ".docx") mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (nameExt === ".doc") mime = "application/msword";
    else return null;
  }
  const ext = ALLOWED.get(mime) ?? nameExt;
  if (!ALLOWED.has(mime) || !ext) return null;
  return { mime, ext };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Expected multipart form data." } }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Missing file field." } }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: { code: "FILE_TOO_LARGE", message: "Maximum upload size is 10 MB." } }, { status: 413 });
  }

  const resolved = resolveMimeAndExt(file);
  if (!resolved) {
    return NextResponse.json(
      { error: { code: "UNSUPPORTED_TYPE", message: "Cover letter must be PDF or Word (.doc, .docx)." } },
      { status: 415 },
    );
  }

  const id = randomUUID();
  const coverLetterRoot = path.join(getCvStorageRoot(), "..", "cover-letters");
  const absDir = path.join(coverLetterRoot, user.candidateAccountId);
  await mkdir(absDir, { recursive: true });

  const storedName = `${id}${resolved.ext}`;
  const absPath = path.join(absDir, storedName);
  await writeFile(absPath, Buffer.from(await file.arrayBuffer()));

  const fileUrl = `/storage/cover-letters/${encodeURIComponent(user.candidateAccountId)}/${encodeURIComponent(storedName)}`;

  const row = await prisma.candidateCoverLetter.create({
    data: {
      id,
      candidateAccountId: user.candidateAccountId,
      mode: "file",
      fileUrl,
      fileName: file.name.slice(0, 255),
    },
    select: {
      id: true,
      fileName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: {
      id: row.id,
      fileName: row.fileName ?? "Cover letter",
      createdAt: row.createdAt.toISOString(),
    },
  });
}
