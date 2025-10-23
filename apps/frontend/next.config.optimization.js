/**
 * Next.js Performance Optimization Configuration
 * For Qualiopi Module and other admin pages
 */

// Configuration exported for use in main next.config.js
const performanceConfig = {
  // Enable compression for static assets
  compress: true,

  // Enable React production mode optimizations
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable SWR (Stale-While-Revalidate) for data fetching
  experimental: {
    // Optimize package imports for code splitting
    optimizePackageImports: ['lodash', 'date-fns', 'zustand'],
  },

  // Headers for cache control
  async headers() {
    return [
      {
        source: '/admin/qualiopi/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/admin/qualiopi/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        qualiopi: {
          test: /[\\/]components[\\/]qualiopi[\\/]/,
          name: 'qualiopi-components',
          priority: 10,
          minChunks: 2,
        },
        common: {
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true,
        },
      };
    }

    return config;
  },
};

module.exports = performanceConfig;
