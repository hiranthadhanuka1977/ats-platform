import bcrypt from "bcryptjs";
import { Hono } from "hono";
import {
  ACCESS_TTL_SEC,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from "../../lib/jwt";
import { prisma } from "../../lib/prisma";

/** Authentication — aligned with docs/specification/api/authentication.md */
export const authModule = new Hono();

authModule.post("/login", async (c) => {
  let body: { email?: string; password?: string; audience?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const audience = (body.audience ?? "candidate") as string;

  if (!email || !password) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  if (audience === "staff") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
    }
    const accessToken = await signAccessToken({
      sub: user.id,
      typ: "staff",
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = await signRefreshToken(user.id);
    return c.json({
      data: {
        accessToken,
        expiresIn: ACCESS_TTL_SEC,
        tokenType: "Bearer",
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          type: "staff",
          name: user.name,
          role: user.role,
        },
      },
    });
  }

  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (!candidate || !candidate.isActive) {
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }
  if (!candidate.passwordHash) {
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }
  const ok = await bcrypt.compare(password, candidate.passwordHash);
  if (!ok) {
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }

  const accessToken = await signAccessToken({
    sub: candidate.id,
    typ: "candidate",
    email: candidate.email,
  });
  const refreshToken = await signRefreshToken(candidate.id);
  return c.json({
    data: {
      accessToken,
      expiresIn: ACCESS_TTL_SEC,
      tokenType: "Bearer",
      refreshToken,
      user: {
        id: candidate.id,
        email: candidate.email,
        type: "candidate",
      },
    },
  });
});

authModule.get("/me", async (c) => {
  const auth = c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  }

  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  }

  const sub = payload.sub as string;
  const typ = payload.typ as string;

  if (typ === "staff") {
    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user || !user.isActive) {
      return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
    }
    return c.json({
      data: {
        id: user.id,
        type: "staff",
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  if (typ === "candidate") {
    const candidate = await prisma.candidate.findUnique({ where: { id: sub } });
    if (!candidate || !candidate.isActive) {
      return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
    }
    return c.json({
      data: {
        id: candidate.id,
        type: "candidate",
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        avatarUrl: candidate.avatarUrl,
      },
    });
  }

  return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
});

authModule.post("/logout", async () => {
  return new Response(null, { status: 204 });
});
