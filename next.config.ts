import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@interledger/open-payments", "imghash", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },
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
