import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The dev overlay's segment explorer crashes the client manifest on this
  // Next 15.5 patch version; disabling indicators keeps `next dev` usable.
  devIndicators: false,
  async rewrites() {
    // Android fetches this exact path for Trusted Web Activity verification.
    // A dot-directory under app/ is not routable, so it is mapped here.
    return [
      {
        source: "/.well-known/assetlinks.json",
        destination: "/api/assetlinks",
      },
    ];
  },
};

export default nextConfig;
