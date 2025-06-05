import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // For Webpack 5, enable async WASM
      // syncWebAssembly: true, // If you need synchronous WASM loading
    };

    // For Webpack 4 (if you were on an older Next.js version), you'd use a rule like this:
    // config.module.rules.push({
    //   test: /\.wasm$/,
    //   type: 'javascript/auto',
    //   loader: 'file-loader',
    // });

    return config;
  },
};

export default nextConfig;
