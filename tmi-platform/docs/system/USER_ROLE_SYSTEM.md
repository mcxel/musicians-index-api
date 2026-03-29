# USER_ROLE_SYSTEM.md
# User Role System — RBAC Architecture Reference
# Repo paths: apps/web/src/middleware.ts, packages/db/prisma/schema.prisma
# DO NOT MODIFY LOCKED AUTH/RBAC WITHOUT PROOF GATE

## Current Roles (from Prisma schema)

| Role | Description |
|------|-------------|
| `USER` | Standard fan — can consume content, earn points, join rooms |
| `ARTIST` | Has a public profile, can submit content, request bookings |
| `STAFF` | Can manage content, moderate, not full admin |
| `ADMIN` | Full system access including admin command center |
| `JUDGE` | Can score cypher/competition rounds |
| `SPONSOR` | Access to sponsor dashboard, ad tile management |

---

## Role Assignment Flow

1. User registers (email or OAuth)
2. Onboarding flow: user selects their role intent (fan, artist, sponsor)
3. Role is confirmed and set — `USER` is default, `ARTIST`/`SPONSOR` requires onboarding completion
4. `STAFF`, `ADMIN`, `JUDGE` are assigned manually by Admin only
5. `OnboardingState` must be `COMPLETE` before role is active

---

## Diamond Status (Special Tier — Outside Normal RBAC)

Diamond status is a *visual and points tier*, not a DB role.
It is stored separately and propagates into artist profile styling, article theming, and HUD display.

### Diamond Rules
- **Marcel**: Permanent Diamond — must be seeded in DB
- **B.J.M.**: Permanent Diamond — must be seeded in DB
- Other artists: earn Diamond through points/achievement gates
- Diamond status never expires for permanent holders

### Diamond DB Field (to add to Artist model)
```prisma
// Add to Artist model:
diamondStatus    String  @default("NONE")  // NONE | DIAMOND | PERMANENT_DIAMOND
diamondGrantedAt DateTime?
diamondGrantedBy String? // admin userId who granted it
```

### Diamond Seed (must run on first deploy)
```typescript
// In packages/db/prisma/seed.ts
await prisma.artist.updateMany({
  where: { name: { in: ['Marcel', 'B.J.M.'] } },
  data: { diamondStatus: 'PERMANENT_DIAMOND', diamondGrantedAt: new Date() }
});
```

---

## Route Protection Matrix

| Route Pattern | Minimum Role | Additional Check |
|---------------|-------------|-----------------|
| `/` | None | Public |
| `/articles/**` | None | Published only without auth |
| `/artists/**` | None | Public profiles |
| `/streamwin` | USER | Must be logged in to earn points |
| `/live/**` | USER | — |
| `/cypher/**` | USER | — |
| `/games/**` | USER | Join requires login |
| `/tickets/**` | USER | Purchase requires login |
| `/dashboard/**` | USER | Own data only |
| `/artists/dashboard/**` | ARTIST | Own profile only |
| `/sponsors/dashboard` | SPONSOR | Own campaign only |
| `/admin/**` | ADMIN or STAFF | |
| `/admin/bots/**` | ADMIN | |
| `/admin/booking/requests/**` | ADMIN or STAFF | |

---

## Middleware Enforcement

The file `apps/web/src/middleware.ts` is **LOCKED**.
Do not modify it without a proof gate (build green + auth test green).

Current middleware enforces:
- Session validation on protected routes
- Role check for admin/staff routes
- Onboarding redirect for incomplete users
- Redirect logged-in users away from `/auth/signin`

---

## Staff vs Admin Distinction

| Action | STAFF | ADMIN |
|--------|-------|-------|
| Create/edit articles | ✅ | ✅ |
| Moderate rooms | ✅ | ✅ |
| Approve booking requests | ✅ | ✅ |
| Manage feature flags | ❌ | ✅ |
| Grant/revoke Diamond | ❌ | ✅ |
| Trigger bot runs | ❌ | ✅ |
| Change user roles | ❌ | ✅ |
| Create promo codes | ✅ | ✅ |
| Revoke promo codes | ❌ | ✅ |
| Manage sponsors | ❌ | ✅ |

---

## Onboarding State

| State | Description |
|-------|-------------|
| `NO_ROLE_SELECTED` | User registered but hasn't chosen a role path |
| `INCOMPLETE` | Role selected but profile/agreements not finished |
| `COMPLETE` | Fully onboarded — all features unlocked for their role |

Users with `INCOMPLETE` state are redirected to `/onboarding` on protected routes.

---

## Artist Points Tier System

| Tier | Points Required | Visual |
|------|----------------|--------|
| Bronze | 0 | Bronze badge |
| Silver | 5,000 | Silver badge |
| Gold | 25,000 | Gold badge |
| Platinum | 100,000 | Platinum badge |
| Diamond | 500,000 | Diamond badge (animated) |
| Permanent Diamond | Admin-granted | Gold + Diamond badge, permanent |
