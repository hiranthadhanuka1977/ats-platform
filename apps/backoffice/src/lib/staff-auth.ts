/**
 * Staff login via Prisma + bcrypt — no Hono dependency (default backoffice flow).
 */
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ACCESS_TTL_SEC, signStaffAccessToken, signStaffRefreshToken } from "@/lib/jwt-secret";

export type StaffLoginSuccess = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type StaffLoginFailure = { error: "INVALID_CREDENTIALS" | "DB_UNAVAILABLE" };

export async function authenticateStaff(
  emailRaw: string,
  password: string
): Promise<StaffLoginSuccess | StaffLoginFailure> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !password) {
    return { error: "INVALID_CREDENTIALS" };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "DB_UNAVAILABLE" };
  }

  if (!user || !user.isActive) {
    return { error: "INVALID_CREDENTIALS" };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "INVALID_CREDENTIALS" };
  }

  const accessToken = await signStaffAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const refreshToken = await signStaffRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TTL_SEC,
  };
}
