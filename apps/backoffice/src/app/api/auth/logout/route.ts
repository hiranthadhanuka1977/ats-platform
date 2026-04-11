import { NextRequest, NextResponse } from "next/server";

/** Clears staff session cookies (stateless JWT — no server session store). */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete("bo_access");
  res.cookies.delete("bo_refresh");
  return res;
}
