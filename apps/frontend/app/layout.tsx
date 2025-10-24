import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Bilan de Compétences | BilanCompetence.ai",
  description: "Donnez un nouveau souffle à votre carrière avec un bilan de compétences personnalisé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-background text-textPrimary font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

