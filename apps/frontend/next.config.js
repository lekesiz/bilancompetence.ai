/** @type {import('next').NextConfig} */

// Ensure environment variables are properly loaded
const getEnvVars = () => {
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ommidwwqqrhupmhaqghx.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbWlkd3dxcXJodXBtaGFxZ2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0MDA0MjcsImV4cCI6MjAyNDk3NjQyN30.c8uN-S0iNsWIRBMnGDMKO3tUNPP5w78kN5hgE6OgMno',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'BilanCompetence.AI',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };
  return env;
};

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  env: getEnvVars(),
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
