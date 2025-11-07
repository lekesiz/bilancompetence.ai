// ✅ Sprint 1.3 FIX: Force dynamic rendering for all auth pages
// Auth pages use useTranslations() which requires runtime i18n context
// This layout ensures no prerendering happens for /login, /register, etc.
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
