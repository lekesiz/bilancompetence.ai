/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
