# TMI PACK 11 — HOMEPAGE SYSTEM + PLATFORM SIMULATION
## The Final Visual and Experience Layer

---

## SLOGAN: "This is your stage, be original."

---

## WHY THIS PACK EXISTS

The three homepage images you uploaded are now locked specs.
Everything Gemini suggested (face scan, broadcasters, canvas cards, bobblehead physics, 
daily spin, loot drops, VHS effects, broadcaster voices, 20-issue roadmap, 
crown rotation, undiscovered first sorting) is now documented correctly.

Pack 11 makes the platform feel like a LIVING WORLD, not a website.

---

## WHAT'S IN THIS PACK

### `homepage-system/HOMEPAGE_SYSTEM_COMPLETE.md`
**The three home pages — fully locked from your uploaded images:**

**Homepage 1 (Magazine Cover — Tmi_Homepage_3.png)**
- Exact layout: #1 Crown Winner at center, #2–#10 orbiting
- Cover text: "Who took the crown this week?" + "Weekly Cyphers!"
- 80s geometric background: purple + teal + gold shapes
- #1 gets 6-second motion clip; others get 3-second micro-loops
- Corner peel navigation
- Comic-style insert panel
- Masthead: "The Musician's Index"

**Homepage 2 (Live World — Tmi_Homepage_2.png)**
- Live World Activity Belt: Main Preview Lobby + Lobby Wall (8-grid) + Join Random Room
- Discovery Belt: World Premieres countdown + Event Calendar
- Undiscovered Boost card + Cypher Arena Gateway
- Stream & Win score strip
- Full layout match to uploaded mockup
- **LOBBY WALL SORT RULE: Least viewers first (0 viewers = position 1)**

**Homepage 3 (Editorial — Tmi_Homepage_1.png)**
- Editorial Belt: Article Feature + Music News ticker + Interviews + Studio Recaps
- Discovery Belt: Genre Cluster hexagons (Hip Hop, Pop, Rock, R&B, Jazz, Electronic) + Top 10 Charts + Weekly Playlists + A-Z Directory
- Platform Belt: The Store + Booking Portal + My Achievements (850 pts) + Sponsor Spotlight
- Full layout match to uploaded mockup

---

### `crown-system/CROWN_COMIC_MOTION_SYSTEMS.md`
**Three documents:**

**Crown System Complete:**
- Weekly crown formula: (Streams × 0.3) + (Points × 0.25) + (Cypher Wins × 0.2) + (Fan Votes × 0.15) + (Watch Time × 0.1)
- **8-week rotation rule**: No artist holds #1 more than 8 consecutive weeks → forced rotation
- **4-week cooldown** before reclaiming #1
- Crown Bot runs every Sunday midnight: calculates, rotates, updates homepage, sends notifications
- Yearly awards: Bronze (1–2 weeks), Silver (3–4), Gold (5–7), Platinum (8+), Artist of the Year (most weeks total)
- Hall of Fame: All-time champions, season winners, genre champions, breakthrough artists, pioneer legends
- Crown transfer animation: outgoing fades, crown floats to new #1, confetti burst

**Comic Insert System:**
- Small animated panel on homepage 1 corner
- Types: funny moments, memes, cypher recaps, quotes, fan poll results, rivalry teasers, upcoming issue teaser
- Comic Insert Bot auto-generates suggestions, Big Ace approves

**Homepage Motion Rules:**
- Motion priority: Main Preview Lobby > Crown portrait > Premiere countdown > Sponsor
- Page transition options: corner peel, bottom strip, mobile swipe, keyboard arrows
- Reduced motion mode: instant fades, static posters, no audio

---

### `avatar-system/AVATAR_SYSTEM_COMPLETE.md`
**Three documents:**

**Face Scan Engine:**
- MediaPipe Face Landmarker: maps 68 facial landmarks, locally processed (no server upload)
- Face mapped to Bobblehead_Base.glb
- User avatar saved as UserAvatar_[id].glb
- Customization: hair styles/colors, accessories, outfits, cosmetic skins, badge frames, special items
- **Design Bot**: Suggests avatar styles based on genre preferences and artist tier

**Bobblehead Physics:**
- Jiggle physics: stiffness 200, damping 15, mass 1 — head springs back with overshoot
- Idle animation states: watching, hype, peak, sad/fail, win, cheer, boo (battles), stand, crown celebration
- **Expression sync (opt-in)**: Live camera tracks 52 facial blendshapes, avatar mirrors expressions
- Privacy: camera-off = idle animation only

**Audience Simulation Engine:**
- GPU instancing: 1–30 users = full 3D; 31–100 = simplified; 101–500 = key animations; 500–2000 = crowd waves; 2000+ = particle system
- Seat assignment: front rows = most engaged/highest tippers
- Hype meter → visual sync: 0% idle → 60% arms rising → 90% stadium wave → 100% full eruption + neon storm
- **Crowd wave system**: Ripples row by row at 0.3s delay each
- **Spatial audio**: Cheers pan left/right based on avatar seat position
- **Loot Drop**: Golden crate drops to random section → first to click wins cosmetic or points
- Guardian Bot: Toxic users → ghost mode or overflow venue

---

### `broadcaster-system/BROADCASTER_CANVAS_NAVIGATION_SIMULATION.md`
**Four documents:**

**Broadcaster System:**
- 6 broadcaster personalities: VEE_JAY_80, THE_SPECIALIST, INDEX_PRIME, THE_ANCHOR, HYPER_JAY, SMOOTH_DOC
- Show assignments: Deal or Feud → HYPER_JAY; Monthly Idol → THE_ANCHOR; Cyphers → THE_SPECIALIST; World Concert → VEE_JAY_80
- Script engine: Real-time commentary generated from hype level, viewer count, top tipper, milestones
- Audio chain: TTS → radio compression filter → audio duck music by -20dB → foley static bed
- Grand Opening script: Full written script for platform launch

**Canvas Engine:**
- Card types: Artist, Video, Audio, Leaderboard, Sponsor, Countdown, News, Genre, Room, Stats, Crown, Comic, Stream & Win
- Card states: Idle (float) → Hover (scale 1.05, rotate 2°) → Drag (z-top, drop shadow) → Snap (spring) → Click (flash, open)
- Canvas backgrounds per page (geometric, dark neon, magazine desk, control room, venue shell)
- Card persistence: X,Y coordinates saved to DB per user → stays where moved

**Magazine Navigation System:**
- Corner peel / bottom strip / mobile swipe / keyboard navigation
- Read progress persistence: saves current homepage, article, genre, issue for logged-in users
- "Continue Reading" card on dashboard
- Allowed jumps: Live Lobby, Games, Profile, Dashboard, Store
- Magazine flow only: Artist discovery pages, deep articles, interviews, recaps

**Simulation Engine:**
- VHS/CRT overlay: scanlines (0.03 intensity), color bleeding (0.002), subtle flicker, tracking glitch on camera cuts
- Foley library: page flip, card snap, hover tone, neon hum, crown transfer, tip, loot drop, upgrade, confetti, crowd murmur
- Haptic bridge: card snap (10ms), tier upgrade (200ms), loot drop (100ms), bass sync
- Global HUD status bar: coordinates, signal, uptime, live stream count
- CRT warm-up: first load → black → dot → expands → platform fades in (skippable after first visit)
- Standby mode: "Please Stand By" 80s test pattern when no one is live

---

### `issue-system/ISSUE_STREAMWIN_SPIN_DISCOVERY_BOTS.md`
**Five documents:**

**Issue Archive System:**
- Issue JSON structure: id, number, week, theme, crown winner, articles, chart, playlist, cypher recap, premieres
- Archivist Bot runs weekly: compiles, archives, updates past-issues library, logs attendance
- **20-Issue Roadmap**: Grand Opening → Biometric Rising → Underground Fire → Genre Wars → Premiere Season → ... → Neural Index

**Stream & Win Pipeline:**
- +10 points per 5 minutes of streaming, daily cap 60 points
- Playlist types: Issue (1.2×), Genre (1.0×), Artist (1.0×), Crown Winner (1.5×), Discovery (1.3×), Sponsored (1.0×)
- Anti-fraud: 30-second minimum, active tab required, 3 plays/day per track, no background tab counting
- Profile library: saved playlists, artist-pinned playlists, privacy controls

**Daily Spin System:**
- Once per 24 hours, 7-day streak = bonus spin + larger rewards
- Rewards: 50 pts (30%), 150 pts (25%), 500 pts (15%), common cosmetic (15%), rare cosmetic (10%), upgrade token (3%), Golden Crate key (2%)

**Artist Discovery Algorithm:**
- Discovery-first: higher rank# = shown first
- Formula: reverse_rank + freshness_score + session_engagement + genre_diversity + new_account_bonus
- Cannot permanently bury any artist, cannot suppress by genre, cannot show same artist twice in 10-card row

**Bot Ecosystem Complete:**
- 25 bots documented with file names and purpose
- Crown Bot, Archivist Bot, Discovery Bot, Broadcaster Bot, Director Bot, Hype Bot, Loot Bot, Oracle Bot, Design Bot, Guardian Bot, QC Bot, Janitor Bot, Metronome Bot, Accountant Bot, Mechanic Bot, Voice Clone Bot, Interview Bot, News Bot, Clip Bot, Spin Bot, Foley Bot, Empath Bot, Vibe Bot, Rewind Bot, Location Bot
- Permission table: Big Ace full control, Marcel status/logs, Jay Paul status only, Artists limited triggers

---

## ALL PACKS — COMPLETE REFERENCE

| Pack | Contents | Download |
|---|---|---|
| Pack 1 | 10 base components | tmi-components-complete.zip |
| Pack 2 | 14 components + architecture | tmi-complete-v2.zip |
| Pack 3 | Magazine navigation | tmi-nav-v3.zip |
| Pack 4 | Cast system | tmi-cast-system.zip |
| Pack 5 | Cast Pack 2 | tmi-cast-pack2.zip |
| Pack 6 | Live events | tmi-live-events.zip |
| Pack 7 | Room system (15 rooms) | tmi-room-system.zip |
| Pack 8 | System integrity (final 15%) | tmi-final-15.zip |
| Pack 9 | Product layer | tmi-pack9-product-layer.zip |
| Pack 9-W | Wiring handoff | tmi-pack9-wiring.zip |
| Pack 10 | Operations + release control | tmi-pack10-operations.zip |
| Pack 11 | Homepage + simulation (this) | tmi-pack11-homepage-simulation.zip |

---

## WHAT COPILOT DOES WITH THIS

From these three homepage images + Pack 11 specs, Copilot creates:

### Web Components (in order)
```
apps/web/src/components/tmi/homepage/
  HomepageCover.tsx          ← Page 1 (crown collage)
  HomepageLiveWorld.tsx      ← Page 2 (live lobby hub)
  HomepageEditorial.tsx      ← Page 3 (magazine content)
  HomepageSharedHeader.tsx   ← Header (all 3 pages)
  HomepagePageStrip.tsx      ← Bottom nav + page numbers
  HomepageCornerPeel.tsx     ← Page peel interaction

apps/web/src/components/tmi/crown/
  CrownCard.tsx              ← #1 center portrait
  ArtistRingCard.tsx         ← #2–#10 surrounding cards
  ComicInsert.tsx            ← Weekly comic corner panel
  CrownTransferAnimation.tsx ← Weekly crown handover

apps/web/src/components/tmi/canvas/
  CanvasCard.tsx             ← Base movable card
  CardArtist.tsx             ← Artist card variant
  CardVideo.tsx              ← Video card variant
  CardCountdown.tsx          ← Countdown timer card

apps/web/src/components/tmi/avatar/
  AvatarBobblehead.tsx       ← 3D avatar component
  FaceScanCapture.tsx        ← Face scan UI
  AudienceStadium.tsx        ← Venue crowd rendering

apps/web/src/components/tmi/broadcast/
  BroadcasterVoice.tsx       ← Audio broadcaster overlay
  BroadcasterHUD.tsx         ← Host's private HUD
```

---

## ACTIVE BLOCKER (STILL WAITING)

```
Before any of Pack 11 is wired:
→ Cloudflare musicians-index-api must be GREEN
→ Cloudflare musicians-index-web must be GREEN
→ GitHub CI: ✅ GREEN (commit 3a81795)

Paste the Cloudflare error log.
That unlocks everything.
```

---

## ROLE LOCK

- **Big Ace**: Full control. Approves comic inserts. Controls bots. Triggers Grand Opening. Signs off on everything.
- **Marcel Dickens**: Analytics + suggestions + safe requests only.
- **Jay Paul Sanchez**: View + suggestions only.

---

*Pack 11 — Homepage System + Platform Simulation v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
