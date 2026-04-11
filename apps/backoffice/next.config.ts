import path from "path";
import type { NextConfig } from "next";

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
