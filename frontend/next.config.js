/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com']
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
};

module.exports = nextConfig;
