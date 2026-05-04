import { jwtVerify } from "jose";

function getSecretBytes(): Uint8Array {
  const raw =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-only-jwt-secret-min-16!" : "");
  if (!raw || raw.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters");
  }
  return new TextEncoder().encode(raw);
}

export type VerifiedCandidate = {
  candidateAccountId: string;
  email: string;
};

export async function verifyCandidateAccessToken(token: string): Promise<VerifiedCandidate | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretBytes());
    if (payload.typ !== "candidate") return null;
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!sub) return null;
    return { candidateAccountId: sub, email };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}
