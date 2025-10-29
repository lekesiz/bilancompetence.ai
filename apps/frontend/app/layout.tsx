import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentBanner } from "@/components/consent";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Bilan de Compétences | BilanCompetence.ai",
  description: "Donnez un nouveau souffle à votre carrière avec un bilan de compétences personnalisé.",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BilanCompetence.AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="bg-background text-textPrimary font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <QueryProvider>
          <ThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ConsentBanner />
            <Toaster position="top-right" richColors closeButton />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

