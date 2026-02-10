import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "considerable-contributions-fathers-monthly.trycloudflare.com",
        "https://considerable-contributions-fathers-monthly.trycloudflare.com",
        "192.168.11.108:3000",
        "http://192.168.11.108:3000"
      ]
    }
  },
  // @ts-ignore - explicitly allowed in current version for tunnel dev
  allowedDevOrigins: [
    "considerable-contributions-fathers-monthly.trycloudflare.com",
    "https://considerable-contributions-fathers-monthly.trycloudflare.com",
    "192.168.11.108:3000",
    "http://192.168.11.108:3000"
  ]
} as any;

export default nextConfig;
