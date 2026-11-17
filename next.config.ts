import type { NextConfig } from "next";

const appEnv = (
  process.env.APP_ENV ??
  process.env.VERCEL_ENV ??
  (process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build"
    ? "production"
    : "development")
).toLowerCase();
const isProduction = appEnv === "production";
const isDevelopment = appEnv === "development";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  "https://js.tebex.io",
  ...(isDevelopment ? ["'unsafe-eval'"] : [])
].join(" ");

const connectSources = [
  "'self'",
  "https://tebex.io",
  "https://*.tebex.io",
  "https://tebex.com",
  "https://*.tebex.com",
  "https://js.tebex.io",
  ...(isDevelopment ? ["ws:", "wss:"] : [])
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tebex.io https://*.tebex.io https://*.tebexcdn.com https://cdn.tebex.io https://dunb17ur4ymx4.cloudfront.net https://mc-heads.net https://cdn.discordapp.com https://i.ytimg.com https://www.youtube.com",
  "font-src 'self' data:",
  `connect-src ${connectSources}`,
  "frame-src https://tebex.io https://*.tebex.io https://tebex.com https://*.tebex.com https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self' blob: https://*.tebex.io https://*.tebexcdn.com https://cdn.tebex.io https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : [])
].join("; ");

const privateHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, max-age=0, must-revalidate"
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Vary", value: "Cookie" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  turbopack: {
    root: process.cwd()
  },
  async headers() {
    return [
      {
        source: "/cart",
        headers: privateHeaders
      },
      {
        source: "/login",
        headers: privateHeaders
      },
      {
        source: "/api/:path*",
        headers: privateHeaders
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy
          },
          ...(!isProduction
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : [])
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tebex.io" },
      { protocol: "https", hostname: "**.tebexcdn.com" },
      { protocol: "https", hostname: "cdn.tebex.io" },
      { protocol: "https", hostname: "mc-heads.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "i.ytimg.com" }
    ]
  }
};

export default nextConfig;
