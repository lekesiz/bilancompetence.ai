import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Bilan de Compétences en ligne | 100% Finançable CPF | BilanCompetence.ai",
  description: "Faites le point sur vos compétences, identifiez vos motivations et construisez un projet professionnel qui vous ressemble. Certifié Qualiopi. Financement CPF. Accompagnement personnalisé en présentiel ou à distance.",
  keywords: "bilan de compétences, CPF, reconversion professionnelle, orientation professionnelle, bilan professionnel, formation CPF, Qualiopi, accompagnement carrière, projet professionnel, tests psychométriques, MBTI, RIASEC",
  authors: [{ name: "BilanCompetence.ai" }],
  creator: "BilanCompetence.ai",
  publisher: "BilanCompetence.ai",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://app.bilancompetence.ai',
    siteName: 'BilanCompetence.ai',
    title: 'Bilan de Compétences en ligne | 100% Finançable CPF',
    description: 'Donnez un nouveau souffle à votre carrière avec le bilan de compétences. Certifié Qualiopi, finançable par le CPF, accompagnement personnalisé.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BilanCompetence.ai - Bilan de Compétences en ligne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bilan de Compétences en ligne | BilanCompetence.ai',
    description: 'Certifié Qualiopi. 100% Finançable CPF. Accompagnement personnalisé.',
    images: ['/og-image.jpg'],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BilanCompetence.AI",
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// ✅ Sprint 1.3 FIX: Removed force-dynamic to allow static generation
// This was preventing proper build and causing <Html> import errors

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lang attribute will be set by [locale]/layout.tsx via context
  // Default to 'fr' for root layout
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="bg-background text-textPrimary font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors">
        {/* ✅ PHASE 3: Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

