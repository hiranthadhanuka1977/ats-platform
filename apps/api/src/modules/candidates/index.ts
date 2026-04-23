import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { sendCandidateOtpEmail } from "../../lib/email";
import { prisma } from "../../lib/prisma";

export const candidatesModule = new Hono();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_SEC = 60;
const OTP_MAX_PER_HOUR = 5;
const MIN_PASSWORD_LENGTH = 8;
const OTP_DELIVERY_MODE = process.env.OTP_DELIVERY_MODE ?? (process.env.NODE_ENV === "production" ? "smtp" : "dummy");
const DUMMY_OTP_CODE = "111111";

function normalizeEmail(input: unknown): string {
  return typeof input === "string" ? input.trim().toLowerCase() : "";
}

function sanitizeName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

function generateOtpCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueVerificationOtp(candidateAccountId: string, email: string) {
  const otpCode = OTP_DELIVERY_MODE === "dummy" ? DUMMY_OTP_CODE : generateOtpCode();
  const otpHash = hashToken(otpCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.candidateVerificationToken.updateMany({
      where: {
        candidateAccountId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.candidateVerificationToken.create({
      data: {
        candidateAccountId,
        tokenHash: otpHash,
        expiresAt,
      },
    });
  });

  if (OTP_DELIVERY_MODE === "dummy") {
    return;
  }

  await sendCandidateOtpEmail(email, otpCode);
}

candidatesModule.post("/register", async (c) => {
  let body: { email?: string; password?: string; firstName?: string; lastName?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = sanitizeName(body.firstName);
  const lastName = sanitizeName(body.lastName);

  if (!isValidEmail(email) || !isStrongPassword(password)) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const existing = await prisma.candidateAccount.findUnique({
    where: { emailNormalized: email },
    include: { profile: true },
  });
  if (existing && existing.status !== "pending_verification") {
    return c.json({ error: { code: "EMAIL_ALREADY_EXISTS" } }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const accountId = existing?.id ?? crypto.randomUUID();
  try {
    await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.candidateAccount.update({
        where: { id: existing.id },
        data: {
          email,
          emailNormalized: email,
          passwordHash,
          status: "pending_verification",
          emailVerifiedAt: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
          profile: {
            upsert: {
              create: {
                firstName,
                lastName,
              },
              update: {
                firstName,
                lastName,
              },
            },
          },
        },
      });
    } else {
      await tx.candidateAccount.create({
        data: {
          id: accountId,
          email,
          emailNormalized: email,
          passwordHash,
          status: "pending_verification",
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
      });
    }
    });
    await issueVerificationOtp(accountId, email);
  } catch (error) {
    console.error("Failed to send candidate registration OTP", error);
    return c.json({ error: { code: "EMAIL_SEND_FAILED" } }, 500);
  }

  return c.json(
    {
      data: {
        email,
        message:
          OTP_DELIVERY_MODE === "dummy"
            ? "Use OTP 111111 for testing."
            : "A 6-digit OTP has been sent to your email.",
      },
    },
    202
  );
});

candidatesModule.post("/resend-otp", async (c) => {
  let body: { email?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const account = await prisma.candidateAccount.findUnique({
    where: { emailNormalized: email },
  });

  // Keep response non-enumerating for missing/active/disabled users.
  if (!account || account.status !== "pending_verification") {
    return c.json(
      {
        data: {
          message: "If a pending account exists, a new OTP has been sent.",
        },
      },
      202
    );
  }

  const now = new Date();
  const recentOtp = await prisma.candidateVerificationToken.findFirst({
    where: {
      candidateAccountId: account.id,
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const elapsedSec = Math.floor((now.getTime() - recentOtp.createdAt.getTime()) / 1000);
    const remainingSec = OTP_RESEND_COOLDOWN_SEC - elapsedSec;
    if (remainingSec > 0) {
      return c.json(
        {
          error: { code: "RATE_LIMITED" },
          data: { retryAfterSec: remainingSec },
        },
        429
      );
    }
  }

  const issuedLastHour = await prisma.candidateVerificationToken.count({
    where: {
      candidateAccountId: account.id,
      createdAt: { gt: new Date(now.getTime() - 60 * 60 * 1000) },
    },
  });
  if (issuedLastHour >= OTP_MAX_PER_HOUR) {
    return c.json(
      {
        error: { code: "RATE_LIMITED" },
        data: { retryAfterSec: OTP_RESEND_COOLDOWN_SEC },
      },
      429
    );
  }

  try {
    await issueVerificationOtp(account.id, account.email);
  } catch (error) {
    console.error("Failed to resend candidate registration OTP", error);
    return c.json({ error: { code: "EMAIL_SEND_FAILED" } }, 500);
  }

  return c.json(
    {
      data: {
        message: OTP_DELIVERY_MODE === "dummy" ? "Use OTP 111111 for testing." : "A new OTP has been sent to your email.",
      },
    },
    202
  );
});

candidatesModule.post("/verify-email", async (c) => {
  let body: { email?: string; otp?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const email = normalizeEmail(body.email);
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";
  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const account = await prisma.candidateAccount.findUnique({
    where: { emailNormalized: email },
  });
  if (!account) {
    return c.json({ error: { code: "INVALID_OR_EXPIRED_TOKEN" } }, 400);
  }

  const tokenHash = hashToken(otp);
  const now = new Date();
  const row = await prisma.candidateVerificationToken.findFirst({
    where: {
      candidateAccountId: account.id,
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return c.json({ error: { code: "INVALID_OR_EXPIRED_TOKEN" } }, 400);
  }

  await prisma.$transaction([
    prisma.candidateVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: now },
    }),
    prisma.candidateAccount.update({
      where: { id: account.id },
      data: {
        status: "active",
        emailVerifiedAt: now,
      },
    }),
  ]);

  return c.json({ data: { message: "Email verified successfully." } });
});

candidatesModule.post("/forgot-password", async (c) => {
  let body: { email?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const account = await prisma.candidateAccount.findUnique({
    where: { emailNormalized: email },
  });

  if (account && account.status !== "disabled") {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.candidatePasswordResetToken.create({
      data: {
        candidateAccountId: account.id,
        tokenHash,
        expiresAt,
      },
    });
  }

  return c.json(
    {
      data: {
        message: "If an account exists for this email, you will receive reset instructions.",
      },
    },
    202
  );
});

candidatesModule.post("/reset-password", async (c) => {
  let body: { token?: string; newPassword?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!token || !isStrongPassword(newPassword)) {
    return c.json({ error: { code: "VALIDATION_ERROR" } }, 400);
  }

  const tokenHash = hashToken(token);
  const now = new Date();
  const row = await prisma.candidatePasswordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return c.json({ error: { code: "INVALID_OR_EXPIRED_TOKEN" } }, 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.candidatePasswordResetToken.update({
      where: { id: row.id },
      data: { usedAt: now },
    }),
    prisma.candidateAccount.update({
      where: { id: row.candidateAccountId },
      data: {
        passwordHash,
        status: "active",
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
  ]);

  return c.json({ data: { message: "Password updated. You can sign in now." } });
});
