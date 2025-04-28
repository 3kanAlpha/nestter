import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.nest.mgcup.net",
      }
    ]
  },
  experimental: {
    authInterrupts: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
