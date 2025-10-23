/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  // Image Optimization - P2.1: CRITICAL PERFORMANCE IMPROVEMENT
  // Enabled next/image optimization for LCP improvement of 1-2 seconds
  images: {
    unoptimized: false, // Enable Next.js image optimization ✅
    formats: ['image/avif', 'image/webp'], // Modern formats for smaller file sizes
    // Device sizes for responsive images (cover common breakpoints)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcSet generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (immutable)
    cache: 31536000,
    // Allow external images from API domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
  // Compression for response size reduction
  compress: true,
  // Disable powered-by header for security
  poweredByHeader: false,
};

module.exports = nextConfig;
