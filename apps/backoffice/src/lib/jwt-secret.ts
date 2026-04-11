/**
 * HS256 JWT secret + signing — must match apps/api/src/lib/jwt.ts.
 * Middleware and login use the same helpers so tokens verify consistently.
 */
import { SignJWT } from "jose";

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

export function getJwtSecretBytes(): Uint8Array {
  const raw =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-only-jwt-secret-min-16!" : "");
  if (!raw || raw.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters in production");
  }
  return new TextEncoder().encode(raw);
}

export async function signStaffAccessToken(claims: {
  sub: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    typ: "staff",
    email: claims.email,
    name: claims.name,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(getJwtSecretBytes());
}

export async function signStaffRefreshToken(sub: string): Promise<string> {
  return new SignJWT({ tokenUse: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SEC}s`)
    .sign(getJwtSecretBytes());
}

export { ACCESS_TTL_SEC, REFRESH_TTL_SEC };
