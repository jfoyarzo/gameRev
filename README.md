# Gaming Reviews App

> [!NOTE]
> **Work in Progress**: This project is currently under active development. Features and UI are subject to change.

A modern, privacy-focused platform reimagining how players discover and evaluate video games. By aggregating ratings from multiple trusted sources and offering granular control over visibility, we empower users to form their own unbiased opinions.

## 🚀 Mission

The Gaming Reviews App is built on a simple philosophy: **Total Control**. In an era of review bombing and fragmented scores, we provide a unified hub where you decide what matters. Whether you want to see professional critique, community consensus, or just raw data, the choice is yours.

## ✨ Key Features

- **Multi-Source Aggregation**: Seamlessly pull game data and ratings from leading databases like IGDB, providing a comprehensive view of the gaming landscape.
- **Customizable Viewing Experience**: You control the narrative. Filter, toggle, and prioritize rating sources to create a discovery feed that matches your personal preferences.
- **Community Driven**: Create an account to contribute your own ratings and reviews, joining a community of passionate gamers sharing authentic experiences.

## 🛠️ Tech Stack

This project leverages a cutting-edge stack to ensure performance, scalability, and developer experience:

- **Framework**: [Next.js](https://nextjs.org) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & [Radix UI](https://www.radix-ui.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E)
- **Data**: [IGDB API](https://www.igdb.com/api)

## 🏗️ CI/CD Pipeline

We maintain high code quality standards through automated GitHub Actions workflows.

### Quality Gates
Every push and main branch pull request undergoes rigorous checks:
- **Linting**: ESLint for code consistency.
- **Type Checking**: TypeScript strict mode.
- **Unit Tests**: Vitest for component and logic verification.

### End-to-End Testing
- **Playwright**: Comprehensive browser testing (Chromium) ensures critical user flows work as expected.
- **Artifacts**: Failed runs automatically upload HTML reports for rapid debugging.

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gaming-reviews-app.git
   cd gaming-reviews-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file and add your API keys (e.g., IGDB Client ID & Secret).

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🤝 Contributing

Contributions are welcome! Please ensure you:
1. Fork the repository.
2. Create a feature branch.
3. Open a Pull Request.
