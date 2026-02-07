# Contributing to GameRev

Thank you for your interest in contributing to GameRev! This guide will help you get started with development.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Latest LTS version (20.x+)
- **Package Manager**: npm, pnpm, or bun
- **PostgreSQL**: 14+ (or use Docker Compose)
- **Git**: For version control

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gaming-reviews-app.git
   cd gaming-reviews-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Database**
   ```bash
   # Option 1: Use Docker
   docker-compose up -d
   
   # Option 2: Use local PostgreSQL
   # Create a database named 'gamerev'
   ```

4. **Configure Environment**
   Create `.env.local` with required variables, you can copy the `.env.example` file and fill the values:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/gamerev
   
   # Auth
   AUTH_SECRET=your_secret_key_here
   
   # APIs
   IGDB_CLIENT_ID=your_igdb_client_id
   IGDB_CLIENT_SECRET=your_igdb_client_secret
   RAWG_API_KEY=your_rawg_api_key
   OPENCRITIC_API_KEY=your_opencritic_api_key
   
   # reCAPTCHA v3 (Optional for Development)
   # If not provided, verification will be bypassed in non-production environments
   # NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
   # RECAPTCHA_SECRET_KEY=your_secret_key
   ```

5. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🏗️ Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `feat/*` - New features (User-facing)
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks (Internal, e.g. refactoring, docs, dependencies, tests, etc.)

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow code style guidelines (below)
   - Write tests for new functionality
   - Update documentation as needed

3. **Run Quality Checks**
   ```bash
   # Linting
   npm run lint
   
   # Type checking
   npm run type-check
   
   # Unit tests
   npm run test
   
   # E2E tests
   npm run test:e2e
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Feat: Add new feature description"
   ```
   
   **Commit Message Format**:
   - `Feat:` - New feature
   - `Fix:` - Bug fix
   - `Chore:` - Internal tasks (e.g. refactoring, docs, dependencies, tests, etc.)

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a Pull Request on GitHub with:
   - Clear title describing the change
   - Description of what was changed and why
   - Screenshots for UI changes
   - Reference any related issues

---

## 📝 Code Style Guidelines

### Global Best Practices

**1. Keep Code DRY (Don't Repeat Yourself)**
- Abstract common functionality into reusable modules
- When logic repeats, refactor into shared utilities

**2. Eliminate Magic Numbers**
- No hardcoded values in logic blocks
- Use constants with descriptive names
- Place constants in `lib/constants.ts` or module top

**3. Strict Separation of Concerns**
- Keep business logic out of components
- Use services for data fetching
- Maintain clear boundaries: UI → Service → Data Access

### TypeScript
- Use strict mode (already configured)
- Avoid `any` type - use proper typing
- Prefer interfaces for object shapes
- Use type inference where possible

### React/Next.js
- **Default to Server Components** - Only use `"use client"` when necessary
- **File naming**: kebab-case for files, PascalCase for components
- **Component structure**:
  ```typescript
  // 1. Imports
  // 2. Types/Interfaces
  // 3. Component definition
  // 4. Helper functions (or extract to utils)
  ```

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Leverage Radix UI primitives for accessibility
- Keep inline styles to minimum

---

## 🧪 Testing Guidelines

### Unit Tests (Vitest)

**Location**: `/test/*.test.ts`

**What to test**:
- Validation schemas
- Utility functions
- Service layer logic
- Data transformations

**Example**:
```typescript
import { describe, it, expect } from 'vitest';

describe('formatGameTitle', () => {
  it('should normalize game title', () => {
    expect(formatGameTitle('The Last of Us: Part II')).toBe('last of us part ii');
  });
});
```

### E2E Tests (Playwright)

**Location**: `/test/e2e/*.spec.ts`

**What to test**:
- Critical user flows (search, view details, auth)
- Form submissions
- Navigation

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('should search for a game', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="search"]', 'Hades');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Hades')).toBeVisible();
});
```

### Running Tests
```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test:run

# E2E tests (headless)
npm run test:e2e

# E2E tests (UI mode)
npm run test:e2e:ui
```

---

## 🔍 Code Review Process

All Pull Requests must:
1. ✅ Pass CI checks (linting, type-check, tests)
2. ✅ Include tests for new features
3. ✅ Update documentation if needed
4. ✅ Be reviewed by at least one maintainer

**Review Checklist**:
- Code follows style guidelines
- No unnecessary dependencies added
- Performance implications considered
- Security best practices followed
- Accessibility maintained

---

## 📚 Useful Resources

### Project Documentation
- [Architecture Overview](./ARCHITECTURE.md)
- [Caching Strategy](./CACHING.md)
- [Authentication System](./AUTHENTICATION.md)

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

## 🐛 Reporting Bugs

**Before submitting a bug report**:
1. Search existing issues to avoid duplicates
2. Test on the latest version
3. Gather reproduction steps

**Include in your report**:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Node version, browser)
- Screenshots/videos if applicable

---

## 💡 Feature Requests

We welcome feature suggestions! Please:
1. Check if the feature already exists or is planned
2. Explain the use case and benefits
3. Consider proposing an implementation approach

---

## 📜 License

By contributing to GameRev, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

- Open a [Discussion](https://github.com/jfoyarzo/gameRev/discussions)
- Reach out to maintainers via GitHub

Thank you for contributing! 🎮
