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

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Enable instrumentation for Sentry
  experimental: {
    instrumentationHook: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  env: getEnvVars(),
  async redirects() {
    return [
      { source: '/', destination: '/fr', permanent: false },
      { source: '/en', destination: '/fr', permanent: false },
      { source: '/en/:path*', destination: '/fr/:path*', permanent: false },
    ];
  },
  // Image Optimization - P2.1: CRITICAL PERFORMANCE IMPROVEMENT
  // Enabled next/image optimization for LCP improvement of 1-2 seconds
  images: {
    unoptimized: false, // Enable Next.js image optimization ✅
    formats: ['image/avif', 'image/webp'], // Modern formats for smaller file sizes
    // Device sizes for responsive images (cover common breakpoints)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcSet generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external images from API domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Compression for response size reduction
  compress: true,
  // Disable powered-by header for security
  poweredByHeader: false,
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Enable silent mode to reduce console noise
  silent: true,

  // Organization and project for Sentry
  org: process.env.SENTRY_ORG || 'bilancompetence',
  project: process.env.SENTRY_PROJECT || 'frontend',

  // Only upload source maps in production
  widenClientFileUpload: true,

  // Automatically annotate React components for better stack traces
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disable source maps upload in development
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
};

// Wrap with Sentry if DSN is provided
const finalConfig = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions)
  : withNextIntl(nextConfig);

module.exports = finalConfig;
