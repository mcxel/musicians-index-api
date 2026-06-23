# TMI Platform — Broken Button Report
Generated: 2026-06-14

Buttons/links that appear interactive but do nothing, go to stubs, or are missing routes.

---

## fan/theater/page.tsx

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| Chat form `SEND` | Clears input only — no API call | Wire to `POST /api/messages` with roomId="fan-theater" |
| Cosmetic shop skin buttons | No `onClick`, no route | Wire to `/upgrade` or open a modal |
| Memory Wall item links | `href="/fan/memories"` — route may not exist | Verify `/fan/memories` route exists |
| TRIVIA link | `href="/fan/trivia"` | Verify `/fan/trivia` route exists |
| ENTER LIVE ROOM | `href="/live/rooms/monthly-idol?from=fan-hub"` | Verify dynamic room route resolves |

---

## StreamWinRoom.tsx

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| BECOME A FOUNDER | No `href` or `onClick` — dead button | Wire to `/upgrade` or `/signup?plan=founder` |

---

## Marketplace (app/marketplace/page.tsx)

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| BUY NOW buttons | Route to `/api/stripe/checkout?product=marketplace_[id]&mode=payment` | Products are hardcoded; API must match |

---

## Home 1 Panels (Home1CoverPage.tsx)

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| BOOST buttons (Free Promo panel) | No href/onClick defined | Wire to `/signup` or `/performer/boost` |
| CLAIM FREE SLOT | Needs real destination | Wire to `/signup?promo=free` |
| Book venue buttons | No real destination | Wire to `/venues/book` or venue page |
| Sponsor Spotlight CTA | Static demo | Wire to `/sponsors/advertise` |

---

## Arena / Battles

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| Vote buttons | Increment local state only | Need to persist to `/api/battles/vote` |
| Challenge submission | No real track upload | Wire to upload pipeline |

---

## Cypher Stage

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| Join Cypher button | May not exist as functional CTA | Need real queue join |

---

## Profile Pages (ProfileLobbyRuntime)

| Button/Link | Current Behavior | Fix Required |
|---|---|---|
| Follow button (if present) | Check if wired to follow API | Verify `/api/follow` route |
| Tip button (if present) | Check if wired to Stripe | Verify tip checkout route |

---

## Routes That Need Existence Check

These are linked from UI but may be stubs or 404:

| Route | Linked From |
|---|---|
| `/fan/memories` | fan/theater Memory Wall panel |
| `/fan/trivia` | fan/theater header |
| `/live/rooms/monthly-idol` | fan/theater ENTER LIVE ROOM button |
| `/upgrade` | fan/theater cosmetics, PunPoints (appears in multiple places) |
| `/performers/[slug]` | Home 1 orbital nodes → **FIXED** now wires ProfileLobbyRuntime |
| `/fan/[slug]` | Nav links → **FIXED** now wires ProfileLobbyRuntime |

---

## Fixed This Session

- `/fan/[slug]` — was stub, now wires ProfileLobbyRuntime ✅
- `/performers/[slug]` — was stub, now wires ProfileLobbyRuntime ✅
- `cypher/stage` MaskedVideoTile import — was default, fixed to named export ✅
- `StreamWinRoom` MaskedVideoTile import — was default, fixed to named export ✅
- `/upgrade` — was 404 (linked from 6+ places); now redirects to `/season-pass` ✅
- `/fan/memories` — was 404; now reads cookie slug and redirects to `/fan/[slug]/memory` ✅
- `/fan/trivia` — was 404; now redirects to `/games/trivia` ✅
- `/live/rooms/monthly-idol` — resolves via `/live/rooms/[id]` dynamic route ✅ (no fix needed)
