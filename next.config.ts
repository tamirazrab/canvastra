import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "canva-clone-ali.vercel.app",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Configure webpack to handle UploadThing type definition files (for non-turbopack builds)
  webpack: (config) => {
    // Ignore .d.cts files that cause module format conflicts
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.d\.cts$/,
      use: "ignore-loader",
    });
    // Ignore README.md files in node_modules
    config.module.rules.push({
      test: /node_modules\/.*\/README\.md$/,
      use: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
