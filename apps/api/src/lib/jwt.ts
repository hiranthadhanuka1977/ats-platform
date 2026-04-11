import { SignJWT, jwtVerify } from "jose";

const ACCESS_TTL_SEC = 15 * 60; // 900 — spec default
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

function getSecretString(): string {
  const raw = process.env.JWT_SECRET;
  if (raw && raw.length >= 16) return raw;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-jwt-secret-min-16!";
  }
  throw new Error("JWT_SECRET must be set to a string of at least 16 characters");
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(getSecretString());
}

export type AccessClaims = {
  sub: string;
  typ: "staff" | "candidate";
  email: string;
  role?: string;
  name?: string;
};

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  const jwt = await new SignJWT({
    typ: claims.typ,
    email: claims.email,
    ...(claims.role ? { role: claims.role } : {}),
    ...(claims.name ? { name: claims.name } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(getSecret());

  return jwt;
}

export async function signRefreshToken(sub: string): Promise<string> {
  return new SignJWT({ tokenUse: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SEC}s`)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export { ACCESS_TTL_SEC, REFRESH_TTL_SEC };
