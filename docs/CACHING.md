# Caching Strategy

This document outlines the caching strategy used in the GameRev application to optimize performance and respect API rate limits.

## Overview

Next.js 15+ has shifted to **uncached by default** for `fetch()` requests. This application explicitly configures caching where beneficial for performance and API quota management.

---

## Page-Level Caching

### Home Page (`app/page.tsx`)

```typescript
export const revalidate = 3600; // Cache revalidation time in seconds (1 hour)
```

**Purpose:** Static regeneration with 1-hour revalidation
- Popular games and new releases don't change frequently
- Reduces server load and API calls
- Users see slightly stale but consistent data across sessions

### Search Page (`app/search/page.tsx`)

**Strategy:** No explicit page-level caching (dynamic by default)
- Search queries are user-specific
- Results should be fresh
- Relies on fetch-level caching (see below)

### Game Detail Page (`app/game/[id]/page.tsx`)

**Strategy:** Dynamic rendering (default)
- Game details can update as new ratings/reviews come in
- Uses fetch-level caching for underlying API calls

---

## Fetch-Level Caching

### IGDB Client (`lib/api/igdb-client.ts`)

Uses `createAPIClient` with enforced caching strategies:
```typescript
tags: [CACHE_TAG_GAMES], // 'games'
next: { revalidate: CACHE_REVALIDATE_SECONDS }, // 3600 seconds (1 hour)
```

**Purpose:**
- **Rate Limit Protection:** IGDB has strict rate limits; caching prevents redundant calls.
- **Tag-Based Invalidation:** Allows clearing all game data caches via `revalidateTag(CACHE_TAG_GAMES)`.

### RAWG Client (`lib/api/rawg-client.ts`)

Simulates the same behavior using `createAPIClient`:
```typescript
tags: [CACHE_TAG_GAMES],
next: { revalidate: CACHE_REVALIDATE_SECONDS },
```

**Purpose:**
- **Quota Management:** RAWG free tier limits are preserved.
- **Consistency:** Ensures data from all sources expires (or invalidates) together.

---

## Token Caching

### Twitch OAuth Token (`lib/api/igdb-client.ts`)

```typescript
export const getAccessToken = cache(async () => { ... });
```

**Purpose:** React `cache()` deduplicates token requests **within a single render**
- **Why:** Multiple components may need IGDB data in one page render
- **Benefit:** Only one token request per server-side render
- **Scope:** Request-scoped (not persisted across users)

---

## Best Practices for Production

### For High-Traffic Scenarios

Consider using **React Server Components with `use cache`** (experimental in Next.js 15):

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedGame = unstable_cache(
  async (id: string) => gameService.getGame(id),
  ['game-detail'],
  { revalidate: 7200, tags: ['game'] }
);
```

### For Real-Time Data

If you need more real-time ratings, reduce `CACHE_REVALIDATE_SECONDS` in `lib/constants.ts`:

```typescript
export const CACHE_REVALIDATE_SECONDS = 1800; // 30 minutes
```

### Cache Invalidation

Use **on-demand revalidation** if you have admin triggers for content updates:

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// In an API route or server action:
revalidatePath('/game/[id]');
// or
revalidateTag('game');
```

---

## Monitoring Cache Effectiveness

Watch for these metrics in production:

- **Cache Hit Rate:** % of requests served from cache
- **API Quota Usage:** Should decrease with effective caching
- **Page Load Times:** Should improve with proper caching
- **Stale Data Reports:** Monitor user complaints about outdated info

---

## References

- [Next.js Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)
- [React cache() API](https://react.dev/reference/react/cache)
- [Next.js Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
