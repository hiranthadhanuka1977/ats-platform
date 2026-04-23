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
const CANDIDATE_LOCK_THRESHOLD = 5;
const CANDIDATE_LOCK_MINUTES = 15;

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

  const candidate = await prisma.candidateAccount.findUnique({
    where: { emailNormalized: email },
    include: { profile: true },
  });
  if (!candidate) {
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }
  if (candidate.status === "disabled") {
    return c.json({ error: { code: "ACCOUNT_DISABLED" } }, 403);
  }
  if (candidate.status === "pending_verification") {
    return c.json({ error: { code: "EMAIL_NOT_VERIFIED" } }, 403);
  }
  if (candidate.lockedUntil && candidate.lockedUntil > new Date()) {
    return c.json({ error: { code: "ACCOUNT_LOCKED" } }, 403);
  }
  if (!candidate.passwordHash) {
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }
  const ok = await bcrypt.compare(password, candidate.passwordHash);
  if (!ok) {
    const failedAttempts = candidate.failedLoginAttempts + 1;
    const shouldLock = failedAttempts >= CANDIDATE_LOCK_THRESHOLD;
    await prisma.candidateAccount.update({
      where: { id: candidate.id },
      data: {
        failedLoginAttempts: failedAttempts,
        ...(shouldLock
          ? {
              status: "locked",
              lockedUntil: new Date(Date.now() + CANDIDATE_LOCK_MINUTES * 60 * 1000),
            }
          : {}),
      },
    });
    return c.json({ error: { code: "INVALID_CREDENTIALS" } }, 401);
  }

  const now = new Date();
  await prisma.candidateAccount.update({
    where: { id: candidate.id },
    data: {
      failedLoginAttempts: 0,
      status: "active",
      lockedUntil: null,
      lastLoginAt: now,
    },
  });

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
    const candidate = await prisma.candidateAccount.findUnique({
      where: { id: sub },
      include: { profile: true },
    });
    if (!candidate || candidate.status === "disabled") {
      return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
    }
    if (candidate.status === "locked" && candidate.lockedUntil && candidate.lockedUntil > new Date()) {
      return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
    }
    return c.json({
      data: {
        id: candidate.id,
        type: "candidate",
        email: candidate.email,
        firstName: candidate.profile?.firstName ?? null,
        lastName: candidate.profile?.lastName ?? null,
        avatarUrl: candidate.profile?.avatarUrl ?? null,
      },
    });
  }

  return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
});

authModule.post("/logout", async () => {
  return new Response(null, { status: 204 });
});
