// ✅ Sprint 1.3 FIX: This page is handled by next-intl middleware
// With localePrefix: 'as-needed', the middleware automatically redirects
// root / to the appropriate locale (fr has no prefix, en/tr have prefixes)
// We don't need manual redirect here - it causes conflicts with middleware

export default function RootPage() {
  // This page should never be reached because middleware handles routing
  // If it is reached, it means middleware didn't run (edge case)
  return null;
}


