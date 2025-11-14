/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // basePath and assetPrefix removed for custom domain
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

