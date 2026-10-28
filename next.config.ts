import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The dev overlay's segment explorer crashes the client manifest on this
  // Next 15.5 patch version; disabling indicators keeps `next dev` usable.
  devIndicators: false,
};

export default nextConfig;
