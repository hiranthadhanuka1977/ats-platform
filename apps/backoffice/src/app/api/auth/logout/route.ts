import { NextRequest, NextResponse } from "next/server";

function clearSessionCookies(res: NextResponse) {
  res.cookies.delete("bo_access");
  res.cookies.delete("bo_refresh");
}

/** Clears staff session cookies (stateless JWT — no server session store). */
export async function POST(request: NextRequest) {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookies(res);
  return res;
}
