import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  turbopack: {
    root: process.cwd()
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tebex.io" },
      { protocol: "https", hostname: "**.tebexcdn.com" },
      { protocol: "https", hostname: "cdn.tebex.io" },
      { protocol: "https", hostname: "mc-heads.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" }
    ]
  }
};

export default nextConfig;
