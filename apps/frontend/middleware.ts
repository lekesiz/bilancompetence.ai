import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';

// ✅ Sprint 1.2: Re-enable i18n middleware for locale routing
// ✅ Sprint 1.3: Enhanced with language preference persistence
// ✅ Sprint 1.3 FIX V2: Use 'always' to match [locale] folder structure
//    - app/[locale]/ structure REQUIRES localePrefix: 'always'
//    - All URLs have locale: /fr/*, /en/*, /tr/*
//    - Root / auto-redirects to /fr (handled by middleware)
//    - Removed manual redirect from app/page.tsx to prevent conflicts
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Required for [locale] folder structure
  localeDetection: true, // Auto-detect user's preferred language from browser/cookie
});

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Next.js internals (_next/*)
  // - Static files (*.*)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
