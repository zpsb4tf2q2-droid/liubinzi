# Testing Guide

This document provides comprehensive testing instructions for the authentication system.

## Manual Testing Plan

### Prerequisites

1. Ensure the development server is running: `npm run dev`
2. Ensure PostgreSQL is running and migrations are applied
3. Have browser DevTools open to monitor network requests and console logs
4. Clear browser cookies/local storage before starting

---

## Test Suite 1: User Registration

### Test 1.1: Successful Registration
**Objective**: Verify new users can register with valid credentials

**Steps**:
1. Navigate to `http://localhost:3000`
2. Click "Register" button
3. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Create account"

**Expected Results**:
- ✅ Form submits without errors
- ✅ User is automatically logged in
- ✅ Redirected to `/dashboard`
- ✅ Dashboard shows welcome message with user's name/email
- ✅ Server logs show "User registered successfully" and "Login successful"

---

### Test 1.2: Registration with Invalid Email
**Objective**: Verify email validation

**Steps**:
1. Navigate to `/register`
2. Fill in the form:
   - Email: `invalid-email`
   - Password: `password123`
3. Click "Create account"

**Expected Results**:
- ✅ Error message: "Invalid email address" or validation error
- ✅ User is NOT created
- ✅ Remains on registration page

---

### Test 1.3: Registration with Short Password
**Objective**: Verify password length validation

**Steps**:
1. Navigate to `/register`
2. Fill in the form:
   - Email: `test2@example.com`
   - Password: `123` (less than 6 characters)
3. Click "Create account"

**Expected Results**:
- ✅ Error message: "Password must be at least 6 characters"
- ✅ User is NOT created
- ✅ Remains on registration page

---

### Test 1.4: Registration with Duplicate Email
**Objective**: Verify duplicate email prevention

**Steps**:
1. Register a user with email `duplicate@example.com`
2. Navigate to `/register` again
3. Try to register with the same email `duplicate@example.com`

**Expected Results**:
- ✅ Error message: "Email already in use"
- ✅ Returns 400 status code
- ✅ Server logs show "Registration failed: email already in use"

---

### Test 1.5: Registration with Missing Required Fields
**Objective**: Verify required field validation

**Steps**:
1. Navigate to `/register`
2. Leave email or password field empty
3. Try to submit form

**Expected Results**:
- ✅ Browser validation prevents form submission (HTML5 required attribute)
- ✅ Or server returns validation error if JS validation bypassed

---

## Test Suite 2: User Login

### Test 2.1: Successful Login
**Objective**: Verify users can log in with valid credentials

**Steps**:
1. Ensure a user exists (use `test@example.com` / `password123` from Test 1.1)
2. Navigate to `/login`
3. Fill in the form:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign in"

**Expected Results**:
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Dashboard shows user information
- ✅ Server logs show "Login attempt" and "Login successful"

---

### Test 2.2: Login with Invalid Password
**Objective**: Verify password validation without leaking information

**Steps**:
1. Navigate to `/login`
2. Fill in the form:
   - Email: `test@example.com` (existing user)
   - Password: `wrongpassword`
3. Click "Sign in"

**Expected Results**:
- ✅ Error message: "Invalid email or password" (generic message)
- ✅ User is NOT logged in
- ✅ Remains on login page
- ✅ Server logs show "Login failed: invalid password" (in logs only, not exposed to user)

---

### Test 2.3: Login with Non-Existent Email
**Objective**: Verify user enumeration prevention

**Steps**:
1. Navigate to `/login`
2. Fill in the form:
   - Email: `nonexistent@example.com`
   - Password: `anypassword`
3. Click "Sign in"

**Expected Results**:
- ✅ Same error message as Test 2.2: "Invalid email or password"
- ✅ Does NOT reveal that user doesn't exist
- ✅ User is NOT logged in
- ✅ Server logs show "Login failed: user not found or no password set"

---

### Test 2.4: Login with Empty Fields
**Objective**: Verify required field validation

**Steps**:
1. Navigate to `/login`
2. Leave fields empty or provide only one field
3. Try to submit

**Expected Results**:
- ✅ Browser validation prevents submission
- ✅ Or server returns appropriate error

---

### Test 2.5: Login with OAuth (GitHub)
**Objective**: Verify GitHub OAuth integration (if configured)

**Prerequisites**: `GITHUB_ID` and `GITHUB_SECRET` must be set

**Steps**:
1. Navigate to `/login`
2. Click "Continue with GitHub"
3. Authorize the application on GitHub
4. Complete OAuth flow

**Expected Results**:
- ✅ User is redirected to GitHub
- ✅ After authorization, redirected back to app
- ✅ User is logged in
- ✅ Redirected to `/dashboard`
- ✅ User account created in database (if first time)

---

## Test Suite 3: Session Management

### Test 3.1: Session Persistence
**Objective**: Verify session persists across page reloads

**Steps**:
1. Log in as a user
2. Navigate to `/dashboard`
3. Refresh the page (F5 or Cmd+R)
4. Navigate away and come back to `/dashboard`

**Expected Results**:
- ✅ User remains logged in after refresh
- ✅ No redirect to login page
- ✅ Dashboard continues to show user information

---

### Test 3.2: Protected Route Access (Authenticated)
**Objective**: Verify authenticated users can access protected routes

**Steps**:
1. Log in as a user
2. Navigate to `/dashboard`

**Expected Results**:
- ✅ Dashboard page loads successfully
- ✅ User information is displayed
- ✅ No redirect occurs

---

### Test 3.3: Protected Route Access (Unauthenticated)
**Objective**: Verify unauthenticated users cannot access protected routes

**Steps**:
1. Ensure you are logged out (clear cookies if needed)
2. Navigate directly to `/dashboard`

**Expected Results**:
- ✅ Immediately redirected to `/login`
- ✅ Callback URL preserved: `/login?callbackUrl=/dashboard`
- ✅ Cannot access dashboard without authentication

---

### Test 3.4: Auth Page Redirect (When Logged In)
**Objective**: Verify logged-in users are redirected away from auth pages

**Steps**:
1. Log in as a user
2. Try to navigate to `/login` or `/register`

**Expected Results**:
- ✅ Automatically redirected to `/dashboard`
- ✅ Cannot access login/register pages while authenticated

---

### Test 3.5: Callback URL After Login
**Objective**: Verify users are redirected to intended page after login

**Steps**:
1. Ensure you are logged out
2. Navigate directly to `/dashboard`
3. Get redirected to `/login?callbackUrl=/dashboard`
4. Log in with valid credentials

**Expected Results**:
- ✅ After successful login, redirected to `/dashboard` (the original destination)
- ✅ Not redirected to homepage or other default route

---

## Test Suite 4: Logout Functionality

### Test 4.1: Successful Logout
**Objective**: Verify users can log out and session is cleared

**Steps**:
1. Log in as a user
2. Navigate to `/dashboard`
3. Click "Sign out" button
4. Observe redirect and try accessing `/dashboard`

**Expected Results**:
- ✅ Redirected to `/login` page
- ✅ Session cookie is cleared
- ✅ Attempting to access `/dashboard` redirects to `/login`
- ✅ Cannot access protected routes

---

### Test 4.2: Logout and Re-login
**Objective**: Verify users can log back in after logging out

**Steps**:
1. Log in as a user
2. Log out
3. Log in again with the same credentials

**Expected Results**:
- ✅ Can successfully log in again
- ✅ Session is re-established
- ✅ Access to protected routes restored

---

## Test Suite 5: Edge Cases and Security

### Test 5.1: SQL Injection Prevention
**Objective**: Verify Prisma prevents SQL injection

**Steps**:
1. Navigate to `/login`
2. Try to log in with:
   - Email: `admin@test.com' OR '1'='1`
   - Password: `' OR '1'='1`
3. Try registering with malicious input

**Expected Results**:
- ✅ Input is safely escaped by Prisma
- ✅ No SQL injection vulnerability
- ✅ Login fails with normal error message
- ✅ No database corruption

---

### Test 5.2: XSS Prevention
**Objective**: Verify XSS attacks are prevented

**Steps**:
1. Register a user with name: `<script>alert('XSS')</script>`
2. Log in and view dashboard

**Expected Results**:
- ✅ Script is not executed
- ✅ Name is safely escaped in HTML
- ✅ No alert popup appears

---

### Test 5.3: CSRF Protection
**Objective**: Verify CSRF tokens are used

**Steps**:
1. Open browser DevTools → Network tab
2. Attempt to log in
3. Inspect the request headers

**Expected Results**:
- ✅ NextAuth automatically handles CSRF tokens
- ✅ Requests include appropriate security headers
- ✅ Cannot forge requests from external sites

---

### Test 5.4: Password Hashing
**Objective**: Verify passwords are hashed in database

**Steps**:
1. Register a new user with password `testpassword123`
2. Open Prisma Studio: `npx prisma studio`
3. View the User table
4. Inspect the `hashedPassword` field

**Expected Results**:
- ✅ Password is NOT stored in plain text
- ✅ `hashedPassword` starts with `$2b$` (bcrypt hash)
- ✅ Hash is approximately 60 characters long

---

### Test 5.5: Rate Limiting (Manual Check)
**Objective**: Observe behavior under rapid requests

**Steps**:
1. Attempt to log in with wrong password 10+ times rapidly
2. Observe response times and behavior

**Expected Results**:
- ⚠️ **NOTE**: Rate limiting is NOT implemented in current version
- ⚠️ Consider implementing rate limiting for production
- ✅ Application should remain stable
- ✅ No crashes or errors

---

## Test Suite 6: Environment and Configuration

### Test 6.1: Missing NEXTAUTH_SECRET
**Objective**: Verify env validation catches missing secrets

**Steps**:
1. Remove or comment out `NEXTAUTH_SECRET` in `.env`
2. Restart the dev server
3. Try to access the application

**Expected Results**:
- ✅ Application fails to start or shows error
- ✅ Error message indicates missing `NEXTAUTH_SECRET`
- ✅ Env validation prevents runtime issues

---

### Test 6.2: Invalid DATABASE_URL
**Objective**: Verify database connection errors are handled

**Steps**:
1. Set invalid `DATABASE_URL` in `.env`
2. Restart server
3. Try to register or log in

**Expected Results**:
- ✅ Clear error message about database connection
- ✅ Application handles error gracefully
- ✅ Error logged appropriately

---

### Test 6.3: Missing Required Environment Variables
**Objective**: Verify all required variables are validated

**Steps**:
1. Remove `NEXTAUTH_URL` from `.env`
2. Restart server

**Expected Results**:
- ✅ Env validation error on startup
- ✅ Lists missing/invalid variables
- ✅ Application doesn't start with invalid config

---

## Smoke Test Checklist

Quick end-to-end test to verify core functionality:

- [ ] Register new user → Success
- [ ] Login with correct credentials → Success  
- [ ] Login with wrong password → Error shown
- [ ] Access `/dashboard` while logged in → Success
- [ ] Access `/dashboard` while logged out → Redirect to login
- [ ] Logout → Redirect to login, session cleared
- [ ] Session persists after page reload → Success

**If all items pass, core authentication is working correctly.**

---

## Automated Testing Recommendations

For future improvements, consider implementing:

### Unit Tests
- Validation schema tests (Zod)
- Password hashing/comparison
- Logger utility functions

### Integration Tests
- API route handlers
- Database operations with test database
- NextAuth configuration

### E2E Tests (with Playwright or Cypress)
- Complete registration flow
- Complete login flow
- Protected route access
- Logout flow
- Error handling scenarios

### Example Test Structure
```typescript
// Example with Jest + Testing Library
describe('Registration API', () => {
  it('should register user with valid data', async () => {
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })
  
  it('should reject duplicate email', async () => {
    // First registration
    await registerUser('dup@example.com', 'password123')
    
    // Duplicate registration
    const response = await registerUser('dup@example.com', 'password123')
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: 'Email already in use'
    })
  })
})
```

---

## Performance Testing

### Load Testing Considerations
- Test registration endpoint with concurrent requests
- Test login endpoint with multiple simultaneous logins
- Verify database connection pooling handles load
- Monitor memory usage during extended sessions

### Tools
- Apache Bench: `ab -n 1000 -c 10 http://localhost:3000/api/register`
- k6, Artillery, or JMeter for more complex scenarios

---

## Logging Verification

During testing, verify logs are generated for:

1. **Registration Events**
   ```
   [INFO] User registration attempt { email: '...' }
   [INFO] User registered successfully { userId: '...', email: '...' }
   [WARN] Registration failed: email already in use { email: '...' }
   ```

2. **Login Events**
   ```
   [INFO] Login attempt { email: '...' }
   [INFO] Login successful { userId: '...', email: '...' }
   [WARN] Login failed: invalid password { email: '...' }
   ```

3. **Validation Errors**
   ```
   [WARN] Registration validation failed { errors: [...] }
   ```

Check console output during manual testing to confirm logging is working.

---

## Test Data Cleanup

After testing, clean up test data:

```bash
# Reset database
npx prisma migrate reset

# Or manually delete test users in Prisma Studio
npx prisma studio
```

---

## Troubleshooting Tests

### Test Fails: "User already exists"
- Clear test data from database
- Use unique email for each test run
- Reset database between test runs

### Test Fails: "Cannot connect to database"
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npx prisma migrate dev`

### Test Fails: "Session not persisting"
- Clear browser cookies
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches app URL

---

## Test Coverage Goals

For production readiness, aim for:
- ✅ 100% of acceptance criteria tested
- ✅ All happy path scenarios working
- ✅ All error cases handled gracefully
- ✅ Security vulnerabilities addressed
- ✅ Edge cases considered

---

## Sign-off Checklist

Before marking the auth scaffold as complete:

- [ ] All Test Suite 1 tests pass (Registration)
- [ ] All Test Suite 2 tests pass (Login)
- [ ] All Test Suite 3 tests pass (Session Management)
- [ ] All Test Suite 4 tests pass (Logout)
- [ ] All Test Suite 5 security tests pass
- [ ] Environment validation working
- [ ] Logging verified in console
- [ ] Documentation reviewed and accurate
- [ ] No console errors during normal operation
- [ ] Smoke test checklist complete

**Test Status**: ⬜ Not Started | 🔄 In Progress | ✅ Complete

---

## Notes

- This is a manual testing guide. For CI/CD, implement automated tests.
- Always test in a development/staging environment before production.
- Keep this document updated as new features are added.
