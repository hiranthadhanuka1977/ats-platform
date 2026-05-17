import path from "path";
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

// Next.js only auto-loads `apps/backoffice/.env*`; share repo root secrets (e.g. OPENAI_API_KEY).
const repoRoot = path.join(__dirname, "../..");
loadEnv({ path: path.join(repoRoot, ".env") });
loadEnv({ path: path.join(repoRoot, ".env.local"), override: true });
loadEnv({ path: path.join(__dirname, ".env"), override: true });
loadEnv({ path: path.join(__dirname, ".env.local"), override: true });

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  /** Ensure `content/administration/*.md` is available when tracing server bundles (e.g. serverless). */
  outputFileTracingIncludes: {
    "/administration/[section]": ["./content/administration/**/*.md"],
  },
};

export default nextConfig;
