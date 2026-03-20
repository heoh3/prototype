import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/prototype",
  images: { unoptimized: true },
};

export default nextConfig;
