# PACK9_STYLE_BINDINGS.md
## Binding Every Pack 9 System to the Mandatory HUD/Magazine Design Language

---

## DESIGN LAW (REPEAT — MANDATORY)

All Pack 9 UI must inherit from the design DNA in the repo and PDF:
- Neon retro-futuristic magazine HUD
- Bold title-first hierarchy
- Carded modular surfaces
- Electric orange / cyan / magenta / deep-indigo
- Stage-room-dashboard visual framing
- Cinematic but readable motion
- Rounded glowing borders, inset panels
- Same loading/empty/error language throughout

"Or better" means: cleaner, more polished, more responsive.
NOT: flat modern, different color system, different card system.

---

## PACK 9 STYLE BINDINGS — SURFACE BY SURFACE

---

### ECONOMY SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| EarningsDashboard | Dashboard shell (control-room variant) | Subtle number count-up | Medium | Single column |
| PointsBalance | Widget shell | Number pulse on change | Compact | Show in header |
| TierProgressBar | Progress shell | Animated fill | Thin strip | Full width |
| Subscription page | Card shell | Page enter from right | Medium | Scrolling cards |
| Payout center | Dashboard shell | Row reveal | Medium | Collapsed rows |

**Color rule**: Earnings panels use gold accent tones.
Points use tier color (green/bronze/gold/diamond glow).

---

### SOCIAL & DISCOVERY SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| FollowButton | Action button shell | Press pulse | Compact | Full width on profile |
| DiscoveryFeed | Magazine rail shell | Card drift-in on scroll | Medium-dense | Vertical scroll |
| SearchBar | HUD input shell | Expand on focus | Compact | Sticky top on mobile |
| SearchResults | Card grid shell | Stagger reveal | Medium | 1-col mobile |
| FanClubCard | Card shell | Hover lift | Medium | Full width |
| WatchPartyCard | Event card shell | Pulse on "live" | Medium | Full width |

**Color rule**: Discovery surfaces use the discovery-first green accent (Free tier green) to signal "new" energy.

---

### NOTIFICATION SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| NotificationBell | HUD icon | Badge bounce on new | Icon only | Same |
| NotificationFeed | Dropdown/panel shell | Slide from right | Compact list | Full-screen drawer |
| JuliusNotification | Julius overlay | Julius enters, speaks, retreats | Minimal footprint | Same scale |
| EmergencyBanner | Full-width banner | No animation — immediate | Full width | Full width |

**Color rule**: Notification types color-coded. Emergency = red. Platform announcement = platform orange. Event = cyan.

---

### MODERATION SURFACES (ADMIN ONLY)

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| ModerationQueue | Admin control-room shell | Row highlight on new | Dense list | Hidden on mobile (admin desktop tool) |
| ReportButton | Minimal icon button | No animation | Ghost | Same |
| FraudReviewPanel | Dashboard shell | Rows load progressively | Medium | N/A (admin desktop) |

**Color rule**: Admin/moderation surfaces use cool gray + orange alert tone. Same HUD family, cooler energy.

---

### ARTIST TOOLS SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| ArtistDashboard | Dashboard shell (artist variant) | Tab slide | Medium | Bottom tabs |
| AnalyticsHub | Chart/stats shell | Count-up numbers, line draw | Medium | Scrollable charts |
| ScheduleBuilder | Calendar/card shell | Card drop in | Medium | Stack view |
| ContentCalendar | Grid/card shell | Row reveal | Dense | Vertical list |
| ClipCenter | Media grid shell | Thumbnail reveal | Dense grid | 2-col grid |
| ClipCard | Media card shell | Hover play preview | Compact | Full width |

**Color rule**: Artist tools use gold accent tones — this is the artist's "stage" so it feels premium from the first second.

---

### ONBOARDING SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| OnboardingStep | Card shell (centered) | Cross-fade between steps | Spacious | Full screen |
| GenreSelector | Tag grid shell | Tag pop on select | Medium grid | Scroll wrap |
| ProgressIndicator | Step bar | Fill on complete | Thin strip | Top of screen |

**Color rule**: Onboarding uses the tier green (welcoming, energizing) for progress elements. "You're just beginning" energy.

---

### SPONSOR SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| SponsorSlot | Side panel shell | Crossfade between campaigns | Non-intrusive | Hidden on very small |
| SponsorPortal | Admin dashboard shell | Same as admin | Medium | Desktop only |

**Color rule**: Sponsor surfaces use neutral/dark, never platform orange/cyan. Sponsor must NOT visually compete with artist content.

---

### INTEGRITY/EMERGENCY SURFACES

| Component | Inherited Shell | Motion | Density | Mobile |
|---|---|---|---|---|
| EmergencyBanner | Full-width alert shell | No delay — immediate | Full width forced | Full width |
| WaitlistCard | Status card shell | Position count-down | Compact | Full width |
| LawBubble | Floating widget shell | Subtle pulse | Small footprint | Collapsed |

**Color rule**: Emergency = red. Waitlist = neutral. Law Bubble = deep indigo / professional.

---

*Pack 9 Style Bindings v1.0 — BerntoutGlobal XXL*

---
---
---

# COPILOT_EXECUTION_BRIEF_PACK9.md
## Direct Instructions to Copilot for Wiring Pack 9

---

## READ THIS FIRST

You are NOT designing Pack 9 from scratch.
Claude has designed it. Your job is to wire it into the repo.

The spec exists in:
- `tmi-pack9/economy/ECONOMY_ENGINE.md`
- `tmi-pack9/social-discovery/SOCIAL_DISCOVERY_ENGINE.md`
- `tmi-pack9/moderation/NOTIFICATION_MODERATION_ANTIFRAUD.md`
- `tmi-pack9/artist-tools/ARTIST_TOOLS_CALENDAR_SEASON_CLIPS.md`
- `tmi-pack9/onboarding/ONBOARDING_MOBILE_ACCESSIBILITY_SEO.md`
- `tmi-pack9/platform-integrity/DANIKA_SPONSOR_EMERGENCY_INTEGRITY.md`

The wiring map exists in:
- `tmi-pack9-wiring/FILE_PLACEMENT_MAP_PACK9.md`
- `tmi-pack9-wiring/PACK9_CONTRACTS_BLUEPRINT.md`
- `tmi-pack9-wiring/PACK9_API_PROOF_FALLBACKS.md`
- `tmi-pack9-wiring/PACK9_STYLE_BINDINGS.md`

---

## WHAT NOT TO DO

- Do NOT redesign the system
- Do NOT invent new APIs not in PACK9_API_ROUTE_MATRIX
- Do NOT create new visual styles — follow PACK9_STYLE_BINDINGS.md
- Do NOT move files to different folders than FILE_PLACEMENT_MAP_PACK9 specifies
- Do NOT touch rooms, shows, cast, or magazine without explicit instruction
- Do NOT merge economy with social — keep modules separate
- Do NOT create more than 1 blocker at a time
- Do NOT skip proof gates

---

## EXECUTION ORDER (DO NOT SKIP STEPS)

```
STEP 0 — ONLY START IF BUILD IS GREEN
  → apps/web build must pass locally
  → Cloudflare must be green
  → /, /register, /login all return 200

STEP 1 — CREATE ALL CONTRACTS (safe, no runtime risk)
  → packages/contracts/src/economy.ts
  → packages/contracts/src/social.ts
  → packages/contracts/src/notifications.ts
  → packages/contracts/src/moderation.ts
  → packages/contracts/src/artist-tools.ts
  → packages/contracts/src/onboarding.ts
  → packages/contracts/src/sponsor.ts
  → packages/contracts/src/integrity.ts
  → Run: pnpm tsc --noEmit
  → Proof: zero TypeScript errors

STEP 2 — WIRE ONBOARDING
  → apps/api/src/services/onboarding.service.ts
  → apps/web/src/app/onboarding/artist/page.tsx
  → apps/web/src/app/onboarding/fan/page.tsx
  → Wire post-auth routing to onboarding if incomplete
  → Proof: new account → 8 steps → dashboard

STEP 3 — WIRE POINTS ENGINE
  → apps/api/src/services/points.service.ts
  → apps/web/src/components/tmi/shared/PointsBalance.tsx
  → apps/web/src/components/tmi/shared/TierProgressBar.tsx
  → Proof: watch 5 min → balance updates → room tier correct

STEP 4 — WIRE FOLLOW SYSTEM
  → apps/api/src/services/follow.service.ts
  → apps/web/src/components/tmi/shared/FollowButton.tsx
  → Proof: follow persists, follower count correct

STEP 5 — WIRE NOTIFICATIONS
  → apps/api/src/services/notification.service.ts
  → apps/web/src/components/tmi/shared/NotificationBell.tsx
  → apps/web/src/components/tmi/julius/JuliusNotification.tsx
  → Proof: artist live → follower notified

STEP 6 — WIRE SUBSCRIPTION BILLING
  → Add Stripe SDK
  → apps/api/src/services/subscription.service.ts
  → Proof: Stripe payment → tier updates

STEP 7 — WIRE PAYOUTS
  → apps/api/src/services/payout.service.ts
  → apps/web/src/components/tmi/artist/EarningsDashboard.tsx
  → Proof: tip → ledger → payout record

STEP 8 — WIRE SEARCH + DISCOVERY
  → apps/api/src/services/search.service.ts
  → apps/api/src/services/discovery.service.ts
  → Proof: search returns results, discovery order correct

STEP 9 — WIRE MODERATION
  → apps/api/src/services/moderation.service.ts
  → apps/api/src/services/fraud.service.ts
  → Proof: blocked word muted, report in queue

STEP 10 — WIRE ARTIST TOOLS
  → apps/api/src/services/schedule.service.ts
  → apps/web/src/components/tmi/artist/ArtistDashboard.tsx
  → apps/web/src/components/tmi/artist/AnalyticsHub.tsx
  → Proof: dashboard loads, schedule creates event

STEP 11 — WIRE SPONSORS + SEASON (LAST)
  → apps/api/src/services/sponsor.service.ts
  → apps/api/src/services/season.service.ts
  → Proof: sponsor slot visible, season round correct
```

---

## FOR EVERY STEP, REPORT

After each step:
```
STATUS: [passed / failed]
FILES CHANGED: [list]
ROOT CAUSE (if failed): [what was wrong]
FIX APPLIED: [what you changed]
FALLBACK USED: [yes/no — which one]
PROOF COLLECTED: [path to screenshot/log]
NEXT STEP: [what comes next]
```

---

## STYLE RULES (NON-NEGOTIABLE)

- Every UI component follows PACK9_STYLE_BINDINGS.md
- Every component uses HUD shell variants already in repo
- Every component passes mobile-safe layout
- Every component has loading + empty + error state
- No new color systems, no flat-modern redesigns

---

## CURRENT ACTIVE BLOCKER

```
BEFORE TOUCHING PACK 9:
Cloudflare musicians-index-api → needs build green
Cloudflare musicians-index-web → needs build green
GitHub CI: ✅ GREEN

Paste Cloudflare error log (first 30–50 lines).
That is the ONLY thing blocking deployment.
```

---

## ROLE ENFORCEMENT (NEVER VIOLATE)

- Big Ace = full control. Only one who can create promo codes, approve sponsors, send emergency broadcasts, action mod queue.
- Marcel Dickens = analytics + suggestions + safe requests only. Zero execution.
- Jay Paul Sanchez = view + suggestions only.

---

*Copilot Execution Brief Pack 9 v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
