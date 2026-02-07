# GameRev Application Architecture

## 1. App Intent & Philosophy
**Mission**: "Total Control." GameRev is designed to be a privacy-focused, unbiased platform for discovering and evaluating video games.
**Core Value**: In an era of fragmented reviews and "review bombing," this app empowers users to aggregate data from multiple trusted sources (IGDB, RAWG, OpenCritic) and decide for themselves which metrics matter.
**Key Differentiator**: Unlike centralized platforms (Metacritic), GameRev acts as a user-configurable aggregator, offering granular control over data visibility and sources.

## 2. Main Concepts

### Unified Game Data
The application's central concept is the "Unified Game." Instead of having separate pages for the same game from different sources, the app merges data into a single, cohesive entity.
- **Normalization**: Game titles and metadata are normalized to detect matches across disparate APIs.
- **Aggregation**: Scores, descriptions, and metadata are combined. A "Primary Source" (configurable) takes precedence, with fallbacks to secondary sources to fill gaps.

### The Adapter Pattern
To support "Total Control," the system is built to be agnostic of the underlying data provider.
- **Extensibility**: New data sources can be added by implementing a standard interface without rewriting the core application logic.
- **Resilience**: If one API is down, the application degrades gracefully, relying on other enabled adapters.

## 3. Technical Architecture

### Tech Stack
- **Framework**: Next.js 16+ (App Router, Server Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Radix UI (Headless primitives for accessibility)
- **Testing**: Vitest (Unit/Component), Playwright (E2E)

### Layered Architecture
The application follows a strict Separation of Concerns (SoC) to ensure maintainability and testability.

#### 1. UI Layer (`/app`, `/components`)
- **Server Components**: Used by default for data fetching and rendering static content.
- **Client Components**: "Islands of interactivity" (search bars, detailed interactive views) using standard React hooks.
- **Design System**: Reusable primitives (Tooltip, Dialog, Card) built on Radix UI and Tailwind, ensuring accessible, consistent design.

#### 2. Service Layer (`/lib/services`)
Contains the core business logic, decoupled from the API layer.
- **GameService**: The heart of the aggregation logic.
    - **Caching**: Uses React `cache()` to deduplicate requests during the render lifecycle.
    - **Preloading**: Implements a "warm the cache" pattern to prevent waterfalls in server components.
    - **Merge Logic**: Intelligent merging of data fields (Covers, Descriptions, Release Dates) handling conflicts based on source priority.

#### 3. Data Access Layer (DAL) (`/lib/dal`, `/lib/adapters`, `/lib/api`)
Handles all external data interactions.

- **SDK Client Pattern (`/lib/api`)**:
    - **Purpose**: Encapsulates raw API logic, validation, and request construction.
    - **Implements**: Named, typed methods (e.g., `searchIGDBGames`, `getRAWGGameDetails`).
    - **Caching**: Uses Next.js `fetch` cache tags (`TAG_GAMES`) and revalidation strategies.

- **Adapter Pattern (`/lib/adapters`)**:
    - **Purpose**: Normalization and standard interface implementation.
    - **Usage**: Only interacts with SDK Clients, never raw `fetch`.
    - **Standard Interface**: All adapters must implement `GameAdapter`:
    ```typescript
    interface GameAdapter {
        name: string;
        search(query: string): Promise<SearchResult[]>;
        getGameDetails(...): Promise<GameSourceInfo | null>;
        getPopularGames(limit?: number): Promise<SearchResult[]>;
        getNewGames(limit?: number): Promise<SearchResult[]>;
    }
    ```

### Data Flow
1. **Request**: User visits `/game/fallout-4`.
2. **Page Load**: `page.tsx` calls `GameService.getGame()`.
3. **Aggregation**:
    - `GameService` queries the **Registry** for enabled adapters.
    - Parallel requests are sent via **Adapters**, which call their respective **SDK Clients**.
4. **Unification**: Responses are normalized and merged into a `UnifiedGameData` object.
5. **Render**: The unified object is passed to the UI for rendering, with source attribution preserved.

## 4. Key Directory Structure
- `/lib/adapters`: Implementation of external API clients.
- `/lib/dal`: Configuration and environment validation.
- `/lib/services`: Aggregation and business logic.
- `/components/ui`: Atomic, reusable design system components.
- `/app`: Next.js App Router file-system based routing and layouts.
