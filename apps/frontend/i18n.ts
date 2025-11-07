import { getRequestConfig } from 'next-intl/server';
import { type Locale } from './i18n-config';

// ✅ Sprint 1.3 FIX: Removed notFound() - validation happens in layout.tsx
// Double validation was causing NEXT_NOT_FOUND errors
export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale as Locale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

