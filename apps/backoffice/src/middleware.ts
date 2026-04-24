import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecretBytes } from "@/lib/jwt-secret";

const API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";

async function isValidStaffToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    return payload.typ === "staff";
  } catch {
    // Fallback for tokens issued by apps/api when secrets differ in local envs.
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;
      const payload = (await response.json()) as { data?: { type?: string } };
      return payload.data?.type === "staff";
    } catch {
      return false;
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bo_access")?.value;

  if (pathname === "/login") {
    if (token) {
      const ok = await isValidStaffToken(token);
      if (ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const ok = await isValidStaffToken(token);
  if (ok) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static files and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
