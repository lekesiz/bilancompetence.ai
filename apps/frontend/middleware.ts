import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Always prefix locales to avoid /fr -> / redirect
  localePrefix: 'always',
  // Ignore Accept-Language and cookies; we control locale explicitly
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force default locale for root or unexpected paths
  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // Temporary harden default: if route resolves to /en root, send to /fr
  if (pathname === '/en' || pathname.startsWith('/en?')) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // Delegate remaining handling to next-intl
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

