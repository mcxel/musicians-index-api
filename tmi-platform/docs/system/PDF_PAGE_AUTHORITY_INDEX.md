# PDF_PAGE_AUTHORITY_INDEX.md
# PDF Visual Authority Index
# These pages define real platform modules — not just artwork.
# Copilot must reference this index before any UI decision.

## How To Use This Document

Before building or modifying any UI surface:
1. Find the relevant page(s) below
2. Open the referenced PDF page
3. Check UI against the described layout
4. If your new UI does not match → mark it as drift → fix before committing

---

## Page Authority Map

### Page 1 — Promotional Hub (Homepage Belt 1)
- **System**: Promotional Hub, Homepage Belt
- **Layout**: 2–3 large promotional tiles with artist/event imagery
- **Key visual**: Neon-edge tiles, brand logo in corner, event name in display type
- **CTA**: Large button, sharp corners, neon fill
- **Background**: Near-black, subtle gradient
- **Anti-patterns to avoid**: White cards, rounded corners, generic hero layout

### Page 2 — Live / Artist Belt + Sponsor Tiles (Homepage Belts 2 & 6)
- **System**: Live Now Belt, Sponsor Rail
- **Layout**: Horizontal scroll cards (artist + live badge), sponsor tile row below
- **Key visual**: Pulsing live indicator, avatar over room banner, sponsor tile neon edge
- **Anti-patterns**: Generic event cards, no-live-indicator, plain sponsor banners

### Page 3 — Global Admin Command Center
- **System**: Admin Command Center
- **Layout**: Dense control panel layout — status tiles, module toggles, bot controls
- **Key visual**: Grid of status cards with color-coded state indicators (green/yellow/red)
- **Anti-patterns**: Generic admin table layout, no visual state indicators

### Page 4 — Artist Booking Dashboard
- **System**: Booking System — Artist side
- **Layout**: Calendar view + request list + earnings summary panel
- **Key visual**: Calendar with colored event pins, request queue with status badges
- **Anti-patterns**: Plain table, no calendar view, generic form layout

### Page 5 — Booking Map / Venue Map
- **System**: Booking System — Venue Map
- **Layout**: Map surface with venue pins, sidebar list of venues
- **Key visual**: Dark map with neon venue pins, sidebar shows venue cards
- **Anti-patterns**: Light map, no pin styling, list-only fallback without map attempt

### Pages 6–7 — Artist Profile
- **System**: Artist Profiles
- **Layout**: Artist banner top, profile info below, music links, articles grid
- **Key visual**: Diamond tier = gold gradient header, animated diamond badge
- **Tier propagation**: Tier color bleeds into article card headers for this artist
- **Anti-patterns**: Generic profile card, no tier visual, standard avatar layout

### Pages 8–9 — Magazine Specific Article / Audience Room
- **System**: Magazine Article layout, Live Audience Room
- **Layout (article)**: Full-bleed spread, left page display text, right page body + image
- **Layout (audience room)**: Room banner, audience row, performer card, reaction rail
- **Anti-patterns**: Blog-post layout for articles, chatroom layout for audience room

### Page 10 — Billboard / Leaderboard
- **System**: Billboard, Leaderboard
- **Layout**: Ranked list with rank number (large), artist name, score, tier badge
- **Key visual**: #1 highlighted in gold/neon, other ranks in descending size
- **Anti-patterns**: Plain table, no rank emphasis, no badge visual

### Pages 11–12 — Discovery / Charts / Stream & Win Overlay
- **System**: Discovery, Charts, Stream & Win
- **Layout**: Chart list with artwork, rank badge, play trigger; SW overlay docked bottom
- **Key visual**: Track artwork left, rank badge overlaid, Stream & Win mini-player bottom
- **Anti-patterns**: Text-only chart, no artwork, floating audio player that re-mounts

### Pages 13–14 — Stream & Win Full View
- **System**: Stream & Win full page
- **Layout**: Active track center, queue right, points counter top-right, prize pool below
- **Key visual**: Track wave animation, points counter increment animation
- **Anti-patterns**: Static points display, no queue visible, no prize pool info

### Page 15 — Achievements / Points Economy View
- **System**: Achievements, Points
- **Layout**: Achievement badge grid, points history timeline, redemption catalog
- **Key visual**: Badge icons (branded, not emoji), points bar/counter, tier progress bar
- **Anti-patterns**: Emoji badges, plain list, generic progress bar

### Page 16 — Game Night Lobby / Deal or Feud Layout
- **System**: Game Engine
- **Layout**: Game type tiles in lobby; in-game: question top, answer options below, timer bar
- **Key visual**: Neon timer bar, answer options with color-coded feedback on reveal
- **Anti-patterns**: Browser quiz look, generic modal, static point display

### Page 17 — Watch Party / Venues
- **System**: Watch Party, Venues
- **Layout**: Watch party room with shared video center, audience reaction rail below
- **Key visual**: Video frame with name tags, reaction emotes floating up from bottom
- **Anti-patterns**: Plain video embed, no reaction surface, no audience presence

### Page 18 — Cypher Stage
- **System**: Cypher Arena — Stage View
- **Layout**: Full-screen stage top, performer queue listed right, audience reactions bottom
- **Key visual**: Stage spotlight effect, performer name/round-number callout, reaction stream
- **Anti-patterns**: Small stage area, chat-only interface, no performer queue visible

### Page 19 — Cypher Round UI / Rules Panel
- **System**: Cypher — Round View
- **Layout**: Round number badge, timer bar, performer callout, judge scoring panel
- **Key visual**: Round timer counts down visibly, judge panel shows input fields
- **Anti-patterns**: Hidden timer, no judge UI, collapsed scoring

### Page 20 — Cypher Rooms Lobby
- **System**: Cypher Room List
- **Layout**: Card grid of available cypher rooms — genre tag, performer count, join button
- **Key visual**: Room card with live indicator, genre badge, compact performer avatars
- **Anti-patterns**: Plain list, no room preview, no live indicator

---

## Visual Drift Checklist (Quick Reference)

Before committing any UI slice, check each item against the relevant PDF page:

- [ ] Background is near-black (not white, not light grey)
- [ ] Card corners are sharp or slightly rounded (4–8px max, NOT 16px+ "card" look)
- [ ] Live indicators are pulsing neon (not static grey dot)
- [ ] Typography uses TMI display fonts for headers (not system sans-serif)
- [ ] Neon accent colors match brand (not generic blue/green/purple)
- [ ] Tier/Diamond theming propagates where applicable (not same style for all artists)
- [ ] No lorem ipsum, placeholder text, or generic icon names
- [ ] No Downloads/ or OS-path asset references
- [ ] Brand spellings correct (Berntout / BerntoutGlobal / Berntout Perductions)
- [ ] Empty state exists and matches the tone in `EMPTY_STATE_LIBRARY.md`
- [ ] Error state exists and does not show raw errors to users
