# PLATFORM_SYSTEM_MAP.md
# The Musician's Index — BerntoutGlobal Platform System Map
# Authority: Repo behavior + PDF magazine pages (combined source of truth)
# Last updated: 2026-03-23

## Overview

This document is the canonical map of every system module on the TMI / BerntoutGlobal platform.
Every system listed here must reach minimum build before controlled launch. Full/perfect builds follow in later iterations.

---

## System Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ EXISTS | Route, model, and API are wired and passing |
| 🔶 PARTIAL | Some layers exist but incomplete |
| ❌ MISSING | Not yet in repo |
| 🔒 LOCKED | Working — do not touch without proof gate |

---

## Core Platform Modules

### 1. Homepage Belt System
- **Status**: 🔶 PARTIAL
- **Web route**: `/` (`apps/web/src/app/page.tsx`)
- **Layout**: Vertical belt modules (scrollable editorial sections)
- **Belts defined**: Promotional Hub, Live Now, Featured Artists, Charts, Games teaser, Issue Release
- **Missing**: Belt 3 (Charts/Discovery), animated entry, Stream & Win overlay persist
- **API needed**: `/api/belts` content endpoint (config-driven)
- **PDF authority**: Page 1 (Promotional Hub), Page 2 (Live/Artist belt)

### 2. Magazine / Articles System
- **Status**: 🔶 PARTIAL
- **Web routes**: `/articles`, `/articles/[slug]`
- **API module**: `editorial`
- **Layout**: Horizontal page-flip (spread flow, left/right navigation)
- **Missing**: Horizontal flip engine, spread layout, article-to-tier theme propagation, Archive section
- **DB model**: `Article` (exists, needs spread/issue fields)
- **PDF authority**: Pages 4–8 (Magazine spreads)

### 3. Promotional Hub
- **Status**: 🔶 PARTIAL
- **Web route**: `/hub`
- **Layout**: Tile grid with live/promo banners
- **Missing**: Sponsor tile injection, live event badges, promo countdown
- **PDF authority**: Page 1

### 4. Stream & Win System
- **Status**: 🔶 PARTIAL
- **Web route**: `/streamwin`
- **Engine**: `StreamWinEngine` (needs wiring to audio persistence layer)
- **Missing**: Persistent audio across routes, queue, save-to-profile, points hooks
- **API module needed**: `stream-win`
- **PDF authority**: Pages 12–13

### 5. Artist Profiles
- **Status**: 🔶 PARTIAL
- **Web routes**: `/artists`, `/artists/[slug]`
- **DB model**: `Artist` (exists)
- **Missing**: Diamond tier theming, PDF-style layout, tier propagation to articles, tier visual rules
- **Special**: Marcel and B.J.M. = permanent Diamond status (must be seeded)
- **PDF authority**: Pages 6–7

### 6. Live Rooms / Audience Rooms
- **Status**: ❌ MISSING
- **Web route needed**: `/live`, `/live/[roomId]`
- **API module needed**: `live-rooms`
- **Engine needed**: `LiveRoomEngine`
- **Features**: Real-time presence, audience chat, live artist stream embed
- **PDF authority**: Page 9 (Audience Room), Page 11 (Live World)

### 7. Cypher Arena / Cypher Stage
- **Status**: ❌ MISSING
- **Web routes needed**: `/cypher`, `/cypher/[sessionId]`
- **API module needed**: `cypher`
- **Engine needed**: `CypherEngine`
- **Features**: Turn-based performance queue, judge mode, live voting, digital stage
- **PDF authority**: Pages 18–20

### 8. Booking System
- **Status**: 🔶 PARTIAL (ticketing exists, booking dashboard does not)
- **Web routes**: `/tickets` (exists), `/admin/booking` (missing)
- **API module**: `tickets` (exists), `booking` (missing)
- **DB models**: `Event`, `Ticket`, `TicketType`, `Order` (all exist)
- **Missing**: Booking dashboard, artist booking map, venue selection, admin booking command
- **PDF authority**: Pages 4–5

### 9. Billboard / Leaderboards
- **Status**: 🔶 PARTIAL
- **Web route**: `/billboard` (exists)
- **Missing**: Dynamic leaderboard data, weekly reset logic, Weekly Crown integration
- **API module needed**: `leaderboard`
- **PDF authority**: Page 10

### 10. Game Night / Music Games
- **Status**: 🔶 PARTIAL
- **Web route**: `/games` (exists)
- **Missing**: Deal or Feud game, Music Trivia game, bet/points integration, host controls
- **API module needed**: `games` (full engine)
- **Engine needed**: `GameEngine`
- **PDF authority**: Pages 10–16

### 11. Watch Party / Venues
- **Status**: ❌ MISSING
- **Web route needed**: `/watch-party`, `/watch-party/[venueId]`
- **API module needed**: `watch-party`
- **Features**: Shared video playback, synced reactions, venue-themed rooms
- **PDF authority**: Page 17

### 12. Admin Command Center
- **Status**: 🔶 PARTIAL
- **Web route**: `/admin` (exists, partial)
- **API module**: exists (auth-gated)
- **Missing**: Global Admin Command panel (PDF page 3), system health dashboard, module overrides, bot controls
- **PDF authority**: Page 3

### 13. Store / Merch
- **Status**: ❌ MISSING
- **Web route needed**: `/store`
- **Features**: Merch listings, artist merch, points redemption store
- **DB model needed**: `MerchItem`, `MerchOrder`

### 14. Sponsor / Ads System
- **Status**: 🔶 PARTIAL
- **Web route**: `/sponsors` (exists, stub)
- **Missing**: Ad injection engine, sponsor tile system, sponsor dashboard
- **API module needed**: `sponsors` (full)
- **Engine needed**: `SponsorAdEngine`
- **PDF authority**: Page 2 (sponsor tiles)

### 15. Weekly Crown / Competitions
- **Status**: 🔶 PARTIAL
- **Web route**: `/contest` (exists), `/contests` (exists)
- **Missing**: Weekly Crown leaderboard reset, crown badge propagation, prize delivery
- **DB model**: `Contest` (exists, needs crown type)

### 16. Playlists / Charts / Discovery
- **Status**: ❌ MISSING
- **Web route needed**: `/discovery`, `/playlists`, `/charts`
- **API module needed**: `playlist`
- **Engine needed**: `PlaylistEngine`
- **PDF authority**: Page 11

### 17. Event Calendar
- **Status**: 🔶 PARTIAL
- **Web route needed**: `/calendar`
- **DB model**: `Event` (exists)
- **Missing**: Calendar UI, date filter, event type filters

### 18. Achievements / Points System
- **Status**: 🔶 PARTIAL
- **DB**: `LedgerEntry` (exists, basic)
- **Missing**: Achievement definitions, badge system, points display, HUD integration
- **Engine needed**: `PointsRewardsEngine`
- **PDF authority**: Page 15

### 19. Random Rooms / Lobby
- **Status**: ❌ MISSING
- **Web route needed**: `/lobby`, `/rooms/random`
- **Features**: Randomized room matching, genre filters, presence indicator

### 20. Archive / Past Issues
- **Status**: ❌ MISSING
- **Web route needed**: `/archive`
- **Features**: Past magazine issues grid, issue-by-issue navigation
- **DB model needed**: `Issue` (magazine issue container)

---

## Summary Table

| Module | Route | API | DB | Engine | Status |
|--------|-------|-----|----|--------|--------|
| Homepage Belt | `/` | `/api/belts` | - | BeltEngine | 🔶 |
| Magazine | `/articles/[slug]` | editorial | Article | MagazineEngine | 🔶 |
| Promotional Hub | `/hub` | hub | - | - | 🔶 |
| Stream & Win | `/streamwin` | stream-win | LedgerEntry | StreamWinEngine | 🔶 |
| Artist Profiles | `/artists/[slug]` | users | Artist | - | 🔶 |
| Live Rooms | `/live/[id]` | live-rooms | - | LiveRoomEngine | ❌ |
| Cypher Arena | `/cypher/[id]` | cypher | - | CypherEngine | ❌ |
| Booking | `/tickets` | tickets+booking | Event/Ticket | BookingEngine | 🔶 |
| Billboard | `/billboard` | leaderboard | - | LeaderboardEngine | 🔶 |
| Games | `/games` | games | - | GameEngine | 🔶 |
| Watch Party | `/watch-party/[id]` | watch-party | - | WatchPartyEngine | ❌ |
| Admin Command | `/admin` | auth | - | AdminEngine | 🔶 |
| Store | `/store` | store | MerchItem | - | ❌ |
| Sponsor/Ads | `/sponsors` | sponsors | - | SponsorAdEngine | 🔶 |
| Weekly Crown | `/contest` | contest | Contest | - | 🔶 |
| Discovery | `/discovery` | playlist | - | PlaylistEngine | ❌ |
| Calendar | `/calendar` | tickets | Event | - | 🔶 |
| Achievements | `/hud` | users | LedgerEntry | PointsEngine | 🔶 |
| Random Rooms | `/lobby` | live | - | - | ❌ |
| Archive | `/archive` | editorial | Issue | - | ❌ |
