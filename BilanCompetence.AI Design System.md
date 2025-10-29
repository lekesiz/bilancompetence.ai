# BilanCompetence.AI Design System

**Version:** 2.0.0  
**Date:** 25 Octobre 2025  
**Status:** Production Ready

---

## 🎨 Design Philosophy

BilanCompetence.AI Design System, profesyonel, güvenilir ve erişilebilir bir kullanıcı deneyimi sunmak için tasarlanmıştır. Sistem, **tutarlılık**, **ölçeklenebilirlik** ve **bakım kolaylığı** prensipleri üzerine inşa edilmiştir.

### Core Principles

1. **Tutarlılık** - Tüm sayfalarda aynı görsel dil
2. **Erişilebilirlik** - WCAG 2.1 AA standartlarına uyum
3. **Performans** - Hızlı yükleme ve smooth animasyonlar
4. **Responsive** - Mobil-first yaklaşım
5. **Dark Mode** - Tam dark mode desteği

---

## 🎨 Color System

### Primary Color Palette

**Brand Color: Indigo** - Profesyonellik, güven ve bilgeliği temsil eder.

```css
/* Light Mode */
--primary-50:  #EEF2FF;   /* Lightest - Backgrounds */
--primary-100: #E0E7FF;   /* Very Light - Hover states */
--primary-200: #C7D2FE;   /* Light - Borders */
--primary-300: #A5B4FC;   /* Medium Light - Disabled states */
--primary-400: #818CF8;   /* Medium - Secondary actions */
--primary-500: #6366F1;   /* Base - Primary actions */
--primary-600: #4F46E5;   /* Dark - Hover states */
--primary-700: #4338CA;   /* Darker - Active states */
--primary-800: #3730A3;   /* Very Dark - Text on light bg */
--primary-900: #312E81;   /* Darkest - Headers */

/* Dark Mode Adjustments */
--primary-dark-50:  #312E81;
--primary-dark-100: #3730A3;
--primary-dark-200: #4338CA;
--primary-dark-300: #4F46E5;
--primary-dark-400: #6366F1;
--primary-dark-500: #818CF8;
--primary-dark-600: #A5B4FC;
--primary-dark-700: #C7D2FE;
--primary-dark-800: #E0E7FF;
--primary-dark-900: #EEF2FF;
```

### Neutral Colors

```css
/* Gray Scale */
--gray-50:  #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Semantic Colors

```css
/* Success - Green */
--success-50:  #ECFDF5;
--success-500: #10B981;
--success-600: #059669;
--success-700: #047857;

/* Warning - Amber */
--warning-50:  #FFFBEB;
--warning-500: #F59E0B;
--warning-600: #D97706;
--warning-700: #B45309;

/* Error - Red */
--error-50:  #FEF2F2;
--error-500: #EF4444;
--error-600: #DC2626;
--error-700: #B91C1C;

/* Info - Blue */
--info-50:  #EFF6FF;
--info-500: #3B82F6;
--info-600: #2563EB;
--info-700: #1D4ED8;
```

### Background & Surface Colors

```css
/* Light Mode */
--bg-primary:   #FFFFFF;    /* Main background */
--bg-secondary: #F9FAFB;    /* Secondary background */
--bg-tertiary:  #F3F4F6;    /* Tertiary background */
--surface:      #FFFFFF;    /* Cards, modals */
--surface-hover: #F9FAFB;   /* Hover states */

/* Dark Mode */
--bg-primary-dark:   #111827;
--bg-secondary-dark: #1F2937;
--bg-tertiary-dark:  #374151;
--surface-dark:      #1F2937;
--surface-hover-dark: #374151;
```

### Text Colors

```css
/* Light Mode */
--text-primary:   #111827;  /* Headings, important text */
--text-secondary: #4B5563;  /* Body text */
--text-tertiary:  #6B7280;  /* Muted text */
--text-disabled:  #9CA3AF;  /* Disabled text */
--text-inverse:   #FFFFFF;  /* Text on dark backgrounds */

/* Dark Mode */
--text-primary-dark:   #F9FAFB;
--text-secondary-dark: #D1D5DB;
--text-tertiary-dark:  #9CA3AF;
--text-disabled-dark:  #6B7280;
--text-inverse-dark:   #111827;
```

---

## 📝 Typography

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale

```css
/* Headings */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
```

### Font Weights

```css
--font-light:      300;
--font-normal:     400;
--font-medium:     500;
--font-semibold:   600;
--font-bold:       700;
--font-extrabold:  800;
```

### Line Heights

```css
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;
```

### Typography Usage

```tsx
// Headings
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
<h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-50">
<h4 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-50">

// Body Text
<p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
<p className="text-sm text-gray-600 dark:text-gray-400">

// Captions
<span className="text-xs text-gray-500 dark:text-gray-500">
```

---

## 📏 Spacing System

### Base Unit: 4px (0.25rem)

```css
--spacing-0:  0;
--spacing-1:  0.25rem;  /* 4px */
--spacing-2:  0.5rem;   /* 8px */
--spacing-3:  0.75rem;  /* 12px */
--spacing-4:  1rem;     /* 16px */
--spacing-5:  1.25rem;  /* 20px */
--spacing-6:  1.5rem;   /* 24px */
--spacing-8:  2rem;     /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
```

### Layout Spacing

```tsx
// Section Padding
<section className="py-16 md:py-24 px-4 md:px-6">

// Container Max Width
<div className="max-w-7xl mx-auto">

// Card Padding
<div className="p-6 md:p-8">

// Stack Spacing
<div className="space-y-4">  /* Vertical spacing */
<div className="space-x-4">  /* Horizontal spacing */
```

---

## 🎭 Shadows & Elevation

```css
/* Shadows */
--shadow-xs:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Dark Mode Shadows */
--shadow-dark-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-md:  0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-dark-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.5);
```

### Elevation Levels

```tsx
// Level 0 - Flat (No shadow)
<div className="shadow-none">

// Level 1 - Raised (Cards)
<div className="shadow-sm hover:shadow-md transition-shadow">

// Level 2 - Floating (Dropdowns, tooltips)
<div className="shadow-lg">

// Level 3 - Modal
<div className="shadow-2xl">
```

---

## 🔲 Border Radius

```css
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-2xl:  1rem;      /* 16px */
--radius-3xl:  1.5rem;    /* 24px */
--radius-full: 9999px;    /* Fully rounded */
```

### Usage

```tsx
// Buttons
<button className="rounded-lg">

// Cards
<div className="rounded-xl">

// Inputs
<input className="rounded-md">

// Avatars
<img className="rounded-full">
```

---

## 🎬 Animation & Transitions

### Timing Functions

```css
--ease-linear:     cubic-bezier(0, 0, 1, 1);
--ease-in:         cubic-bezier(0.4, 0, 1, 1);
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration

```css
--duration-fast:   150ms;
--duration-normal: 300ms;
--duration-slow:   500ms;
```

### Common Transitions

```tsx
// Hover effects
<div className="transition-all duration-300 ease-in-out hover:scale-105">

// Color transitions
<button className="transition-colors duration-200">

// Shadow transitions
<div className="transition-shadow duration-300">

// Transform transitions
<div className="transition-transform duration-300 hover:-translate-y-1">
```

---

## 🧩 Component Library

### Buttons

```tsx
// Primary Button
<button className="
  px-6 py-3 
  bg-primary-600 hover:bg-primary-700 
  text-white font-semibold 
  rounded-lg shadow-sm hover:shadow-md 
  transition-all duration-200 
  transform hover:-translate-y-0.5
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>

// Secondary Button
<button className="
  px-6 py-3 
  bg-white hover:bg-gray-50 
  text-gray-700 font-semibold 
  border border-gray-300 
  rounded-lg shadow-sm hover:shadow-md 
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Secondary Action
</button>

// Outline Button
<button className="
  px-6 py-3 
  bg-transparent hover:bg-primary-50 
  text-primary-600 font-semibold 
  border-2 border-primary-600 
  rounded-lg 
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Outline Action
</button>

// Ghost Button
<button className="
  px-6 py-3 
  bg-transparent hover:bg-gray-100 
  text-gray-700 font-semibold 
  rounded-lg 
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
">
  Ghost Action
</button>
```

### Cards

```tsx
// Basic Card
<div className="
  bg-white dark:bg-gray-800 
  rounded-xl shadow-sm hover:shadow-md 
  transition-shadow duration-300 
  p-6 
  border border-gray-200 dark:border-gray-700
">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-400">
    Card content goes here
  </p>
</div>

// Interactive Card
<div className="
  bg-white dark:bg-gray-800 
  rounded-xl shadow-sm hover:shadow-lg 
  transition-all duration-300 
  transform hover:-translate-y-1 
  p-6 
  border border-gray-200 dark:border-gray-700
  cursor-pointer
">
  Content
</div>
```

### Inputs

```tsx
// Text Input
<input 
  type="text"
  className="
    w-full px-4 py-3 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-100 
    border border-gray-300 dark:border-gray-600 
    rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
    transition-all duration-200
    placeholder:text-gray-400
  "
  placeholder="Enter text..."
/>

// Textarea
<textarea 
  className="
    w-full px-4 py-3 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-100 
    border border-gray-300 dark:border-gray-600 
    rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
    transition-all duration-200
    placeholder:text-gray-400
    resize-none
  "
  rows={4}
  placeholder="Enter text..."
/>

// Select
<select 
  className="
    w-full px-4 py-3 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-100 
    border border-gray-300 dark:border-gray-600 
    rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
    transition-all duration-200
    cursor-pointer
  "
>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges

```tsx
// Primary Badge
<span className="
  inline-flex items-center 
  px-3 py-1 
  bg-primary-100 dark:bg-primary-900 
  text-primary-800 dark:text-primary-200 
  text-sm font-medium 
  rounded-full
">
  Badge
</span>

// Success Badge
<span className="
  inline-flex items-center 
  px-3 py-1 
  bg-success-100 dark:bg-success-900 
  text-success-800 dark:text-success-200 
  text-sm font-medium 
  rounded-full
">
  Success
</span>

// Warning Badge
<span className="
  inline-flex items-center 
  px-3 py-1 
  bg-warning-100 dark:bg-warning-900 
  text-warning-800 dark:text-warning-200 
  text-sm font-medium 
  rounded-full
">
  Warning
</span>

// Error Badge
<span className="
  inline-flex items-center 
  px-3 py-1 
  bg-error-100 dark:bg-error-900 
  text-error-800 dark:text-error-200 
  text-sm font-medium 
  rounded-full
">
  Error
</span>
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
--screen-sm:  640px;   /* Small devices (landscape phones) */
--screen-md:  768px;   /* Medium devices (tablets) */
--screen-lg:  1024px;  /* Large devices (desktops) */
--screen-xl:  1280px;  /* Extra large devices (large desktops) */
--screen-2xl: 1536px;  /* 2X large devices (larger desktops) */
```

### Usage

```tsx
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl 
  p-4 md:p-6 lg:p-8 
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
  Responsive Content
</div>
```

---

## ♿ Accessibility

### Focus States

```tsx
// Always include visible focus indicators
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary-500 
  focus:ring-offset-2
">
  Accessible Button
</button>
```

### Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio

### ARIA Labels

```tsx
<button aria-label="Close modal">
  <XIcon />
</button>

<input 
  type="text" 
  aria-label="Search" 
  aria-describedby="search-help"
/>
<span id="search-help" className="sr-only">
  Enter keywords to search
</span>
```

---

## 🌙 Dark Mode

### Implementation

```tsx
// ThemeContext usage
import { useTheme } from '@/contexts/ThemeContext';

function Component() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-900">
      <button onClick={toggleTheme}>
        Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### Dark Mode Colors

All components should support dark mode using Tailwind's `dark:` prefix:

```tsx
<div className="
  bg-white dark:bg-gray-900 
  text-gray-900 dark:text-gray-100 
  border-gray-200 dark:border-gray-700
">
  Dark mode compatible content
</div>
```

---

## 📦 Component Patterns

### Page Layout

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  {/* Header */}
  <header className="bg-white dark:bg-gray-800 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header content */}
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </main>

  {/* Footer */}
  <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Footer content */}
    </div>
  </footer>
</div>
```

### Section Layout

```tsx
<section className="py-16 md:py-24 px-4 md:px-6">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
        Section Title
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Section description
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Content cards */}
    </div>
  </div>
</section>
```

---

## 🚀 Implementation Checklist

### Phase 1: Foundation
- [x] Update `globals.css` with new color system
- [x] Update `tailwind.config.ts` with extended theme
- [x] Create reusable component classes
- [x] Implement dark mode system

### Phase 2: Components
- [ ] Update Button components
- [ ] Update Card components
- [ ] Update Input components
- [ ] Update Badge components
- [ ] Update Modal components
- [ ] Update Navigation components

### Phase 3: Pages
- [ ] Update Home page
- [ ] Update Dashboard
- [ ] Update Auth pages (Login, Register)
- [ ] Update Profile pages
- [ ] Update Assessment pages
- [ ] Update Information pages

### Phase 4: Testing
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Dark mode testing
- [ ] Responsive testing
- [ ] Cross-browser testing

---

## 📚 Resources

### Design Tools
- **Figma:** [Design System File]
- **Storybook:** [Component Library]
- **Tailwind CSS:** https://tailwindcss.com

### Accessibility
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Typography
- **Inter Font:** https://fonts.google.com/specimen/Inter
- **Poppins Font:** https://fonts.google.com/specimen/Poppins

---

**Maintained by:** BilanCompetence.AI Design Team  
**Last Updated:** 25 Octobre 2025  
**Version:** 2.0.0

