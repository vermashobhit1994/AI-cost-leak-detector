import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
