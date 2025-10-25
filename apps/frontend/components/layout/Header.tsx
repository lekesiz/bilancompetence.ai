'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/quest-ce-quun-bilan', label: "Qu'est-ce qu'un bilan ?" },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/financement', label: 'Financement' },
  { href: '/bilan-a-distance', label: 'Bilan à distance' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-heading hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              BilanCompetence.ai
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="ml-4 flex items-center space-x-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="btn-primary btn-sm"
              >
                Commencer mon bilan
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block w-full text-center btn-primary mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Commencer mon bilan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

