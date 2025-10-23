import type { Config } from 'tailwindcss';

const config: Config = {
  // P2.5: Tailwind CSS Optimization - Content purging
  // Only includes files that actually use Tailwind classes
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        secondary: '#00CC88',
        accent: '#FF6B35',
      },
    },
  },
  plugins: [],
  // Production optimization
  ...(process.env.NODE_ENV === 'production' && {
    // Production-specific optimizations
    minify: true,
  }),
};
export default config;
