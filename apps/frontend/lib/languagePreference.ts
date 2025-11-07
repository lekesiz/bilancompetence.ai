/**
 * Language Preference Utility
 * Sprint 1.3 - Part 1: Language Persistence Implementation
 *
 * Provides functions to save and retrieve user's language preference
 * using both localStorage (client-side) and cookies (server-side accessible)
 */

import { type Locale, locales, defaultLocale } from '@/i18n-config';
import Cookies from 'js-cookie';

const LANGUAGE_PREFERENCE_KEY = 'preferred-locale';
const COOKIE_MAX_AGE = 365; // 1 year in days

/**
 * Save user's language preference to both localStorage and cookie
 * @param locale - The locale to save (fr, en, tr)
 */
export function saveLanguagePreference(locale: Locale): void {
  try {
    // Save to localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_PREFERENCE_KEY, locale);
    }

    // Save to cookie for server-side access (middleware can read this)
    Cookies.set(LANGUAGE_PREFERENCE_KEY, locale, {
      expires: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    });
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
}

/**
 * Get user's saved language preference
 * Tries localStorage first, then cookie, then returns default
 * @returns The saved locale or default locale (fr)
 */
export function getLanguagePreference(): Locale {
  try {
    // Try localStorage first (client-side only)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      if (stored && locales.includes(stored as Locale)) {
        return stored as Locale;
      }
    }

    // Try cookie (works on both client and server)
    const cookieValue = Cookies.get(LANGUAGE_PREFERENCE_KEY);
    if (cookieValue && locales.includes(cookieValue as Locale)) {
      return cookieValue as Locale;
    }
  } catch (error) {
    console.error('Failed to get language preference:', error);
  }

  // Fallback to default locale
  return defaultLocale;
}

/**
 * Clear user's language preference
 * Useful for testing or user logout
 */
export function clearLanguagePreference(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
    }
    Cookies.remove(LANGUAGE_PREFERENCE_KEY, { path: '/' });
  } catch (error) {
    console.error('Failed to clear language preference:', error);
  }
}

/**
 * Check if a language preference is currently saved
 * @returns true if a preference exists, false otherwise
 */
export function hasLanguagePreference(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      if (stored && locales.includes(stored as Locale)) {
        return true;
      }
    }

    const cookieValue = Cookies.get(LANGUAGE_PREFERENCE_KEY);
    return !!(cookieValue && locales.includes(cookieValue as Locale));
  } catch (error) {
    console.error('Failed to check language preference:', error);
    return false;
  }
}
