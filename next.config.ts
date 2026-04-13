import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Disable upfront preloading of all page JS modules at startup — load on demand instead
    preloadEntriesOnStart: false,
    // Cache Server Component fetch responses across HMR refreshes to reduce CPU on file save
    serverComponentsHmrCache: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.amazonaws.com" }],
  },
};

export default nextConfig;
