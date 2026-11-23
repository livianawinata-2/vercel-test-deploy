import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./sqlite.db"],
  },
};

export default nextConfig;
