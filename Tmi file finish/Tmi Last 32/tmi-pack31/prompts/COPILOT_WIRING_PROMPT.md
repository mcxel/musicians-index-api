# COPILOT_WIRING_PROMPT.md
## Paste to Copilot After Blackbox Scaffolds — Wire All Chains
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT — TMI PLATFORM WIRING

Blackbox has scaffolded the full platform structure.
Your job: wire chains one at a time. Smallest patch only. No broad refactors.

Read these docs first:
  docs/system/PACK29_SAFE_WIRING_ORDER.md
  docs/system/PACK29_REPO_FILE_PLACEMENT_MAP.md
  docs/pack28/design-system/TMI_UI_DESIGN_SYSTEM.md

VISUAL RULE (critical):
  Background: #0D0520
  Accent: #00E5FF (cyan), #FFB800 (gold), #FF2D78 (pink)
  Fonts: Bebas Neue (display), Oswald (headings), Inter (body)
  Never: white backgrounds, generic SaaS look, Inter on white

CHAIN 1 — Auth → Dashboard (wire first)
  1. /login → validate credentials → session → redirect /dashboard/[role]
  2. /register → create user → /onboarding/[role]
  3. /onboarding/artist → save profile stub → /dashboard/artist
  4. /onboarding/fan → save profile stub → /dashboard/fan
  5. /dashboard/artist → loads correctly with real session user
  
  Proof: signup → onboarding → dashboard (all redirect correctly)

CHAIN 2 — Profile System
  1. /dashboard/artist → "Set Up Profile" button → /profile/create/artist
  2. /profile/create/artist form → POST /api/profiles → redirect /artists/[slug]
  3. /artists/[slug] → loads profile from DB
  4. Artist station link on article page: /articles/[slug] → links to /stations/[artistSlug]
  5. Nav: artist dashboard → shows link to "My Station"

  Proof: create profile → public profile loads with station link

CHAIN 3 — Station → Article Link (critical UX rule)
  Every artist article page must include:
    <Link href={`/stations/${artistSlug}`}>📻 VIEW STATION</Link>
    <Link href={`/profile/artist/${artistSlug}`}>👤 VIEW PROFILE</Link>

  Wire: GET /api/editorial/[slug] returns article + author profile (for station link)
  
  Proof: open any article → station link visible → clicking it opens station page

CHAIN 4 — Sponsor Task → Earnings Panel → Coaching Notes
  1. Earnings panel on /dashboard/artist: GET /api/wallet + /api/stream-win/score
  2. Coaching notes: show COACHING_NOTES from src/config/coaching-rules.ts
  3. Filter coaching notes by condition (has_active_sponsor, etc.)
  4. /dashboard/artist/sponsor-tasks → GET /api/sponsor-tasks (own tasks)

  Proof: earnings panel shows real numbers; coaching note appears if sponsor exists

CHAIN 5 — Navigation (connect all the dots)
  1. Top nav: logo → /, search → /search, bell → /notifications, profile → /dashboard/[role]
  2. Artist dashboard sidebar: all links work (profile, station, earnings, live, etc.)
  3. Mobile bottom nav: LIVE, LOBBY, FIND, FEED, ME tabs all route correctly
  4. Stations: /stations/[slug] sub-nav tabs (HOME, SCHEDULE, LIVE, ARCHIVE, SPONSORS)

  Proof: click every nav item → correct page loads

CHAIN 6 — Lobby Wall (viewers_asc sort — CRITICAL)
  1. /lobby → loads rooms via GET /api/rooms?sort=viewers_asc
  2. Artists with 0 viewers ALWAYS appear at position 1
  3. Run: pnpm test:discovery → MUST PASS before any deploy

  Proof: pnpm test:discovery passes

WIRING RULES:
  - Smallest safe patch only
  - Wire one chain at a time
  - Typecheck after each chain: pnpm -C apps/web typecheck
  - NEVER touch: layout.tsx, middleware.ts, room providers (Slices 13-17)
  - If a file breaks: git checkout [file] and retry with smaller patch

BOT/SPONSOR RULES (from architecture):
  - Bots can auto-approve campaigns up to $99.99/week
  - Discounts over 10% → Big Ace approval queue
  - All exclusivity deals → Big Ace only
  - Kids cannot see adult sponsor content
  - Adult → kid messaging → 403 Forbidden (canSendMessage middleware)

AFTER EACH CHAIN — RUN:
  pnpm -C apps/web typecheck
  pnpm test:discovery (after lobby chain)
  curl http://localhost:4000/api/readyz

"This is your stage, be original." — BerntoutGlobal LLC
```
