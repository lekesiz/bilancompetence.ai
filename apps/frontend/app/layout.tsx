import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Bilan de Compétences | BilanCompetence.ai",
  description: "Donnez un nouveau souffle à votre carrière avec un bilan de compétences personnalisé.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BilanCompetence.AI",
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

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

