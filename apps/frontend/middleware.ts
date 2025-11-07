import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, type Locale } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Sprint 1.2: Re-enable i18n middleware for locale routing
// ✅ Sprint 1.3: Enhanced with language preference persistence
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL (/fr/*, /en/*, /tr/*)
  localeDetection: true, // Auto-detect user's preferred language
});

// Middleware wrapper to handle language preference from cookie
export default function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get('preferred-locale')?.value;
  const pathname = request.nextUrl.pathname;

  // If user has a saved language preference and is on root path, redirect to preferred locale
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    // Check if user is on root path without locale
    if (pathname === '/' || pathname === '') {
      const preferredLocale = cookieLocale as Locale;
      if (preferredLocale !== defaultLocale) {
        const redirectUrl = new URL(`/${preferredLocale}`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Otherwise, use default next-intl middleware behavior
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Next.js internals (_next/*)
  // - Static files (*.*)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
