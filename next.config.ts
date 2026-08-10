import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@interledger/open-payments"],
  async headers() {
    return [
      {
        // Uploaded artwork images (UUID filenames — immutable once created)
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
