# LAUNCH REVENUE & LOOP CERTIFICATION
**Date:** 2026-06-15 | **Focus:** Production Truth & Monetization

This document tracks the actual production reality of critical user loops. 
**Success Measure:** Money can move. Bookings can happen. Sponsors can attach. Tickets can sell. Users can complete a core loop without dead-ending.

## Critical Flow Matrix

| Critical Flow | Status | Route / UI | Dependencies | Dead Ends? | Rev Impact | Owner | Fix Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Signup** | 🟢 Believed Working | `/auth` | NextAuth, Prisma `User` | No | High | BlackBox | P2 |
| **2. Login** | 🟢 Believed Working | `/auth` | NextAuth, Prisma `User` | No | High | BlackBox | P2 |
| **3. Profile Creation** | 🟡 Partial | `/onboarding` | Prisma Profiles, Setup Flow | Yes (Camera/Avatar drop-offs) | High | Claude | P1 |
| **4. Go Live** | 🟢 Believed Working | `/performer/studio` | Daily.co, `api/live/go` | No (Curtain UX added) | High | Gemini | P1 |
| **5. Join Room** | 🟡 Partial | `UniversalLobbyEntry` | `AudienceScene`, `Presence` | No | High | Claude | P0.5 |
| **6. Send Message** | 🟡 Partial | `OmniPresenceEngine` | WebSockets/Pusher | Yes (UI only, no DB sync) | Medium | Gemini | P2 |
| **7. Receive Tip** | 🔴 Missing | `MaskedVideoTile` HUD | Stripe Connect, `Ledger` | Yes (Mock UI) | High | BlackBox | P0 |
| **8. Buy Membership** | 🔴 Missing | `/season-pass` | Stripe Checkout, `Subscription` | Yes (Mock UI) | High | BlackBox | P0 |
| **9. Buy Ticket** | 🔴 Missing | `/home/5`, `/arena` | Stripe Checkout, `Ticket` | Yes (Mock UI) | High | BlackBox | P0 |
| **10. Booking Request** | 🟡 Partial | `/performer/profile` | `BookingRegistry`, API routes | Yes (Mock Data array) | High | BlackBox | P0 |
| **11. Sponsor Purchase**| 🔴 Missing | `/advertise` | Stripe, `SponsorSlotRegistry` | Yes (Mock Data array) | High | BlackBox | P0 |
| **12. Memory Capture** | 🟢 Believed Working | `/fan/[slug]/memory` | `FeedItem` DB, `MemoryEngine` | No | Medium | Claude | P1 |
| **13. Playlist Share** | 🟡 Partial | `/playlist` | LocalStorage | Yes (No social API) | Low | Claude | P2 |
| **14. Live Session Registry** | 🟡 Partial | `GlobalLiveSessionRegistry` | Home 1-5, Games, Magazine, Profiles | Yes (Fragmentation risk) | High | Claude | P0.5 |

---

## Phase A: Revenue Certification (P0 Blockers)
*Money cannot currently move through the platform. These must be resolved before any further UX expansion.*

1. **Stripe Connect Integration:** Performers need a way to receive Tips and Booking Escrows. `Wallet` models exist, but Stripe Connect onboarding is missing.
2. **Stripe Checkout Integration:** Fans need to be able to buy Memberships (Season Pass) and Tickets.
3. **Sponsor Self-Serve Checkout:** Brands need to be able to purchase a `SponsorSlot` directly from `/advertise`.
4. **Registry Hardening:** Remove `[mockData]` from `SponsorRegistry.ts` and `BookingRegistry.ts`. Connect them directly to Prisma models.

## Phase A.5: Core Experience Certification (P0.5 Blockers)
*Universal Room Entry Flow (Preview → Join Lobby → Seat Assignment → AudienceScene → Room) must be standardized.*
*Live Session Registry must act as the single source of truth across all discovery surfaces.*

1. **Universal Lobby Entry:** Elevate this to core infrastructure. It affects Home 1-5, Games, Battles, Cyphers, Challenges, Venues, Profiles, Magazine, and Billboard Walls.
2. **Live Session Registry Certification:** One Live Session → Many Discovery Surfaces. Prevent registry fragmentation.

## Phase B: UI & Flow Expansion (P1 Blockers)
1. **Dead-Click Elimination:** Audit all cards. If it looks clickable, it must trigger the Universal Entry Flow.
2. **Profile Completion:** Ensure onboarding flows smoothly into fully functional profile hubs.

## Phase C: Retention Certification (P2 Blockers)
*Habit loops must be closed.*

1. **XP Wiring:** Ensure `AudienceScene` reactions (Wave, Jump, Hype) successfully hit the `ParticipationLedger` to award points.
2. **Post-Event Loop:** When a live broadcast ends, automatically trigger the Memory Capture prompt before returning the user to the Arena.

---

### Execution Directive

**BlackBox — Revenue & Infrastructure Lead:** Stay focused on Stripe, Wallets, Tips, Memberships, Tickets, Sponsor Purchases, Booking Requests, and Registry Hardening. Nothing else. No new dashboards. No new visual systems. No new profile types. Only revenue plumbing.

**Claude — Blueprint Completion Lead:** Stay focused on Universal Lobby Entry, Audience Scene, Games Discovery, Magazine Integration, Billboard Live Lobby Wall, Profile Completion, and Avatar Runtime. Most importantly: Every card → Preview → Join Lobby → Audience.

**Gemini — Integration & Loop Closure Lead:** Focus on Dead Click Elimination, XP Wiring, Memory Prompts, ParticipationLedger, Writer Routing, Sponsor Routing, TheaterCurtainShell, and Global Audio Bus. Verify: User Action → Reward → Return Loop.