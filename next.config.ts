import type { NextConfig } from "next";

// apps/backoffice/next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'localhost',
      'midware-dev.kcic.co.id',
      'midware.kcic.co.id',
      'bridgepay.kcic.co.id',
    ],
  },
};
export default nextConfig;