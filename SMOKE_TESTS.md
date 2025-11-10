# Smoke Test Plan

This document outlines the smoke tests to perform before and after deployment to ensure the application is functioning correctly.

## Pre-Deployment Checklist

Run these tests locally before deploying:

### 1. Build Verification
```bash
# Ensure the application builds successfully
npm run build

# Start production build locally
npm run start
```
**Expected**: Build completes without errors, server starts on port 3000

### 2. Type Checking
```bash
# Run TypeScript type checker
npx tsc --noEmit
```
**Expected**: No type errors

### 3. Linting
```bash
# Run ESLint
npm run lint
```
**Expected**: No linting errors (warnings are acceptable)

## Post-Deployment Smoke Tests

Perform these tests on the deployed application:

### Test Suite 1: Core Navigation

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Home page loads | 1. Navigate to `/` | Page loads with welcome message and 3 feature cards | ☐ |
| Login page loads | 1. Click "Sign in" in header<br>2. Or navigate to `/login` | Login page loads with email and password fields | ☐ |
| Register page loads | 1. Click link to register<br>2. Or navigate to `/register` | Register page loads with name, email, and password fields | ☐ |
| Dashboard loads | 1. Navigate to `/dashboard` | Dashboard page loads with placeholder content | ☐ |
| Navigation links work | 1. Click through all navigation links | All links navigate correctly | ☐ |

### Test Suite 2: Responsive Design

| Test | Device/Breakpoint | Expected Result | Status |
|------|-------------------|-----------------|--------|
| Mobile view (320px-639px) | Resize browser or use DevTools | Content stacks vertically, navigation is accessible | ☐ |
| Tablet view (640px-1023px) | Resize browser or use DevTools | 2-column grid on home page, responsive navigation | ☐ |
| Desktop view (1024px+) | Resize browser or use DevTools | 3-column grid on home page, full navigation visible | ☐ |
| Header responsive | All breakpoints | Header adapts appropriately at each breakpoint | ☐ |
| Forms responsive | All breakpoints | Forms remain usable and properly sized | ☐ |

### Test Suite 3: Dark Mode

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Dark mode toggle | 1. Click theme toggle button | Theme switches to dark mode | ☐ |
| Dark mode persistence | 1. Enable dark mode<br>2. Refresh page | Dark mode remains active | ☐ |
| System preference | 1. Set OS to dark mode<br>2. Toggle to system theme | App follows system preference | ☐ |
| All pages support dark mode | 1. Enable dark mode<br>2. Visit all pages | All pages render correctly in dark mode | ☐ |

### Test Suite 4: Accessibility

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Keyboard navigation | 1. Use Tab key to navigate<br>2. Use Enter to activate links | All interactive elements are accessible | ☐ |
| Focus indicators | 1. Tab through interactive elements | Clear focus indicators on all elements | ☐ |
| Skip to main content | 1. Tab once on page load<br>2. Press Enter | Focus jumps to main content | ☐ |
| Screen reader labels | 1. Use screen reader (NVDA/JAWS/VoiceOver) | All elements have proper labels | ☐ |
| Form validation | 1. Submit empty forms<br>2. Check error messages | Validation errors are announced properly | ☐ |

### Test Suite 5: Forms and Interactions

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Login form submission | 1. Fill in email and password<br>2. Click "Sign in" | Loading state shows, then placeholder error message | ☐ |
| Register form submission | 1. Fill in all fields<br>2. Click "Create account" | Loading state shows, then placeholder error message | ☐ |
| Form validation | 1. Try to submit with empty required fields | Browser validation prevents submission | ☐ |
| Password validation | 1. Enter password less than 6 chars in register form<br>2. Submit | Error message appears | ☐ |
| Loading states | 1. Submit any form | Button shows loading text and is disabled | ☐ |
| Links between pages | 1. Click "Register" from login page<br>2. Click "Sign in" from register page | Navigation between forms works | ☐ |

### Test Suite 6: Visual Polish

| Test | Expected Result | Status |
|------|-----------------|--------|
| Consistent spacing | All pages use consistent padding and margins | ☐ |
| Typography hierarchy | Headings, body text, and labels are clearly differentiated | ☐ |
| Color contrast | Text is readable against backgrounds in both light and dark modes | ☐ |
| Icons render | All icons display correctly | ☐ |
| Cards have hover states | Cards on home page show hover effect | ☐ |
| Button states | Buttons show hover, active, focus, and disabled states | ☐ |
| No layout shift | Pages don't shift content during load | ☐ |
| Images load | All images and icons load properly | ☐ |

### Test Suite 7: Performance

| Test | Tool | Target | Status |
|------|------|--------|--------|
| Lighthouse Performance | Chrome DevTools | Score ≥ 90 | ☐ |
| Lighthouse Accessibility | Chrome DevTools | Score ≥ 90 | ☐ |
| Lighthouse Best Practices | Chrome DevTools | Score ≥ 90 | ☐ |
| Lighthouse SEO | Chrome DevTools | Score ≥ 90 | ☐ |
| First Contentful Paint | Chrome DevTools | < 2s | ☐ |
| Time to Interactive | Chrome DevTools | < 3.5s | ☐ |
| Cumulative Layout Shift | Chrome DevTools | < 0.1 | ☐ |

### Test Suite 8: Environment Configuration

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Environment variables load | 1. Check browser console<br>2. Verify no errors about missing variables | No environment variable errors | ☐ |
| Supabase connection | 1. Open DevTools Network tab<br>2. Look for Supabase API calls | Supabase endpoints are accessible | ☐ |
| No secrets exposed | 1. View page source<br>2. Check for exposed keys | Service role key is NOT visible | ☐ |

### Test Suite 9: Error Handling

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 404 page | 1. Navigate to `/nonexistent-page` | Proper 404 error handling | ☐ |
| Network errors | 1. Disable network<br>2. Try to interact with app | Graceful error handling | ☐ |
| Invalid form input | 1. Submit forms with invalid data | Clear error messages displayed | ☐ |

### Test Suite 10: Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ☐ |
| Firefox | Latest | ☐ |
| Safari | Latest | ☐ |
| Edge | Latest | ☐ |
| Mobile Safari (iOS) | Latest | ☐ |
| Chrome (Android) | Latest | ☐ |

## Critical Issues

If any of the following issues occur, **do not proceed with production deployment**:

- [ ] Application fails to build
- [ ] Critical pages (home, login, register) don't load
- [ ] Type errors in production build
- [ ] Lighthouse Accessibility score < 80
- [ ] Service role key exposed in client
- [ ] Complete navigation failure
- [ ] All API calls failing

## Running Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Navigate to the "Lighthouse" tab
3. Select:
   - Mode: Navigation
   - Device: Both Mobile and Desktop
   - Categories: Performance, Accessibility, Best Practices, SEO
4. Click "Analyze page load"
5. Review results and address any critical issues

## Automated Testing (Future)

For production-grade applications, consider adding:

- **End-to-End Tests**: Playwright or Cypress
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: API endpoint testing
- **Visual Regression Tests**: Percy or Chromatic
- **Load Testing**: k6 or Apache JMeter
- **Security Scanning**: OWASP ZAP or Snyk

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product Owner | | | |

## Notes

Record any issues found during testing:

---

**Testing Environment:**
- Date:
- Tested by:
- URL:
- Browser/Device:

**Issues Found:**
1. 
2. 
3. 

**Resolution:**
1. 
2. 
3.
