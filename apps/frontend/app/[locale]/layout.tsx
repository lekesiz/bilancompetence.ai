import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentBanner } from "@/components/consent";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

// Dynamic routing - no static generation for locale routes
// Client components cannot be prerendered
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// ✅ Sprint 1.3 FIX: Generate static params for all locales
// This prevents NEXT_NOT_FOUND errors by explicitly telling Next.js
// which [locale] paths are valid
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <ThemeProvider>
          <Header />
          {/* ✅ PHASE 3: Main content landmark with ID for skip link */}
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ConsentBanner />
          <Toaster position="top-right" richColors closeButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}

