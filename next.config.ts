import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@interledger/open-payments"]
  }
};

export default nextConfig;
