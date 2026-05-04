import path from "path";
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

// Next.js only auto-loads `apps/my-applications/.env*`; the API loads the repo root `.env`.
// CV routes verify JWTs with `JWT_SECRET` — keep them aligned (same value as `apps/api`).
const repoRoot = path.join(__dirname, "../..");
loadEnv({ path: path.join(repoRoot, ".env") });
loadEnv({ path: path.join(repoRoot, ".env.local"), override: true });
loadEnv({ path: path.join(__dirname, ".env"), override: true });
loadEnv({ path: path.join(__dirname, ".env.local"), override: true });

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
