# LAYOUT TEMPLATE LIBRARY
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Standardize page-level composition so new routes follow approved visual and wiring structures.

Every new route must select one template before implementation.

---

## APPROVED TEMPLATES

### 1) Homepage Belt Layout
Use for `/`
- Hero/status strip
- Belt stack (live, magazine, artists, events, sponsor)
- Global CTA/footer rail
- HUD persistent layer

### 2) Magazine Spread Layout
Use for `/articles/[slug]`, issue/archive views
- Left/right spread panels
- Inline media slot
- Related story rail
- Author/artist card

### 3) Artist Profile Hub Layout
Use for `/artists/[slug]`
- Identity panel
- Media locker panel
- Booking panel
- Achievements/points panel
- Related article/live panels

### 4) Arena/Cypher Room Layout
Use for live performance rooms
- Main preview stage
- Stage roster
- Turn queue
- Audio mixer
- Reaction/chat rails
- Host controls

### 5) Mini Cypher Layout
Use for daily random/open cyphers
- Compact stage
- Join random/queue actions
- Producer beat cast area
- Audience reaction rail

### 6) Dashboard Control Layout
Use for admin/booking/sponsor ops
- Left nav panel
- Main control grid
- Metrics strip
- Logs/events panel

### 7) Leaderboard Layout
Use for billboard/ranking
- Top podium panel
- Ranking list panel
- Trend/period selector
- Proof/refresh stamp

---

## TEMPLATE ENFORCEMENT CHECKLIST

For each route:
- Template selected
- Required panel zones present
- Provider mounted
- API connected
- Loading/empty/error present
- HUD linkage declared
- Proof hook added

If any are missing, route remains PARTIAL.
