'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Clair' },
    { value: 'dark' as const, icon: Moon, label: 'Sombre' },
    { value: 'system' as const, icon: Monitor, label: 'Système' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${theme === value 
              ? 'text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={label}
          title={label}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
        </motion.button>
      ))}
    </div>
  );
}

