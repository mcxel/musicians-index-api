# PACK29_SEED_CONTENT_AND_FIXTURES.md
## Demo Data and Fixtures — What to Seed Before Showing Anyone
### BerntoutGlobal XXL / The Musician's Index

Seed script: packages/db/prisma/seed.ts

---

## ADVERTISER DEMO DATA

```typescript
// Seed these 4 demo advertisers (test mode, Stripe test keys)
const DEMO_ADVERTISERS = [
  {
    companyName: 'BeatMaker Pro',
    contactEmail: 'demo-beatmaker@example.com',
    category: 'music_gear',
    website: 'https://example.com',
    isVerified: true,
  },
  {
    companyName: 'Studio Vault',
    contactEmail: 'demo-studiovault@example.com',
    category: 'music_gear',
    website: 'https://example.com',
    isVerified: true,
  },
  {
    companyName: 'CitySound Venues',
    contactEmail: 'demo-citysound@example.com',
    category: 'venues',
    website: 'https://example.com',
    isVerified: true,
  },
  {
    companyName: 'GrassValley Local Music',
    contactEmail: 'demo-gvlocal@example.com',
    category: 'local',
    website: 'https://example.com',
    isVerified: true,
  },
];
```

---

## DEMO AD CAMPAIGNS (Approved + Active)

```typescript
// One active campaign per advertiser, covering key slots
const DEMO_CAMPAIGNS = [
  {
    advertiserId: 'beatmaker-pro-id',
    name: 'BeatMaker Pro Launch',
    status: 'ACTIVE',
    packageTier: 'standard',
    surfaces: ['homepage', 'articles'],
    startDate: '2026-03-01',
    endDate: '2026-06-01',
    budgetCents: 49999,
  },
  {
    advertiserId: 'studio-vault-id',
    name: 'Studio Vault Summer',
    status: 'ACTIVE',
    packageTier: 'basic',
    surfaces: ['homepage'],
    startDate: '2026-03-01',
    endDate: '2026-05-01',
    budgetCents: 24999,
  },
];
```

---

## DEMO AD CREATIVES

```typescript
// These use placeholder creative assets from /public/demo-ads/
const DEMO_CREATIVES = [
  {
    type: 'image',
    headline: 'Pro Beats. Instant Download.',
    bodyText: 'Access 10,000+ exclusive beats from top producers',
    ctaLabel: 'Shop Now',
    ctaUrl: '/beats',          // internal TMI link
    brandName: 'BeatMaker Pro',
    status: 'approved',
    imageUrl: '/demo-ads/beatmaker-tile.jpg',
  },
  {
    type: 'text_tile',
    headline: 'Record Your Next Hit',
    bodyText: 'Premium studio time starting at $40/hour',
    ctaLabel: 'Book Studio',
    ctaUrl: '/advertise',
    brandName: 'Studio Vault',
    status: 'approved',
  },
];
```

---

## HOUSE ADS (Always-On Fallback)

```typescript
// Seed these house ads (internal promotions for empty inventory)
const HOUSE_ADS = [
  {
    type: 'subscription_upsell',
    headline: 'Unlock the Full Stage',
    bodyText: 'Go Premium for exclusive access, early drops, and no limits',
    ctaLabel: 'Upgrade Now',
    ctaUrl: '/settings/billing',
    priority: 1,
    surfaces: ['homepage', 'articles', 'rooms'],
  },
  {
    type: 'booking_promo',
    headline: 'Venues Are Listening',
    bodyText: '40+ venues accepting artist booking requests this week',
    ctaLabel: 'See Venues',
    ctaUrl: '/booking',
    priority: 2,
    surfaces: ['homepage', 'articles'],
  },
  {
    type: 'beat_drop',
    headline: 'New Beats Just Dropped',
    bodyText: 'Fresh tracks from rising producers in the marketplace',
    ctaLabel: 'Explore Beats',
    ctaUrl: '/beats',
    priority: 3,
    surfaces: ['homepage', 'articles', 'games'],
  },
  {
    type: 'advertise_here',
    headline: 'Advertise on TMI',
    bodyText: 'Reach thousands of music fans from $9.99/week',
    ctaLabel: 'See Packages',
    ctaUrl: '/advertise/packages',
    priority: 10,
    surfaces: ['homepage', 'articles', 'games', 'rooms'],
  },
];
```

---

## DEMO ARTICLES (Editorial)

```typescript
const DEMO_ARTICLES = [
  {
    title: 'Who Took the Crown This Week?',
    subtitle: 'Weekly Cypher Results — Season 2026 Q1',
    category: 'studio_recap',
    status: 'published',
    tags: ['cypher', 'battle', 'weekly'],
    bodyMd: '## This Week's Crown

The weekly cypher brought...',
  },
  {
    title: 'A Deep Dive into Indie Rock',
    subtitle: 'How underground scenes are reshaping mainstream sound',
    category: 'music_news',
    status: 'published',
    tags: ['indie', 'rock', 'culture'],
    bodyMd: '## The Underground Wave

Independent artists are...',
  },
  {
    title: 'Top 10 Producers to Watch in 2026',
    subtitle: 'Rising talent discovered through TMI rankings',
    category: 'interview',
    status: 'published',
    tags: ['producers', 'rankings', 'discover'],
    bodyMd: '## The Next Wave of Producers

...',
  },
  {
    title: 'Platform Guide: How the Lobby Wall Works',
    subtitle: 'Discovery-first — undiscovered artists always go first',
    category: 'music_news',
    status: 'published',
    tags: ['guide', 'platform', 'discovery'],
    bodyMd: '## The Lobby Wall

At The Musician's Index...',
  },
  {
    title: 'Community Guidelines',
    subtitle: 'How we keep TMI a great space for everyone',
    category: 'music_news',
    status: 'published',
    tags: ['guidelines', 'community'],
    bodyMd: '## Our Community Values

...',
  },
];
```

---

## DEMO PARTY LOBBIES

```typescript
const DEMO_PARTIES = [
  {
    name: 'Hip Hop Heads HQ',
    isPublic: true,
    memberCount: 3,
  },
  {
    name: 'Beat Lab Session',
    isPublic: true,
    memberCount: 2,
  },
];
```

---

## DEMO GAME SESSIONS

```typescript
const DEMO_GAME_SESSIONS = [
  {
    gameType: 'trivia',
    status: 'LOBBY',
    isRanked: true,
    maxPlayers: 8,
    playerCount: 2,
  },
  {
    gameType: 'name_that_tune',
    status: 'LOBBY',
    isRanked: false,
    maxPlayers: 6,
    playerCount: 1,
  },
];
```

---

## STREAM & WIN STARTER SCORES

```typescript
// Seed current user with a starter score for visual demo
const STREAM_WIN_DEMO = {
  weeklyScore: 50,
  lifetimeScore: 50,
  currentStreak: 1,
};
```

---

## SEED COMMAND

```bash
# Run from repo root
npx ts-node packages/db/prisma/seed.ts

# Or via package.json script:
# "seed": "ts-node packages/db/prisma/seed.ts"
pnpm seed
```
