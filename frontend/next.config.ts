import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/server deployments
  output: "standalone",

  // Allow external images if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
