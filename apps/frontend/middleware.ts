import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n-config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  // Temporarily disable automatic locale handling via middleware
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  // Bypass middleware behavior for now
  return NextResponse.next();
}

export const config = {
  // Disable matching to avoid intercepting any routes
  matcher: ['/__disable_mw__'],
};

