# PACK9_DEPENDENCY_GRAPH.md
## What Every System Needs Before It Can Be Built

---

## READING THIS GRAPH

Arrow means "depends on":
A → B means "A cannot be built without B working first"

---

## FULL DEPENDENCY CHAIN

```
DATABASE (Prisma schema)
    ↓
AUTH SYSTEM (NextAuth + session)
    ↓
USER MODEL (fan / artist / admin roles)
    ↓
┌─────────────────────────────────────────┐
│  THESE CAN BUILD IN PARALLEL AFTER AUTH  │
├─────────────────────────────────────────┤
│  ARTIST PROFILE                          │
│  FAN PROFILE                             │
│  ADMIN ROLES                             │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  TIER 1 — CORE PRODUCT SYSTEMS          │
├─────────────────────────────────────────┤
│  ONBOARDING SYSTEM                       │
│    → needs: auth, profile, routes        │
│                                          │
│  POINTS ENGINE                           │
│    → needs: user model, events           │
│                                          │
│  FOLLOW SYSTEM                           │
│    → needs: artist profile, fan profile  │
│                                          │
│  NOTIFICATION SYSTEM                     │
│    → needs: user model, events, follow   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  TIER 2 — EVENT + ECONOMY SYSTEMS        │
├─────────────────────────────────────────┤
│  SUBSCRIPTION BILLING                    │
│    → needs: user model, Stripe setup     │
│                                          │
│  PAYOUT SYSTEM                           │
│    → needs: subscription, events, tips   │
│                                          │
│  LIVE EVENT SYSTEM                       │
│    → needs: rooms, artist profile        │
│                                          │
│  SEARCH ENGINE                           │
│    → needs: profiles, articles, events   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  TIER 3 — CONTENT + SOCIAL SYSTEMS       │
├─────────────────────────────────────────┤
│  DISCOVERY ENGINE                        │
│    → needs: artist index, follow, events │
│                                          │
│  FAN CLUBS                               │
│    → needs: follow, subscription, rooms  │
│                                          │
│  WATCH PARTIES                           │
│    → needs: rooms, follow, live events   │
│                                          │
│  CLIP SYSTEM                             │
│    → needs: live events, crowd metrics   │
│                                          │
│  CONTENT CALENDAR                        │
│    → needs: schedule service, events     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  TIER 4 — MODERATION + INTEGRITY         │
├─────────────────────────────────────────┤
│  CHAT MODERATION                         │
│    → needs: live rooms, user model       │
│                                          │
│  ANTI-FRAUD ENGINE                       │
│    → needs: tips, views, billing         │
│                                          │
│  REPORT SYSTEM                           │
│    → needs: user model, content model    │
│                                          │
│  WAITLIST ENGINE                         │
│    → needs: rooms, live events           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  TIER 5 — ADMIN + BUSINESS SYSTEMS       │
├─────────────────────────────────────────┤
│  SPONSOR PORTAL                          │
│    → needs: events, analytics, admin     │
│                                          │
│  SEASON ENGINE                           │
│    → needs: shows, host rotation, awards │
│                                          │
│  EMERGENCY BROADCAST                     │
│    → needs: notification, admin roles    │
│                                          │
│  DANIKA'S LAW WIDGET                     │
│    → needs: article system, user model   │
└─────────────────────────────────────────┘
```

---

## HARD DEPENDENCY RULES

These cannot be skipped or reversed:

1. Auth must be green before ANY user-facing feature
2. Points engine must be wired before subscription works
3. Follow system must exist before discovery feed is meaningful
4. Notification system must be wired before live event alerts work
5. Subscription must work before payout system ships
6. Rooms must work before watch parties, fan clubs, or moderation
7. Live events must work before clip system runs
8. Fraud detection must run before payouts reach artists

---

*Dependency Graph Pack 9 v1.0 — BerntoutGlobal XXL*

---
---
---

# PACK9_IMPLEMENTATION_ORDER.md
## Safe Brick-by-Brick Order for Copilot to Wire Pack 9

---

## ABSOLUTE FIRST — FIX THE BUILD

Before touching Pack 9, the build must be green.

```
STEP 0.1  Fix @tmi/hud-runtime package export resolution
STEP 0.2  Confirm apps/web local build passes
STEP 0.3  Confirm Cloudflare deploy is green
STEP 0.4  Smoke test: /, /register, /login all return 200
STEP 0.5  Smoke test: session persists after login
```

Only after STEP 0.5 is proven does Pack 9 wiring begin.

---

## PACK 9 WIRING ORDER

### STAGE 1 — CONTRACTS (No risk, no code changes)

```
1.1  Create packages/contracts/src/economy.ts
1.2  Create packages/contracts/src/social.ts
1.3  Create packages/contracts/src/notifications.ts
1.4  Create packages/contracts/src/moderation.ts
1.5  Create packages/contracts/src/artist-tools.ts
1.6  Create packages/contracts/src/onboarding.ts
1.7  Create packages/contracts/src/sponsor.ts
1.8  Create packages/contracts/src/integrity.ts
```

Proof: TypeScript compiles with no type errors across all contracts.

---

### STAGE 2 — ONBOARDING (Highest user impact, wire first)

```
2.1  Create onboarding.service.ts in apps/api/src/services/
2.2  Create onboarding-registry.ts in packages/platform-kernel/src/
2.3  Create apps/web/src/app/onboarding/artist/page.tsx
2.4  Create apps/web/src/app/onboarding/fan/page.tsx
2.5  Wire onboarding flow into post-auth routing
2.6  Test: new artist completes all 8 onboarding steps
2.7  Test: new fan completes genre selection and enters first venue
```

Proof: New account → onboarding → dashboard in one session, no dead ends.

---

### STAGE 3 — POINTS ENGINE (Needed for rooms and tiers)

```
3.1  Create points.service.ts in apps/api/src/services/
3.2  Wire points earning: event watch, reactions, tips
3.3  Create TierProgressBar.tsx and PointsBalance.tsx
3.4  Wire points balance to room entry tier gate
3.5  Test: watch 5 min → earn 10 points → balance updates
3.6  Test: points balance correctly sets room starting tier
```

Proof: Points balance visible on dashboard. Room tier matches points thresholds.

---

### STAGE 4 — FOLLOW SYSTEM

```
4.1  Create follow.service.ts in apps/api/src/services/
4.2  Create FollowButton.tsx component
4.3  Wire FollowButton to artist profile
4.4  Wire follows to notification triggers
4.5  Test: fan follows artist → artist sees +1 follower
4.6  Test: fan following feed populates
```

Proof: Follow persists across reload. Follower count correct.

---

### STAGE 5 — NOTIFICATIONS

```
5.1  Create notification.service.ts in apps/api/src/services/
5.2  Create NotificationBell.tsx
5.3  Create NotificationFeed.tsx
5.4  Wire notification triggers: artist live, new article, event starting
5.5  Create JuliusNotification.tsx wrapper
5.6  Test: follow artist → artist goes live → fan receives notification
```

Proof: Bell shows unread count. Feed shows correct events.

---

### STAGE 6 — SUBSCRIPTION BILLING

```
6.1  Add Stripe SDK to apps/api
6.2  Create subscription.service.ts
6.3  Create billing.controller.ts
6.4  Wire subscription tier to user model
6.5  Wire subscription tier to room entry gate
6.6  Test: Free user upgrades to Gold → room tier updates
6.7  Test: Stripe webhook processes correctly
```

Proof: Stripe payment completes. User tier updates in DB and UI.

---

### STAGE 7 — PAYOUT SYSTEM

```
7.1  Create payout.service.ts
7.2  Wire tip revenue to artist earnings ledger
7.3  Create EarningsDashboard.tsx
7.4  Wire payout schedule logic (weekly Thursday)
7.5  Test: tip sent → earnings ledger updates
7.6  Test: payout threshold reached → payout queued
```

Proof: Artist sees correct earnings. Payout record created.

---

### STAGE 8 — SEARCH + DISCOVERY

```
8.1  Create search.service.ts
8.2  Create discovery.service.ts with rank-first ordering
8.3  Wire SearchBar.tsx to search API
8.4  Wire discovery ordering to Preview Stack Wall
8.5  Test: search "jazz" returns relevant artists
8.6  Test: discovery feed shows highest rank# first
```

Proof: Search returns results. Discovery order correct (higher rank = shown first).

---

### STAGE 9 — MODERATION

```
9.1  Create moderation.service.ts
9.2  Create fraud.service.ts
9.3  Create report.controller.ts
9.4  Wire auto-filter to chat
9.5  Create ReportButton.tsx
9.6  Test: blocked word triggers auto-mute
9.7  Test: report submitted reaches moderation queue
```

Proof: Chat filter blocks test slur. Report appears in admin queue.

---

### STAGE 10 — ARTIST TOOLS

```
10.1  Create schedule.service.ts
10.2  Create ArtistDashboard.tsx with all tabs
10.3  Create ScheduleBuilder.tsx
10.4  Create AnalyticsHub.tsx
10.5  Wire clip.service.ts (post live events)
10.6  Test: artist schedules event → appears in calendar
10.7  Test: artist sees earnings + follower analytics
```

Proof: Artist dashboard fully loads. Schedule creates event.

---

### STAGE 11 — SPONSOR + SEASON (LAST)

```
11.1  Create sponsor.service.ts (basic)
11.2  Create SponsorSlot.tsx
11.3  Wire sponsor slots to event UI
11.4  Create season.service.ts
11.5  Wire Monthly Idol round tracking
11.6  Test: sponsor slot renders in event venue
11.7  Test: season round start/end functions correctly
```

Proof: Sponsor slot visible in venue side screen. Season round data correct.

---

### STAGE 12 — BOTS + PROOF GATES

```
12.1  Deploy economy-bot.json
12.2  Deploy notification-bot.json
12.3  Deploy moderation-bot.json
12.4  Deploy fraud-bot.json
12.5  Deploy onboarding-bot.json
12.6  Run PACK9_PROOF_GATES.md full checklist
12.7  Document all passing proof in /proof/ folder
```

---

*Implementation Order Pack 9 v1.0 — BerntoutGlobal XXL*
