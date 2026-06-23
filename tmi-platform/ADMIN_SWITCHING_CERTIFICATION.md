# ADMIN SWITCHING CERTIFICATION
**TMI Platform — No-Logout Persona Switching & Observatory Audit**  
**Date:** 2026-06-15 | **Priority:** P0

---

## Architecture Overview

Per Marcel's directive: Admin ≠ Performer ≠ Fan. Admin = Network Operations Center.  
Account switching is MANDATORY. Marcel's flow: `Founder → Fan View → Performer View → Observatory → Back → no logout ever`.

---

## CORE INFRASTRUCTURE

### PersonaSwitcher + MultiPersonaEngine

| Component | File | Status |
|---|---|---|
| `PersonaSwitcher` UI | `components/hud/PersonaSwitcher.tsx` | ✅ EXISTS |
| `MultiPersonaEngine` | `lib/identity/MultiPersonaEngine.ts` | ✅ EXISTS |
| Cookie-based session | `MultiPersonaEngine.ts` → `document.cookie` | ✅ No logout required |
| Per-persona isolation | wallet, XP, rankings, achievements, storefront | ✅ Separate per persona |
| Shared across personas | notifications, observatory, platform membership | ✅ Unified |

### Available Personas (Self-Addable)
```
fan | artist | producer | performer | dj | host | sponsor | advertiser | venue
```
Any user can add any persona combination. Session token unchanged on switch.

---

## OMNIDASHBOARDS — MISSION CONTROL

| Tab | Label | Purpose | Status |
|---|---|---|---|
| Tab 1 | 🎭 FAN THEATER | Fan's audience view, activity feed | ✅ Built |
| Tab 2 | 🎤 ARTIST STUDIO | Artist control panel view | ✅ Built |
| Tab 3 | 👁 OVERSEER DECK | Mission control / NOC panels | ✅ Built |
| Tab 4 | ⚙️ ADMIN HUB | BerntoutGlobal administration | ✅ Built |

File: `components/hud/OmniDashboards.tsx`

---

## OVERSEER DECK PANEL AUDIT

The Overseer Deck is Marcel's Network Operations Center. It must function like a broadcast control room.

### Expected Panels
| Panel | Data Source | Current Status | Fix Required |
|---|---|---|---|
| Live Rooms — count & list | `getLiveRooms()` or LiveRoomRegistry | 🔲 Needs runtime verify | Wire to LiveRoomRegistry |
| Audience counts per room | Real-time or polling | 🔲 Not confirmed | Socket or polling |
| Active Battles count | BattleEngine | 🔲 Not confirmed | Wire count query |
| Active Cyphers count | CypherEngine | 🔲 Not confirmed | Wire count query |
| Revenue today | Stripe Webhook → DB | 🔲 Requires STRIPE_SECRET_KEY | Set env var |
| Total memberships | Prisma `User.tier` count | 🔲 Not confirmed | DB query |
| New uploads (last 24h) | PerformerRegistry or DB | 🔲 Not confirmed | Query |
| Sponsors / Advertisers | SponsorRegistry | ✅ Registry data available | |
| Moderation queue | DB `ModerationQueue` | 🔲 Not confirmed | Query |
| Security alerts | Auth anomaly logs | 🔲 Not confirmed | Wire |
| System health | `/api/health` | 🔲 Check exists | Verify endpoint |

---

## SWITCHING FLOW CERTIFICATION

### Marcel's Required Flow
```
1. Marcel logs in as Founder/Admin
2. Opens OmniDashboards → ADMIN HUB tab → sees platform-wide metrics
3. Clicks PersonaSwitcher → selects "fan"
4. View shifts to FAN THEATER tab — sees platform as a fan
5. Clicks PersonaSwitcher → selects "performer"  
6. View shifts to ARTIST STUDIO tab — sees platform as performer
7. Clicks PersonaSwitcher → selects "admin"
8. Returns to OVERSEER DECK — full observatory view
9. Zero logouts throughout
```

### Switch Mechanism
| Step | Implementation | Status |
|---|---|---|
| Click PersonaSwitcher | Renders persona grid with `MultiPersonaEngine.getPersonas()` | ✅ |
| Select persona | Sets cookie: `tmi_active_persona=fan` | ✅ |
| View updates | `OmniDashboards` reads active persona → updates `activeTab` | 🔲 Verify connection |
| XP/wallet isolation | `MultiPersonaEngine.getPersonaState(persona)` | ✅ |
| No session change | JWT/cookie unchanged, only `tmi_active_persona` cookie changes | ✅ |

### Critical Verification Needed
- Does `OmniDashboards.tsx` read `MultiPersonaEngine.getActivePersona()` to set `activeTab`?
- Does persona switch immediately update the visible tab without page reload?
- Can Marcel switch from admin → fan persona while Observatory data continues updating in background?

---

## ADMIN ROUTES VERIFICATION

| Route | Purpose | Status |
|---|---|---|
| `/admin` | Admin root | ✅ |
| `/admin/analytics` | Revenue + user analytics | ✅ |
| `/admin/bots` | Bot management | ✅ |
| `/admin/content` | Content moderation | ✅ |
| `/admin/jay-paul` | Artist management hub | ✅ |
| `/admin/moderation` | Moderation queue | ✅ |
| `/admin/revenue` | Revenue dashboard | ✅ |
| `/admin/security` | Security & auth logs | ✅ |
| `/admin/users` | User management | ✅ |
| `/admin/visual-queue` | Visual review queue | ✅ |
| `/dashboard/admin` | Alt admin dashboard | ✅ |

---

## CANISTER INTEGRATION IN ADMIN VIEW (Rule 15)

The Overseer Deck must embed these canisters in its panels:
| Canister | Purpose in Admin View | Status |
|---|---|---|
| Live Lobby Wall Canister | See all active rooms from observatory | 🔲 Wire |
| Messaging Canister | Admin DM / broadcast | 🔲 Wire |
| Activity Timeline Canister | Platform-wide event feed | ✅ `ActivityTimelineCanister.tsx` exists |
| Playlist Canister | Monitor featured tracks | 🔲 Wire |
| Memory Wall Canister | Platform memories / highlights | 🔲 Wire |
| Inventory Canister | User inventory oversight | 🔲 Wire |

---

## CERTIFICATION STATUS

| Test | Expected | Status |
|---|---|---|
| PersonaSwitcher renders | Shows persona grid | 🔲 Runtime verify |
| Switch fan → performer → admin | No page reload | 🔲 Runtime verify |
| OmniDashboards tab updates on persona switch | Tab changes instantly | 🔲 Runtime verify |
| Overseer Deck shows live room count | Real count from registry | 🔲 Wire + verify |
| Revenue panels populate | Requires STRIPE_SECRET_KEY | ❌ Needs env var |
| Admin routes all load | No 404s | ✅ Routes confirmed |
| Canister panels in Overseer | Embedded view | 🔲 Wire required |

**Overall: Infrastructure exists. Runtime connection between PersonaSwitcher ↔ OmniDashboards tab sync and Overseer Deck real data population needs verification and wiring.**
