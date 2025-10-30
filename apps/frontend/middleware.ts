import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // fr için prefix yok, diğerleri için var
});

export default function middleware(request: NextRequest) {
  // Delegate all routing to next-intl. With localePrefix 'as-needed',
  // default locale (fr) is served at '/'.
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

