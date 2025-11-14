/** @type {import('next').NextConfig} */
const nextConfig = {
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

