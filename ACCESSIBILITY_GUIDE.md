# ♿ Accessibility (a11y) Implementation Guide
## BilanCompetence.AI - WCAG 2.1 AA Compliance

**Status:** 35/100 → Target: 90/100 (WCAG 2.1 AA)
**Created:** November 5, 2025
**Priority:** Phase 3 (1 week effort)

---

## 🎯 Current Status

### Issues Found (Audit Nov 2025):
- ❌ Missing alt text on ~71 images
- ❌ Missing ARIA roles on ~36/72 components
- ❌ Missing semantic HTML in various pages
- ⚠️ Keyboard navigation not fully tested
- ⚠️ Screen reader compatibility unknown

---

## 📋 Implementation Checklist

### 1. Images (Priority: HIGH)

**Action Required:** Add alt text to ALL images

```tsx
// ❌ BAD
<img src="/logo.png" />

// ✅ GOOD
<img src="/logo.png" alt="BilanCompetence.AI logo" />

// ✅ BEST (with next/image)
<Image
  src="/logo.png"
  alt="BilanCompetence.AI logo"
  width={200}
  height={50}
  priority
/>
```

**Files to Update:**
- All `*.tsx` files in `app/` directory
- All `*.tsx` files in `components/` directory
- Estimated: 71 images need alt text

---

### 2. ARIA Roles (Priority: HIGH)

**Action Required:** Add semantic roles to interactive elements

```tsx
// ❌ BAD - Non-semantic interactive div
<div onClick={handleClick}>Button</div>

// ✅ GOOD - Proper button element
<button onClick={handleClick} aria-label="Save changes">
  Save
</button>

// ✅ GOOD - Navigation
<nav role="navigation" aria-label="Main navigation">
  <ul>...</ul>
</nav>

// ✅ GOOD - Alert
<div role="alert" aria-live="assertive">
  Error: Please fill in all fields
</div>
```

**Common ARIA Roles Needed:**
- `role="navigation"` - Navigation components
- `role="button"` - Custom button components
- `role="dialog"` - Modal dialogs
- `role="alert"` - Error messages
- `role="status"` - Status updates
- `role="progressbar"` - Loading indicators

---

### 3. Semantic HTML (Priority: MEDIUM)

**Action Required:** Use proper HTML5 semantic elements

```tsx
// ❌ BAD
<div className="header">...</div>
<div className="nav">...</div>
<div className="main-content">...</div>
<div className="footer">...</div>

// ✅ GOOD
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>

// ✅ GOOD - Article structure
<article>
  <h1>Title</h1>
  <section>
    <h2>Subtitle</h2>
    <p>Content...</p>
  </section>
</article>
```

---

### 4. Form Labels (Priority: HIGH)

**Current Status:** ✅ Good (291 instances with htmlFor)

```tsx
// ✅ GOOD - Already implemented correctly
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-help"
/>
<span id="email-help">We'll never share your email</span>
```

---

### 5. Keyboard Navigation (Priority: HIGH)

**Action Required:** Ensure all interactive elements are keyboard accessible

```tsx
// ✅ GOOD - Tab index and keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>

// ✅ BETTER - Use actual button element
<button onClick={handleClick}>Click me</button>
```

**Test Checklist:**
- [ ] All forms navigable with Tab key
- [ ] All buttons accessible via Tab + Enter
- [ ] Modal dialogs trap focus correctly
- [ ] Skip to main content link available
- [ ] Visual focus indicators on all elements

---

### 6. Color Contrast (Priority: MEDIUM)

**Action Required:** Verify color contrast ratios meet WCAG AA

**WCAG AA Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Tools to Use:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse audit
- axe DevTools browser extension

**Files to Check:**
- `tailwind.config.ts` - Color palette
- All button components
- All text on colored backgrounds

---

### 7. Screen Reader Testing (Priority: HIGH)

**Action Required:** Test with actual screen readers

**Screen Readers to Test:**
- **Windows:** NVDA (free), JAWS (paid)
- **macOS:** VoiceOver (built-in)
- **iOS:** VoiceOver (built-in)
- **Android:** TalkBack (built-in)

**Test Checklist:**
- [ ] Homepage fully readable
- [ ] Login/Register forms accessible
- [ ] Dashboard navigation clear
- [ ] Assessment wizard navigable
- [ ] Error messages announced
- [ ] Success messages announced

---

### 8. Focus Management (Priority: MEDIUM)

**Action Required:** Implement proper focus management

```tsx
// ✅ GOOD - Modal focus trap
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first element in modal
      modalRef.current?.focus();

      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Add focus trap logic here
    }
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

---

### 9. Live Regions (Priority: MEDIUM)

**Action Required:** Announce dynamic content changes

```tsx
// ✅ GOOD - Status announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ✅ GOOD - Error announcements
<div role="alert" aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>

// ✅ GOOD - Loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : null}
</div>
```

---

### 10. Skip Links (Priority: HIGH)

**Action Required:** Add "Skip to main content" link

```tsx
// Add to layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white"
>
  Skip to main content
</a>

// Add id to main content
<main id="main-content">
  {/* Page content */}
</main>
```

---

## 🚀 Implementation Plan

### Phase 1: Critical (1-2 days)
1. Add alt text to all images (71 images)
2. Add ARIA roles to interactive components (36 components)
3. Add skip to main content link
4. Verify keyboard navigation on critical paths

### Phase 2: Important (2-3 days)
5. Refactor to semantic HTML
6. Implement focus management in modals
7. Add live regions for dynamic content
8. Test with screen readers (basic)

### Phase 3: Polish (1-2 days)
9. Verify color contrast ratios
10. Comprehensive screen reader testing
11. Automated accessibility testing (axe-core)
12. Document accessibility features

**Total Estimated Time:** 5-7 days

---

## 🧪 Testing Tools

### Automated Testing

```bash
# Install axe-core for testing
npm install --save-dev @axe-core/react

# Usage in tests
import { axe, toHaveNoViolations } from 'jest-axe';

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] Tab through entire site with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Run Lighthouse accessibility audit
- [ ] Run axe DevTools in browser
- [ ] Test with high contrast mode
- [ ] Test with 200% zoom
- [ ] Test with color blindness simulator

---

## 📚 Resources

### WCAG 2.1 Guidelines
- https://www.w3.org/WAI/WCAG21/quickref/

### Testing Tools
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools

### Best Practices
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- A11y Project: https://www.a11yproject.com/

---

## 🎯 Target Score

**Current:** 35/100
**After Phase 1:** 60/100
**After Phase 2:** 80/100
**After Phase 3:** 90/100 ✅ WCAG 2.1 AA Compliant

---

**Note:** This is a living document. Update as implementation progresses.
