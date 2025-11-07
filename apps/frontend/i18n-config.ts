// i18n Configuration
// ✅ Sprint 1.2: Added Turkish (tr) support
export const locales = ['fr', 'en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
