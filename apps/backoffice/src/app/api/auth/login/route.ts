import { NextRequest, NextResponse } from "next/server";
import { authenticateStaff } from "@/lib/staff-auth";

const API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";

/**
 * Sets httpOnly cookies after staff login.
 * Prefers local DB auth (Prisma) so login works without Hono; optional proxy to API if
 * `USE_API_AUTH=true` (e.g. shared auth deployment).
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  const useApiOnly = process.env.USE_API_AUTH === "true";

  if (!useApiOnly) {
    const local = await authenticateStaff(email, password);
    if ("error" in local) {
      if (local.error === "DB_UNAVAILABLE") {
        return NextResponse.json(
          { error: { code: "DB_UNAVAILABLE", message: "Database not configured or unreachable." } },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: { code: "INVALID_CREDENTIALS" } }, { status: 401 });
    }
    return jsonWithCookies(local);
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        audience: "staff",
      }),
    });

    const text = await res.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: { code: "API_ERROR", message: "Auth service returned invalid JSON." } },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    const data = json.data as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    return jsonWithCookies(data);
  } catch {
    return NextResponse.json(
      { error: { code: "API_UNREACHABLE", message: "Could not reach auth API." } },
      { status: 503 }
    );
  }
}

function jsonWithCookies(data: { accessToken: string; refreshToken: string; expiresIn: number }) {
  const out = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  out.cookies.set("bo_access", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: data.expiresIn,
    secure,
  });
  out.cookies.set("bo_refresh", data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure,
  });

  return out;
}
