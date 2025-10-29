import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // fr için prefix yok, diğerleri için var
});

export default function middleware(request: NextRequest) {
  // Handle root route explicitly for next-intl
  const { pathname } = request.nextUrl;
  
  // If root route and not already a locale route, rewrite to default locale
  if (pathname === '/' || pathname === '') {
    // Rewrite to /[locale] route with default locale
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.rewrite(url);
  }
  
  // Use next-intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - files with an extension (e.g. .ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

