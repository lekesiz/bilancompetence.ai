import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Always prefix locales to avoid /fr -> / redirect
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  // Let next-intl handle root and all routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - files with an extension (e.g. .ico)
  matcher: ['/((?!api|_next|_vercel|healthz|.*\\..*).*)'],
};

