# FINAL SOFT LAUNCH CERTIFICATION
**TMI Platform — Master Launch Checklist**  
**Date:** 2026-06-15 | **Owner:** Marcel Dickens, BernoutGlobal LLC

---

## Platform Constitution: 15 Rules Active

| # | Rule | Status |
|---|---|---|
| Tier | FREE→PRO→RUBY→SILVER→GOLD→PLATINUM→DIAMOND | ✅ |
| 1 | Upload Pipeline — one source, everywhere | ✅ |
| 2 | Media Priority — LIVE→MOTION→STATIC | ✅ |
| 3 | XP-Driven Rankings — computeRanks() | ✅ |
| 4 | Crown Rotation — 2mo overall / 1mo genre | ✅ |
| 5 | Home Structure — 1=Crown, 1-2=Billboard, 2=Magazine, 3=Live, 4=Market, 5=Arena | ✅ |
| 6 | Discovery Rails — mandatory | ✅ |
| 7 | Visual Canon — dark purple + neon | ✅ |
| 8 | Registry First | ✅ |
| 9 | Everything Earns XP | ✅ |
| 10 | Platform Identity — 7 systems simultaneously | ✅ |
| 11 | Content Freshness — LIVE→RECENT→POPULAR→ARCHIVE | ✅ |
| 12 | No Empty Inventory — getAdSlotForZone() | ✅ |
| 13 | Every Article Is a Hub | ✅ |
| 14 | No Empty Surface — Rule 14 | ✅ |
| 15 | Canister Integration — 11 canisters in all surfaces | 🔲 Building |

---

## SECTION 1 — REVENUE PATHS

| Revenue Stream | Infrastructure | End-to-End | Status |
|---|---|---|---|
| PRO/RUBY/SILVER/GOLD/PLATINUM/DIAMOND memberships | Stripe API exists | 🔲 Needs Stripe key in Vercel | ❌ |
| Tips (fan → performer) | `TipJarWidget` + Stripe | 🔲 Stripe Connect needed | ❌ |
| Ticket purchases | `/credits`, `/season-pass` | 🔲 Real price IDs needed | ❌ |
| Sponsor packages | `/advertising`, `SponsorRegistry` | 🔲 Checkout not wired | ❌ |
| Fan Club subscriptions | Route + Stripe subscription | 🔲 | ❌ |
| Beat/merch marketplace | `BeatMarketplaceShell` | 🔲 | ❌ |

**P0 Blocker:** Set `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## SECTION 2 — AUTH + ONBOARDING

| Feature | Route | Status |
|---|---|---|
| Sign up | `/signup` | ✅ |
| Log in | `/login` | ✅ |
| Account recovery | `/account-recovery` | ✅ |
| Session API | `/api/auth/session` | ✅ |
| 6 role sign-up flows | Fan, Performer, Writer, Venue, Sponsor, Admin | 🔲 Verify each |
| Role provisioning | `/api/auth/provision` | ✅ |
| Email verification | Not confirmed | 🔲 |

---

## SECTION 3 — HOME PAGES

| Page | Content Source | Visual | Live Data | Status |
|---|---|---|---|---|
| Home 1 — Crown | PerformerRegistry | ✅ Canonical tabloid-pop | 🔲 | 🔲 |
| Home 1-2 — Billboard | BillboardLiveWall | ✅ | 🔲 | 🔲 |
| Home 2 — Magazine | magazineIssueData | ✅ | 🔲 | 🔲 |
| Home 3 — Live World | LiveRoomRegistry | ✅ | 🔲 | 🔲 |
| Home 4 — Marketplace | SponsorRegistry | ✅ | 🔲 | 🔲 |
| Home 5 — Arena | BattleEngine | ✅ | 🔲 | 🔲 |

---

## SECTION 4 — PROFILE ECOSYSTEM

Ref: `PROFILE_ECOSYSTEM_CERTIFICATION.md`

| Profile Type | Routes | Canisters | Commerce | Overall |
|---|---|---|---|---|
| Performer | ✅ | 🔲 Building | 🔲 Stripe needed | 🔲 |
| Fan | ✅ | 🔲 Building | 🔲 | 🔲 |
| Writer | ✅ | 🔲 | — | 🔲 |
| Venue | ✅ partial | 🔲 | 🔲 | 🔲 |
| Sponsor | ✅ | 🔲 | 🔲 | 🔲 |
| Admin | ✅ | 🔲 | — | 🔲 |

---

## SECTION 5 — ADMIN / OVERSEER

Ref: `ADMIN_SWITCHING_CERTIFICATION.md`

| Feature | Status |
|---|---|
| OmniDashboards 4 tabs | ✅ |
| PersonaSwitcher no-logout | ✅ |
| Overseer real-time data | 🔲 Wire |
| Revenue panels | ❌ Stripe key needed |
| Admin routes (20+) | ✅ |

---

## SECTION 6 — MAGAZINE

Ref: `MAGAZINE_TO_PROFILE_CERTIFICATION.md`

| Feature | Status |
|---|---|
| Magazine Issue 1 | ✅ |
| Article pages (5+) | ✅ |
| Performer article hub (Rule 13) | 🔲 Verify all sections |
| Writer byline → profile | 🔲 |
| Article → Live Room link | ✅ CTAs added |
| Article → Playlist | 🔲 |
| Article → Memory Wall | 🔲 |
| DiscoveryRail on each article | ✅ |

---

## SECTION 7 — LIVE ROOMS

Ref: `LIVE_ROOM_CERTIFICATION.md`

| Feature | Status |
|---|---|
| LobbyEntryFlow 5 steps | ✅ |
| AudienceScene 5 venue types | ✅ |
| Bot audience fill (stadium effect) | ❌ BotAudienceFill.ts missing |
| Ultrarealistic bobblehead avatars | 🔲 Canister build |
| Face scan avatar | 🔲 Future phase |
| Go Live → broadcast | 🔲 Verify |
| Tip in live room | 🔲 Stripe needed |

---

## SECTION 8 — BILLBOARD WALL

Ref: `BILLBOARD_WALL_CERTIFICATION.md`

| Feature | Status |
|---|---|
| Tile click → LobbyEntryFlow | ✅ |
| Full 5-step entry | ✅ |
| Bot stadium fill | ❌ |
| Content freshness sort | 🔲 |
| Ad slot every 6th tile | 🔲 |
| LiveLobbyWallCanister | 🔲 |

---

## SECTION 9 — CANISTER SYSTEM (Rule 15)

| Canister | File Location | Built | Embedded | Priority |
|---|---|---|---|---|
| Playlist Canister | `canisters/PlaylistCanister.tsx` | 🔲 | 🔲 | P1 |
| Memory Wall Canister | `canisters/MemoryWallCanister.tsx` | 🔲 | 🔲 | P1 |
| Booking Canister | `canisters/BookingCanister.tsx` | 🔲 | 🔲 | P1 |
| Messaging Canister | `canisters/MessagingCanister.tsx` | 🔲 | 🔲 | P1 |
| Store Canister | `canisters/StoreCanister.tsx` | 🔲 | 🔲 | P1 |
| Avatar Creation Center | `canisters/AvatarCreationCenter.tsx` | 🔲 | 🔲 | P1 |
| Avatar Workspace | `canisters/AvatarWorkspace.tsx` | 🔲 | 🔲 | P1 |
| Inventory Canister | `canisters/InventoryCanister.tsx` | 🔲 | 🔲 | P2 |
| Public Lobby Canister | `canisters/PublicLobbyCanister.tsx` | 🔲 | 🔲 | P2 |
| Private Lobby Canister | `canisters/PrivateLobbyCanister.tsx` | 🔲 | 🔲 | P2 |
| Live Lobby Wall Canister | `canisters/LiveLobbyWallCanister.tsx` | 🔲 | 🔲 | P1 |

Source implementations exist (`PlaylistEngine`, `MemoryWall`, etc.). Task is wrapping them as embeddable canisters.

---

## SECTION 10 — MESSAGING

Ref: `MESSAGE_SYSTEM_CERTIFICATION.md`

| Feature | Status |
|---|---|
| `/messages` loads | 🔲 |
| Thread DMs work | 🔲 |
| Real-time delivery | 🔲 |
| Unread badge | 🔲 |
| `MessagingCanister` | 🔲 |

---

## SECTION 11 — STRIPE

Ref: `STRIPE_CERTIFICATION.md`

| Requirement | Status |
|---|---|
| Env vars in Vercel | ❌ Must be set |
| Membership purchase E2E | ❌ |
| Tip flow | ❌ |
| Ticket purchase | ❌ |
| Sponsor package | ❌ |
| Stripe Connect | ❌ P1 |

---

## SECTION 12 — BOTS

Per platform constitution: minimum 62 bots activated.

| Bot System | Status |
|---|---|
| Bot engine `lib/bots/` | ✅ EXISTS |
| 62+ bots configured | 🔲 Verify count |
| Bots in audience (sit-ins) | ❌ `BotAudienceFill.ts` missing |
| Bot behavior (reactions, hype) | 🔲 Wire to AudienceScene |
| Bot avatar uniqueness | ❌ Not built |

---

## SECTION 13 — ADSENSE READINESS

| Requirement | Status |
|---|---|
| Privacy Policy | ✅ Real page |
| Terms of Service | ✅ Real page |
| Creator Policy | ✅ Full 10-section |
| Advertiser Policy | ✅ Full 10-section |
| Refund Policy | ✅ Full 10-section |
| Originality Policy | ⚠️ Thin — needs expansion |
| No placeholder content | ✅ (Rule 14) |
| Real article content | ✅ Magazine Issue 1 |
| No lorem ipsum | ✅ |
| Working navigation | ✅ |
| Mobile responsive | 🔲 Verify |

---

## LAUNCH BLOCKERS (Must fix before soft launch)

| # | Blocker | Impact |
|---|---|---|
| 1 | Stripe env vars not set | ALL revenue flows broken |
| 2 | `BotAudienceFill.ts` missing | Audience looks empty on go-live |
| 3 | Checkout page hardcoded | No real purchases possible |
| 4 | Messaging real-time | Users can't communicate |
| 5 | Stripe Connect | Performers can't receive tips/payments |

---

## LAUNCH READINESS (Can ship at soft launch)

| System | Ready |
|---|---|
| Home pages 1-5 visual | ✅ |
| Auth (login/signup) | ✅ |
| Magazine Issue 1 | ✅ |
| Profile routes all roles | ✅ |
| LobbyEntryFlow 5-step | ✅ |
| AudienceScene 5 venues | ✅ |
| Discovery Rails | ✅ |
| DiscoveryRail on all pages | ✅ |
| Ad slot fallback chain | ✅ |
| Footer all links | ✅ |
| Policy pages | ✅ |
| Admin routes | ✅ |
| XP system | ✅ |
| Rankings (computeRanks) | ✅ |
| Crown Rotation | ✅ |

---

## SOFT LAUNCH SEQUENCE

```
Step 1: Set Stripe env vars in Vercel
Step 2: Test PRO membership purchase end-to-end
Step 3: Build BotAudienceFill.ts + wire to AudienceScene
Step 4: Verify Go Live → bot fill → real audience seats
Step 5: Wire PlaylistCanister + LiveLobbyWallCanister
Step 6: Runtime test all home pages (real browser, mobile)
Step 7: Onboard first 3 real performers
Step 8: Invite first 50 beta fans
Step 9: Monitor Overseer Deck
Step 10: Collect first real revenue
```

---

## SIGN-OFF TABLE

| Area | Sign-Off Authority | Status |
|---|---|---|
| Revenue paths | Marcel Dickens | ❌ Pending Stripe |
| Visual design | Marcel Dickens | ✅ |
| Profile ecosystem | Marcel Dickens | 🔲 Runtime verify |
| Live room audience | Marcel Dickens | 🔲 Bot fill needed |
| Canister system | Marcel Dickens | 🔲 Building |
| Constitution compliance | All 15 rules | 🔲 Rule 15 building |

**Overall Soft Launch Status: READY ON INFRASTRUCTURE, BLOCKED ON STRIPE ENV VARS + BOT FILL ENGINE.**

Set those two up → onboard first performers → collect first revenue.
