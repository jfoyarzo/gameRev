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

```typescript
next: { revalidate: CACHE_REVALIDATE_SECONDS }, // 3600 seconds (1 hour)
```

**Purpose:** Cache all IGDB API responses for 1 hour
- **Why:** IGDB has strict rate limits
- **Benefit:** Repeated requests for the same game use cached data
- **Trade-off:** Game metadata (screenshots, descriptions) rarely change hourly anyway

### RAWG Client (`lib/api/rawg-client.ts`)

```typescript
next: { revalidate: CACHE_REVALIDATE_SECONDS }, // 3600 seconds (1 hour)
```

**Purpose:** Cache all RAWG API responses for 1 hour
- **Why:** RAWG is a free tier API with rate limits
- **Benefit:** Same as IGDB - saves quota and improves performance
- **Trade-off:** Acceptable staleness for ratings data

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
