# SOURCE_OF_TRUTH_MATRIX.md
## Where Truth Lives for Every Major System

---

## RULE
When two sources have conflicting data, the Source of Truth always wins.
No system writes to another system's source of truth.

---

| System | Source of Truth | NEVER store here |
|---|---|---|
| User identity | `users` DB table | Local storage, cookies alone |
| Artist rank# | `artist_profiles.rankNumber` | In-memory only |
| Points balance | `points_transactions` (sum) | Client-side cache only |
| Subscription tier | `subscriptions` DB table | User session only |
| Earnings balance | `artist_earnings` DB table | Artist's browser |
| Live event state | GlobalStateEngine (server) | Individual client |
| Room tier | GlobalStateEngine → DB on change | Local component state |
| Follow list | `follows` DB table | Frontend store only |
| Notification count | `notifications` (unread count) | Bell UI only |
| Onboarding % | `onboarding_progress` DB table | Frontend step state |
| Sponsor approval | `sponsor_campaigns.approvedBy` | Any other flag |
| Emergency active | `emergency_broadcasts.active` | Env var or toggle |
| Feature flags | `feature_flags` DB or `.env` | Hardcoded in components |

---

*Source of Truth Matrix v1.0 — BerntoutGlobal XXL*

---
---
---

# UX_STATE_COMPLETION_MASTER.md
## Every Page Must Have Every State Defined

---

## THE REQUIRED STATE SET

Every page, widget, panel, and card must handle ALL of:

| State | What Shows |
|---|---|
| `loading` | Skeleton/spinner while data fetches |
| `empty` | Zero-state with helpful prompt |
| `success` | Normal populated view |
| `partial` | Some data, some missing |
| `error` | Something went wrong + retry |
| `unauthorized` | User can't access this |
| `session_expired` | Redirect to login |
| `offline` | No network connection |

---

## STATE CHECKLIST BY SURFACE

| Page | Loading | Empty | Success | Error | Unauth | Expired |
|---|---|---|---|---|---|---|
| Homepage | ❌ | ❌ | 🟡 Partial | ❌ | N/A | N/A |
| Artist profile | ❌ | N/A | 🟡 Partial | ❌ | N/A | N/A |
| Article page | ❌ | N/A | 🟡 Partial | ❌ | N/A | N/A |
| Fan dashboard | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Artist dashboard | ❌ | ❌ | 🟡 Partial | ❌ | ❌ | ❌ |
| Admin panel | ❌ | ❌ | 🟡 Partial | ❌ | ❌ | ❌ |
| Live room | ❌ | N/A | ❌ | ❌ | ❌ | ❌ |
| Search results | ❌ | ❌ | ❌ | ❌ | N/A | N/A |
| Onboarding | ❌ | N/A | ❌ | ❌ | ❌ | ❌ |
| Earnings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Notifications | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend: ✅=Done, 🟡=Partial, ❌=Missing**

---

## COPILOT RULE

Before any page is marked complete, ALL states must render correctly.
No exceptions.

---

*UX State Completion Master v1.0 — BerntoutGlobal XXL*

---
---
---

# PLATFORM_ROADMAP_MASTER.md
## Build Order From Zero to Ecosystem

---

## PHASE 1 — CORE PLATFORM (Current Focus)
**Goal**: Working deploy, auth, onboarding, profiles, articles

- Fix Cloudflare build blockers
- Prove homepage loads
- Prove register/login/session
- Prove artist onboarding (8 steps)
- Prove fan onboarding
- Prove article loads
- Prove artist profile loads
- Ship to first test users

**Completion criteria**: All 8 onboarding proof gates pass

---

## PHASE 2 — ECONOMY + SOCIAL (Next)
**Goal**: Points, subscriptions, follows, notifications

- Points engine live
- Subscription billing (Stripe)
- Follow system live
- Notification system live
- Fan club (basic)
- Search working

**Completion criteria**: Fan earns points, artist sees follower count

---

## PHASE 3 — LIVE EVENTS (Rooms)
**Goal**: Artists can go live, fans can watch in venues

- Free tier rooms implemented (Living Room, Circle, Loft)
- Going Live works
- Seat assignment works
- Julius appears in rooms
- Crowd animation (basic)

**Completion criteria**: Artist goes live in Living Room, 5 fans join

---

## PHASE 4 — SHOWS + GAMES
**Goal**: Deal or Feud, Game Night, Monthly Idol (basic)

- Deal or Feud runs end-to-end
- Bobby Stanley host wired
- Scoreboard works
- Winner reveal works
- Monthly Idol Season 1 begins

**Completion criteria**: First Deal or Feud episode airs

---

## PHASE 5 — TIER TRANSFORMATION + PRESTIGE
**Goal**: Rooms evolve live, tier upgrades are visual

- Tier transformation 10-step sequence
- Seat anchor confirmed
- Prestige overlay (badge, glow)
- Diamond and Signature rooms unlocked

**Completion criteria**: One event transforms from Living Room to Back Room live

---

## PHASE 6 — SPONSOR + REVENUE
**Goal**: Sponsors in venues, artist payouts working

- Sponsor slot wired to rooms and magazine
- Sponsor portal (basic)
- Payout system working
- Revenue reconciliation

**Completion criteria**: First sponsor campaign live, first artist payout sent

---

## PHASE 7 — ADVANCED SYSTEMS (Post-Launch)
- Avatars + motion system
- World Concert multi-venue
- Cypher + Battle at scale
- Clip system
- Advanced game shows
- PWA mobile app

---

## PHASE 8 — SCALE + ECOSYSTEM
- International support
- External artist API
- Plugin system
- Third-party integrations

---

*Platform Roadmap Master v1.0 — BerntoutGlobal XXL*

---
---
---

# DOCUMENTATION_INDEX_MASTER.md
## Every File Across All 10 Packs — The Complete Map

---

## ARCHITECTURE PACKS

| Pack | ZIP File | Core Content |
|---|---|---|
| Pack 1 | `tmi-components-complete.zip` | 10 UI components |
| Pack 2 | `tmi-complete-v2.zip` | 14 components + MASTER_ARCHITECTURE |
| Pack 3 | `tmi-nav-v3.zip` | MagazineNav + MERGE_MANIFEST |
| Pack 4 | `tmi-cast-system.zip` | Full cast system |
| Pack 5 | `tmi-cast-pack2.zip` | Shows, wardrobe, venues |
| Pack 6 | `tmi-live-events.zip` | All 6 live event types |
| Pack 7 | `tmi-room-system.zip` | 15 rooms + shared systems |
| Pack 8 | `tmi-final-15.zip` | System integrity layer |
| Pack 9 | `tmi-pack9-product-layer.zip` | Economy/social/tools |
| Pack 9W | `tmi-pack9-wiring.zip` | Contracts + wiring |
| Pack 10 | `tmi-pack10-operations.zip` | This pack |

---

## FIND ANY DOC FAST

| I need... | Look in... |
|---|---|
| Room specs | Pack 7 |
| Host personalities | Pack 5 |
| Julius behavior | Pack 4 |
| VEX system | Pack 4/5 |
| Show formats | Pack 5 |
| Live event rules | Pack 6 |
| State engine | Pack 8 |
| Points/economy | Pack 9 |
| Follow/social | Pack 9 |
| Onboarding flow | Pack 9 + Pack 10 |
| Deploy instructions | Pack 10 |
| TypeScript contracts | Pack 9 Wiring |
| API routes | Pack 9 Wiring |
| Proof gates | Pack 9 Wiring + Pack 10 |
| Style bindings | Pack 9 Wiring |
| Copilot brief | Pack 9 Wiring |
| Drift audit | Pack 10 |
| Completion board | Pack 10 |
| Naming law | Pack 10 |
| Data model | Pack 10 |
| Roadmap | Pack 10 |

---

*Documentation Index Master v1.0 — BerntoutGlobal XXL*
