/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'module',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
