# MASTER_READINESS_MATRIX.md
## Every Feature Tracked — Designed → Wired → Proof → Launch Ready
### BerntoutGlobal XXL / The Musician's Index

Status: ✅ = complete | 🔧 = needs wiring | ⚠️ = shell only | ❌ = not started

---

## INFRASTRUCTURE

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| API health endpoint /health | ✅ | 🔧 | ❌ | ❌ |
| API readyz endpoint /api/readyz | ✅ | 🔧 | ❌ | ❌ |
| Cloudflare Pages build | ✅ | 🔧 | ❌ | ❌ |
| Redis connection | ✅ | 🔧 | ❌ | ❌ |
| PostgreSQL connection | ✅ | 🔧 | ❌ | ❌ |
| Stripe webhook endpoint | ✅ | 🔧 | ❌ | ❌ |
| WebSocket gateway | ✅ | 🔧 | ❌ | ❌ |
| Cloudflare R2 media | ✅ | 🔧 | ❌ | ❌ |
| Bull job queues | ✅ | ❌ | ❌ | ❌ |

## AUTH

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Signup → profile auto-create | ✅ | ⚠️ | ❌ | ❌ |
| Login → session | ✅ | ⚠️ | ❌ | ❌ |
| Middleware auth guard | ✅ | ⚠️ | ❌ | ❌ |
| Session expiry modal | ✅ | 🔧 | ❌ | ❌ |
| Kid account route blocking | ✅ | ❌ | ❌ | ❌ |

## DISCOVERY

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Lobby wall (viewers_asc sort) | ✅ | 🔧 | ❌ | ❌ |
| Homepage belts | ✅ | 🔧 | ❌ | ❌ |
| Search | ✅ | ❌ | ❌ | ❌ |
| Activity feed | ✅ | ❌ | ❌ | ❌ |
| Random page engine | ✅ | ❌ | ❌ | ❌ |

## PROFILES

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Artist profile (with Diamond) | ✅ | 🔧 | ❌ | ❌ |
| Producer profile | ✅ | ⚠️ | ❌ | ❌ |
| Fan profile | ✅ | ⚠️ | ❌ | ❌ |
| Venue profile | ✅ | ⚠️ | ❌ | ❌ |
| Verification badges | ✅ | ❌ | ❌ | ❌ |
| Profile settings | ✅ | ❌ | ❌ | ❌ |

## LIVE ROOMS

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Arena room | ✅ | 🔧 | ❌ | ❌ |
| Battle room | ✅ | 🔧 | ❌ | ❌ |
| Cypher room | ✅ | 🔧 | ❌ | ❌ |
| Producer room | ✅ | 🔧 | ❌ | ❌ |
| Room scene backgrounds | ✅ | ❌ | ❌ | ❌ |
| Room audio (AudioProvider) | ✅ | 🔧 | ❌ | ❌ |
| Turn-based audio enforcement | ✅ | 🔧 | ❌ | ❌ |
| Tip in rooms | ✅ | ❌ | ❌ | ❌ |

## ECONOMY

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Tips | ✅ | ❌ | ❌ | ❌ |
| Wallet dashboard | ✅ | ❌ | ❌ | ❌ |
| Fan credits | ✅ | ❌ | ❌ | ❌ |
| Fan clubs | ✅ | ❌ | ❌ | ❌ |
| Beat marketplace | ✅ | ❌ | ❌ | ❌ |
| Ticket purchase + anti-bot | ✅ | ❌ | ❌ | ❌ |
| Stripe payouts (artist) | ✅ | ❌ | ❌ | ❌ |
| Owner profit distribution | ✅ | ❌ | ❌ | ❌ |

## SAFETY

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Kid communication blocking | ✅ | ❌ | ❌ | ❌ |
| Kid performer parent approval | ✅ | ❌ | ❌ | ❌ |
| Family account dashboard | ✅ | ❌ | ❌ | ❌ |
| Content moderation bot | ✅ | ❌ | ❌ | ❌ |
| Block/mute system | ✅ | ❌ | ❌ | ❌ |

## NOTIFICATIONS + COMMUNICATIONS

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| In-app notifications | ✅ | ❌ | ❌ | ❌ |
| Push notifications (VAPID) | ✅ | ❌ | ❌ | ❌ |
| Email (Resend) | ✅ | ❌ | ❌ | ❌ |
| Weekly digest bot | ✅ | ❌ | ❌ | ❌ |
| Notification preferences | ✅ | ❌ | ❌ | ❌ |

## COMPETITION + SEASONS

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Seasons | ✅ | ❌ | ❌ | ❌ |
| Competitions + brackets | ✅ | ❌ | ❌ | ❌ |
| Rankings + leaderboards | ✅ | ❌ | ❌ | ❌ |
| Season awards | ✅ | ❌ | ❌ | ❌ |

## ADMIN + OPERATIONS

| Item | Designed | Wired | Proof | Launch Ready |
|---|---|---|---|---|
| Admin command center | ✅ | 🔧 | ❌ | ❌ |
| Feature flags | ✅ | 🔧 | ❌ | ❌ |
| Financial dashboard | ✅ | ❌ | ❌ | ❌ |
| Owner profit panel | ✅ | ❌ | ❌ | ❌ |
| Moderation queue | ✅ | ❌ | ❌ | ❌ |
| Billing integrity bot | ✅ | ❌ | ❌ | ❌ |
