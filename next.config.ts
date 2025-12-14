import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: path.join(process.cwd()),
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/foomatic-lookup-site' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/foomatic-lookup-site' : '',
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/public/ppds/**', '**/node_modules/**'],
        poll: false,
      };
    }
    return config;
  },
};

export default nextConfig;