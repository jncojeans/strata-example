/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/strata-example',
  assetPrefix: '/strata-example',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  typescript: {
    // Abort build on type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Abort build on ESLint errors
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

