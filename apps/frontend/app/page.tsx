import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n-config';

// Root route redirects to default locale
// This ensures / redirects to /fr (or default locale)
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

