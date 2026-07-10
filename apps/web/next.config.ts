import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["database", "shared", "types", "ui", "price-engine", "ocr", "ai", "scrapers", "history", "statistics"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
