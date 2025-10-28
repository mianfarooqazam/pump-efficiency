import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: {
      compilationMode: 'annotation',
    },
  },
};

export default nextConfig;
