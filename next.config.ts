import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.artic.edu",
        pathname: "/iiif/2/**",
      },
    ],
  },
};

export default nextConfig;
