import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TTL_SEC, getJwtSecretBytes, signStaffAccessToken, signStaffRefreshToken } from "@/lib/jwt-secret";

/**
 * Rotates access + refresh cookies from a valid `bo_refresh` JWT.
 * Used by the client to extend sessions while the user is active (see StaffSessionActivity).
 */
export async function POST() {
  const store = await cookies();
  const refreshToken = store.get("bo_refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: { code: "NO_REFRESH" } }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(refreshToken, getJwtSecretBytes());
    if (payload.tokenUse !== "refresh") {
      return NextResponse.json({ error: { code: "INVALID_REFRESH" } }, { status: 401 });
    }
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!sub) {
      return NextResponse.json({ error: { code: "INVALID_REFRESH" } }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: { code: "USER_INVALID" } }, { status: 401 });
    }

    const accessToken = await signStaffAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: String(user.role),
    });
    const newRefresh = await signStaffRefreshToken(user.id);

    const out = NextResponse.json({ ok: true, expiresIn: ACCESS_TTL_SEC });
    const secure = process.env.NODE_ENV === "production";
    out.cookies.set("bo_access", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TTL_SEC,
      secure,
    });
    out.cookies.set("bo_refresh", newRefresh, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure,
    });
    return out;
  } catch {
    return NextResponse.json({ error: { code: "INVALID_REFRESH" } }, { status: 401 });
  }
}
