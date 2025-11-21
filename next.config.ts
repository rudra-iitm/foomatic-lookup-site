import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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