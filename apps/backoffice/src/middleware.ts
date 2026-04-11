import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecretBytes } from "@/lib/jwt-secret";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bo_access")?.value;

  if (pathname === "/login") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecretBytes());
        if (payload.typ === "staff") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        /* invalid — allow login page */
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

  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    if (payload.typ === "staff") {
      return NextResponse.next();
    }
  } catch {
    /* fallthrough */
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
