import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BilanCompetence.AI',
  description: 'AI-powered platform for career assessment professionals in France',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <nav className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  BilanCompetence.AI
                </h1>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </a>
                <a href="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </a>
                <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="bg-gray-50 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-center text-gray-600">
              © 2025 BilanCompetence.AI. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
