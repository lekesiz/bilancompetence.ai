// Root layout - Minimal wrapper for next-intl
// The actual layout with all components is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

