import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';

// ✅ Sprint 1.2: Re-enable i18n middleware for locale routing
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL (/fr/*, /en/*)
  localeDetection: true, // Auto-detect user's preferred language
});

export default intlMiddleware;

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Next.js internals (_next/*)
  // - Static files (*.*)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
