# GameRev

> [!NOTE]
> **Work in Progress**: This project is currently under active development. Features and UI are subject to change.

A modern, privacy-focused platform reimagining how players discover and evaluate video games. By aggregating ratings from multiple trusted sources and offering granular control over visibility, we empower users to form their own unbiased opinions.

## 🚀 Mission

GameRev is built on a simple philosophy: **Total Control**. In an era of review bombing and fragmented scores, we provide a unified hub where you decide what matters. Whether you want to see professional critique, community consensus, or just raw data, the choice is yours.

## ✨ Key Features

### Game Discovery & Aggregation
- **Multi-Source Data**: Seamlessly aggregates game information from IGDB, RAWG, and OpenCritic *(More sources to come)*
- **Unified Game View**: Merges data from multiple sources into a single, comprehensive game profile
- **Smart Caching**: Optimized API usage with intelligent cache strategies (respects rate limits)
- **Advanced Search**: Fast, accurate game search with normalized matching

### User Authentication & Security
- **Secure Sign-Up/Sign-In**: NextAuth.js v5 with bcrypt password hashing
- **Bot Protection**: Google reCAPTCHA v3 integration on signup forms
- **Session Management**: 30-day database sessions with automatic renewal
- **Privacy-First**: No third-party tracking, complete user data control

### Customizable Experience
- **Filter & Prioritize**: *(Coming Soon)* You control which rating sources to display and trust
- **Community Contributions**: *(Coming Soon)* Share your own ratings and reviews
- **Personalized Feed**: *(Coming Soon)* Discovery tailored to your preferences

## 🛠️ Tech Stack

This project leverages a cutting-edge stack to ensure performance, scalability, and developer experience:

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Auth.js)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & [Radix UI](https://www.radix-ui.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E)
- **APIs**: IGDB, RAWG, OpenCritic

## 🏗️ CI/CD Pipeline

We maintain high code quality standards through automated GitHub Actions workflows.

### Quality Gates
Every push and main branch pull request undergoes rigorous checks:
- **Linting**: ESLint for code consistency
- **Type Checking**: TypeScript strict mode validation
- **Unit Tests**: Vitest for component and logic verification
- **E2E Tests**: Playwright for critical user flows

### Continuous Testing
- **Automated Browser Testing**: Chromium-based tests ensure UI reliability
- **Test Artifacts**: Failed runs automatically upload HTML reports for debugging
- **Coverage Tracking**: Unit test coverage reports

## 🏁 Getting Started

### Prerequisites
- **Node.js**: Latest LTS (20.x+)
- **PostgreSQL**: 14+ (or use Docker Compose)
- **Package Manager**: npm, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jfoyarzo/gaming-reviews-app.git
   cd gaming-reviews-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   # Option 1: Use Docker
   docker-compose up -d
   
   # Option 2: Use local PostgreSQL (create database 'gamerev')
   ```

4. **Configure environment variables**
   Create `.env.local` with required API keys:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/gamerev
   AUTH_SECRET=your_secret_key
   IGDB_CLIENT_ID=your_client_id
   IGDB_CLIENT_SECRET=your_client_secret
   RAWG_API_KEY=your_api_key
   OPENCRITIC_API_KEY=your_api_key
   # Register localhost at https://www.google.com/recaptcha/admin (reCAPTCHA v3)
   RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📚 Documentation

For detailed technical information, see:

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design, data flow, and adapter pattern
- **[Caching Strategy](./docs/CACHING.md)** - Performance optimization and API quota management
- **[Authentication System](./docs/AUTHENTICATION.md)** - NextAuth setup, reCAPTCHA, and security
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Development workflow, testing, and code style

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) to get started.

**Quick Steps**:
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes and add tests
4. Ensure all checks pass (`npm run lint && npm test`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
