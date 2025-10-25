import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Bleu Royal (Haguenau.pro style)
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        // Secondary Colors - Violet/Purple (Haguenau.pro style)
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        // Accent Colors - Jaune Vif (Haguenau.pro style)
        yellow: {
          50: 'var(--accent-yellow-50)',
          100: 'var(--accent-yellow-100)',
          200: 'var(--accent-yellow-200)',
          300: 'var(--accent-yellow-300)',
          400: 'var(--accent-yellow-400)',
          500: 'var(--accent-yellow-500)',
          600: 'var(--accent-yellow-600)',
          700: 'var(--accent-yellow-700)',
        },
        // Accent Colors - Vert (Haguenau.pro style)
        green: {
          50: 'var(--accent-green-50)',
          100: 'var(--accent-green-100)',
          200: 'var(--accent-green-200)',
          300: 'var(--accent-green-300)',
          400: 'var(--accent-green-400)',
          500: 'var(--accent-green-500)',
          600: 'var(--accent-green-600)',
          700: 'var(--accent-green-700)',
        },
        // Accent Colors - Orange (Haguenau.pro style)
        orange: {
          50: 'var(--accent-orange-50)',
          100: 'var(--accent-orange-100)',
          200: 'var(--accent-orange-200)',
          300: 'var(--accent-orange-300)',
          400: 'var(--accent-orange-400)',
          500: 'var(--accent-orange-500)',
          600: 'var(--accent-orange-600)',
          700: 'var(--accent-orange-700)',
        },
        // Accent Colors - Magenta (Haguenau.pro style)
        magenta: {
          50: 'var(--accent-magenta-50)',
          100: 'var(--accent-magenta-100)',
          200: 'var(--accent-magenta-200)',
          300: 'var(--accent-magenta-300)',
          400: 'var(--accent-magenta-400)',
          500: 'var(--accent-magenta-500)',
          600: 'var(--accent-magenta-600)',
          700: 'var(--accent-magenta-700)',
        },
        // Neutral Colors
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        // Semantic Colors
        success: {
          50: 'var(--success-50)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
        },
        warning: {
          50: 'var(--warning-50)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
        },
        error: {
          50: 'var(--error-50)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
        },
        info: {
          50: 'var(--info-50)',
          500: 'var(--info-500)',
          600: 'var(--info-600)',
          700: 'var(--info-700)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      fontSize: {
        'hero': ['var(--text-hero)', { lineHeight: '1.1', fontWeight: '700' }],
        'hero-mobile': ['var(--text-hero-mobile)', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        'section': 'var(--spacing-section)',
        'section-mobile': 'var(--spacing-section-mobile)',
        'content': 'var(--spacing-content)',
        'card': 'var(--spacing-card)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'card': 'var(--shadow-card)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
        'gradient-blue-purple': 'linear-gradient(90deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
        'gradient-blue-green': 'linear-gradient(90deg, var(--primary-600) 0%, var(--accent-green-500) 100%)',
        'gradient-stats': 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'blob': 'blob 7s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'blob': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
        '4000': '4000ms',
      },
    },
  },
  plugins: [],
  ...(process.env.NODE_ENV === 'production' && {
    minify: true,
  }),
};

export default config;

