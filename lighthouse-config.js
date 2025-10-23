/**
 * Lighthouse Configuration
 * Custom settings for performance testing
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Throttling settings
    throttling: {
      rttMs: 40,
      downstreamThroughputKbps: 10240,
      upstreamThroughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    // Audit settings
    skipAudits: [],
    // Gather settings
    onlyCategories: [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
      'pwa',
    ],
    // Timeout settings
    maxWaitForLoad: 45000,
    maxWaitForFcp: 15000,
    maxWaitForInteractive: 15000,
  },
};
