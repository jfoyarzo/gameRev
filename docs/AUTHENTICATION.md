# Authentication System

This document outlines the authentication implementation in GameRev, covering user registration, login, session management, and security features.

## Overview

GameRev uses **NextAuth.js v5** (Auth.js) with a credentials-based authentication system backed by PostgreSQL and Drizzle ORM.

## Architecture

### Tech Stack
- **Auth Framework**: [NextAuth.js v5](https://authjs.dev/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Password Hashing**: bcrypt (10 salt rounds)
- **Bot Protection**: Google reCAPTCHA v3
- **Session**: Database sessions with cookie-based tokens

### Files Structure
```
/app/actions/auth.ts          # Server actions (sign-up, sign-in)
/app/signup/page.tsx           # Registration page
/app/signin/page.tsx           # Login page
/components/auth/              # Auth UI components
/lib/auth/
  ├── recaptcha.ts            # reCAPTCHA verification
  └── validation.ts           # Shared Zod schemas
/lib/db/
  ├── schema.ts               # Database schema
  └── queries.ts              # User queries
/auth.ts                       # NextAuth configuration
/auth.config.ts                # Auth options
/proxy.ts                      # Middleware proxy (Next.js 16+)
```

---

## Features

### 1. User Registration

**Endpoint**: Server Action `handleSignUp` in `/app/actions/auth.ts`

**Validation**:
- Email format validation (Zod schema)
- Password requirements: min 8 characters
- reCAPTCHA v3 token verification (score ≥ 0.5)

**Process**:
1. Client submits form with email, password, reCAPTCHA token
2. Server validates inputs using shared Zod schema
3. reCAPTCHA token verified server-side
4. Password hashed with bcrypt (10 rounds)
5. User record created in PostgreSQL
6. Auto sign-in after successful registration

**Security**:
- Passwords never stored in plain text
- reCAPTCHA prevents automated bot signups
- Duplicate email detection

### 2. User Sign-In

**Endpoint**: Server Action `handleSignIn` in `/app/actions/auth.ts`

**Process**:
1. Client submits email and password
2. Server validates inputs using shared Zod schema
3. User credentials verified via NextAuth `signIn()`
4. Session created on success

**Error Handling**:
- Generic "Invalid credentials" message (prevents user enumeration)
- Rate limiting via NextAuth configuration

### 3. Session Management

**Strategy**: Database sessions

**Configuration** (`auth.ts`):
```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,    // Update every 24 hours
}
```

**Session Lifecycle**:
- Sessions expire after 30 days of inactivity
- Session updated in DB every 24 hours
- Sign-out deletes session from database

### 4. Bot Protection (reCAPTCHA v3)

**Implementation**: Invisible reCAPTCHA v3 on signup form

**Client-Side** (`components/auth/signup-form.tsx`):
```typescript
const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'signup' });
```

**Server-Side Verification** (`lib/auth/recaptcha.ts`):
- Verifies token with Google API (Production only)
- **Development**: Verification is bypassed (always returns success) to simplify setup
- Requires score ≥ 0.5 (configurable threshold)

**Environment Configuration**:
```env
# Optional for Development (defaults to dummy keys)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

> [!NOTE]
> For local development, you can skip this setup as the validation is bypassed.

---

## Database Schema

**Users Table** (`lib/db/schema.ts`):
```typescript
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password").notNull(),
});
```

**Sessions, Accounts, Verification Tokens**: Standard NextAuth tables managed by Drizzle adapter.

---

## Validation

**Shared Schemas** (`lib/auth/validation.ts`):

```typescript
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  recaptchaToken: z.string().min(1, "reCAPTCHA verification required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

**Usage**: Consistent validation across server actions and NextAuth callbacks.

---

## Security Best Practices

### Implemented
- ✅ Password hashing with bcrypt
- ✅ reCAPTCHA bot protection
- ✅ Database sessions (not JWT for sensitive data)
- ✅ HTTPS-only cookies in production
- ✅ Generic error messages (prevent user enumeration)
- ✅ Server-only credential handling (`import 'server-only'`)

### Recommendations for Production
- [ ] Implement rate limiting (e.g., 5 failed attempts → temporary lockout)
- [ ] Add email verification flow
- [ ] Enable 2FA (TOTP)
- [ ] Monitor failed login attempts
- [ ] Implement CSRF protection (built-in with NextAuth)
- [ ] Add password reset functionality

---

## Testing

**Unit Tests** (`test/auth.test.ts`):
- Validation schema tests
- Password hashing verification
- reCAPTCHA token verification

**E2E Tests** (`test/e2e/auth.spec.ts`):
- Complete signup flow
- Complete signin flow
- Session persistence
- Sign-out functionality

**Test Environment**:
```typescript
// vitest.setup.ts configures test environment variables
// Playwright uses test fixtures for authentication state
```

---

## Troubleshooting

### Common Issues

**"Invalid credentials" on correct password**
- Check password hashing is working: `bcrypt.compare(inputPassword, hashedPassword)`
- Verify user exists in database
- Check NextAuth configuration matches credential provider

**Middleware errors (Next.js 16)**
- NextAuth 5 + Next.js 16 compatibility: Use `proxy.ts` pattern
- See `proxy.ts` for implementation

---

## References

- [NextAuth.js Documentation](https://authjs.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [reCAPTCHA v3 Guide](https://developers.google.com/recaptcha/docs/v3)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
