import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo: lockfile at repo root (`ats-platform` / `markup_v1`)
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
