import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';

// ✅ Sprint 1.2: Re-enable i18n middleware for locale routing
// ✅ Sprint 1.3: Enhanced with language preference persistence
// ✅ Sprint 1.3 FIX: Changed localePrefix to 'as-needed' to avoid infinite redirects
//    - 'as-needed' only adds locale prefix for non-default locales (en, tr)
//    - Default locale (fr) has no prefix in URL
//    - This matches the existing URL structure and prevents redirect loops
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only show locale in URL for non-default locales
  localeDetection: true, // Auto-detect user's preferred language from browser/cookie
});

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Next.js internals (_next/*)
  // - Static files (*.*)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
