import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const findyCoreInternal =
  process.env.FINDY_CORE_INTERNAL_URL ??
  process.env.FINDY_CORE_API_URL ??
  "http://localhost:3000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.3"],
  async rewrites() {
    return [
      {
        source: "/findy-core/:path*",
        destination: `${findyCoreInternal.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/mascot/**",
      },
      {
        pathname: "/brand/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
