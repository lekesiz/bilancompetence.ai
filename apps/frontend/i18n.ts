import { getRequestConfig } from 'next-intl/server';
import { type Locale, defaultLocale, isValidLocale } from './i18n-config';

// ✅ Sprint 1.3 FIX: Added fallback for undefined locale
// During static generation, locale may be undefined - fallback to defaultLocale
export default getRequestConfig(async ({ locale }) => {
  // Ensure we always have a valid locale
  const validLocale = (locale && isValidLocale(locale) ? locale : defaultLocale) as Locale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

