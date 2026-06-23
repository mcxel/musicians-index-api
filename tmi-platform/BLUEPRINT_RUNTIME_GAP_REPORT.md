# TMI Platform — Blueprint vs Runtime Gap Report
Generated: 2026-06-14

## Legend
- MATCH: Runtime matches blueprint intent
- PARTIAL: Structure exists, data/behavior incomplete
- GAP: Blueprint spec not implemented

---

## Home 1 — Orbital / Cover Page

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| 3-column layout (170px / 1fr / 170px) | MATCH — installed this session | — |
| Neon blob underlay (4 blobs + SVG grid) | MATCH — installed this session | — |
| Horizontal chyron ticker (31 msgs) | MATCH — installed this session | — |
| Starburst genre transition (14 rays, 800ms) | MATCH — installed this session | — |
| LEFT panel: Free Promo / Sponsor Spotlight / Venue Booking | PARTIAL — rendered with placeholder data | No real sponsor/venue API data |
| RIGHT panel: Live Rankings / Live Now / Ad Slot | PARTIAL — rendered with placeholder counts | No real performer ranking API |
| Orbital nodes: 4:5 portrait cards with rank badge + flag | GAP — still polygon+emoji nodes | P7 not yet applied |
| Video monitors: 3 tiles with independent timers (9500/13200/17000ms) | GAP — single genre cycle, no 3 monitors | P6 not yet applied |
| Orbitron + Exo 2 fonts | GAP — not loaded on home pages (fan/theater loads them, home/1 does not) | P8 not yet applied |

---

## Home 1-2 — Billboard Live Wall

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| Canvas-based infinite scroll wall | MATCH | — |
| Trending artist API (`/api/homepage/trending-artists`) | PARTIAL — calls API, falls back to mock | API must return real data |
| 3D page-turn engine | MATCH | — |
| Genre filter tabs | MATCH | — |

---

## Fan Theater

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| AudienceScene canvas (3D crowd) | MATCH — `<AudienceScene view="fan" venue={0} />` wired | — |
| Reaction emoji overlay | MATCH | — |
| Orbitron/Exo 2 fonts | MATCH — injected via `<style>` in this page | — |
| Playlist Engine | PARTIAL — UI complete, no real `<audio>` element | Fake progress bar; music not actually playing |
| Chat form | PARTIAL — UI exists, submit clears input only | No message API call |
| Real viewer count | PARTIAL — `usePresenceEngine` hook wired | Hook may return mock data depending on env |

---

## Arena / Battles / Cypher

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| BATTLE·CYPHER·CHALLENGE triangle layout | PARTIAL — separate pages exist | No single triangle landing |
| Orbitron headers (BATTLE=pink, CYPHER=cyan, CHALLENGE=gold) | PARTIAL — colors present, font may be system fallback | Orbitron not globally loaded |
| Battle vote logic | MATCH — `BattleVoteClosureEngine` functional | Demo participants only |
| Cypher mic rotation | PARTIAL — timer exists, no real queue | Hardcoded 4 participants |
| AudienceScene in Cypher stage | MATCH — `cypher/stage/page.tsx` renders AudienceScene | — |
| MaskedVideoTile in battles | MATCH — import fixed (named export) | Real stream only if passed |

---

## Avatar / Profile System

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| Fan profile: avatar-based social environment | PARTIAL — ProfileLobbyRuntime renders stats/bio | No 3D avatar; emoji only |
| Performer profile: stage/portfolio view | PARTIAL — ProfileLobbyRuntime renders | No 3D avatar; GLB models not loaded |
| HeroRigController 3D rig | GAP — P12 placeholder in code; emoji fallback | `renderHero()` → GLB swap not done |
| AudienceScene crowd in theater | MATCH — canvas-based 3D crowd renders | — |

---

## Sponsor Rails

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| SponsorRail on all home pages | GAP — component exists, never populated | No sponsors array passed from any home page |
| SponsorReel rotation | GAP — component built, not mounted on Home 1-5 | — |

---

## Memory Wall

| Blueprint Spec | Runtime Status | Gap |
|---|---|---|
| Capture live moments | PARTIAL — `captureLiveMoment()` generates artifacts | Not persisted to DB; TODO in engine code |
| Display per-user memory wall | PARTIAL — page exists, no real data fetch | MemoryWallCanvas renders but loads no real memories |

---

## Summary Priority

| Priority | Gap | Effort |
|---|---|---|
| P6 | 3 video monitors with independent timers on Home 1 | Low |
| P7 | Orbital nodes → portrait cards | Medium |
| P8 | Load Orbitron+Exo 2 globally (layout.tsx) | Low |
| P-Sponsor | Wire SponsorRail to home pages with real/seed data | Low |
| P-Audio | Replace fake playlist progress with real `<audio>` in fan/theater | Medium |
| P-Chat | Wire fan/theater chat form to `/api/messages` | Medium |
| P-Memory | Connect MemoryWallEngine to Prisma | High |
| P-Avatar | Swap emoji to GLB rig (P12 unlock) | High |
