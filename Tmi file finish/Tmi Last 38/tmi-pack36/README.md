# TMI PACK 36 — VENUES + GAMES + SCORING + ITEM ECONOMY + PLATFORM REGISTRY
## Complete Game World, Venue System, and Living Economy
### BerntoutGlobal LLC / The Musician's Index

---

## WHAT THIS PACK ADDS (10 files)

| File | What It Does |
|---|---|
| `engines/venue-engine.ts` | Complete venue system — hosts, co-hosts, DJs, lighting presets (12), seating sections (12 types), DJ session with BPM/crossfade/EQ, all venue room types |
| `engines/game-engine.ts` | All 10 game definitions — Dirty Dozens, Deal or Feud 1000, Name That Tune, Lyric Fill, Beat Challenge, Music Trivia, Cypher Battle, Audience Vote, Spin & Win, Speed Round |
| `engines/scoring-engine.ts` | Universal scoring — 7 scoring modes, 6 tiebreak methods, participation points map, crown system, leaderboard with flame rules, fraud detection |
| `engines/item-economy.ts` | Living item economy — 6 rarity tiers, shop rotation, automatic item generation triggers, loot tables, inventory, avatar loadouts, economy balance rules |
| `registry/platform-registry.ts` | Central source of truth — world registry, room type registry, belt registry, game registry, reward types, all route constants, feature flag gate |
| `pages/games/page.tsx` | Games Hub — all 8 games displayed with join buttons, leaderboard links, cypher arena entry |
| `pages/dirty-dozens/page.tsx` | Dirty Dozens arena — live hype meter, battle entry, crowd voting, top battlers leaderboard |
| `pages/deal-or-feud/page.tsx` | Deal or Feud 1000 — how to play, start game, join open games |
| `pages/venues/page.tsx` | Venue World — all venue types, all venue rooms (8 rooms per venue), venue signup, booking, events, tickets |
| `pages/shop/page.tsx` | Item Shop — daily drops, rarity color system, category tabs, live point balance |

---

## VENUE SYSTEM — KEY DETAILS

**12 Seating Section Types with priceMultipliers:**
- general_admission (1.0×) → pit (2.0×) → vip (2.5×) → front_row (3.0×) → backstage (5.0×) → sponsor_box (10.0×)

**12 Lighting Presets:**
- `standard`, `neon_purple`, `concert_white`, `battle_red`, `victory_gold`, `cypher_cyan`
- `sponsor_spotlight`, `afterparty`, `dim_intimate`, `rainbow_party`, `strobe_hype`, `off_air`
- Each has: primaryColor, secondaryColor, intensity, strobeEnabled, followSpotEnabled, audioBeatSync (lights pulse with music BPM), sponsorLogoProjection

**11 VenueRole types:** owner, host, co-host, dj, headliner, opener, judge, moderator, security, sponsor-rep, vip-guest

**DJ Session:** BPM, volume, crossfadePosition, EQ (low/mid/high), audioBeatSyncActive (syncs stage lighting to BPM), setList, setHistory

**15 Room Types per venue:** main_stage, green_room, backstage, control_room, vip_lounge, sponsor_lounge, press_room, afterparty, waiting_room, rehearsal, dj_booth, merch_room, meet_and_greet, broadcast_booth, judge_room

---

## GAME ENGINE — DIRTY DOZENS RULES

- 2 players, 3 rounds × 120 seconds
- Audience voting determines winner
- Lighting: `battle_red`, Scene: `underground-cypher`
- Participation: +25 pts, Winner: +150 pts + exclusive cosmetic
- Ad slot on intermission + end screen (sponsor revenue)
- `calculateRoundWinner()` sorts by score DESC, then buzzInTimeMs ASC for ties

## GAME ENGINE — DEAL OR FEUD 1000 RULES

- 2-8 players, 5 rounds × 60 seconds
- Reach 1000 points to win the board
- Lighting: `rainbow_party`, Scene: `game-night`
- +50 pts per correct answer, +25 speed bonus
- Winner: +200 pts

---

## SCORING ENGINE — KEY CONSTANTS

**Participation Points Map (selected):**
- join_event: +10, stay_30_minutes: +25, vote: +5
- win_full_game: +150, won_contest: +100, daily_login: +5
- went_live: +30, article_published: +20, get_article_featured: +100

**Crown Rules:**
- `crownDefenseFrequency: 'weekly'` — resets every week
- `crownDecayAfterWeeks: 1` — nobody holds forever
- `hallOfFameAfterWeeks: 1` — every winner immortalized
- `animationDurationMs: 3000` — crown pop-on/pop-off animation

**Top 10 Flame Rules:**
- Position 1: strong flame (gold glow), Positions 2-3: medium, 4-10: light
- `fallbackToGlowIfSlowDevice: true` — performance safe

**Fraud Rules:**
- maxVotesPerUserPerEvent: 1
- suspiciousVelocityThreshold: 10 actions/minute
- autoFlagThreshold: 25 actions/minute

---

## ITEM ECONOMY — RARITY SYSTEM

| Rarity | Drop Weight | Point Price Range | Color |
|---|---|---|---|
| Common | 40% | 50–200 | #C8A8E8 |
| Uncommon | 25% | 200–500 | #00C896 |
| Rare | 15% | 500–1,500 | #00E5FF |
| Epic | 10% | 1,500–5,000 | #7B2FBE |
| Legendary | 5% | 5,000–20,000 | #FFB800 |
| Exclusive | 0% (earned only) | Free | #FF2D78 |

**Automatic Item Generation Triggers:**
- New sponsor campaign → Rare sponsor item (500 qty)
- Issue release → Epic collectible (100 qty)
- Battle winner → Legendary avatar effect (1 qty)
- Crown awarded → Exclusive badge (1 qty)

**Economy Balance Rules:**
- maxDailyPoints: 500, maxWeeklyPoints: 2000
- Duplicate item → 25% point refund
- guaranteedEpicAfterXDrops: 50, guaranteedLegendaryAfterXDrops: 200

---

## MOVE DESTINATIONS

```
engines/venue-engine.ts          → apps/api/src/modules/venues/venue.engine.ts
engines/game-engine.ts           → apps/api/src/modules/games/game.engine.ts
engines/scoring-engine.ts        → apps/api/src/modules/scoring/scoring.engine.ts
engines/item-economy.ts          → apps/api/src/modules/economy/item-economy.engine.ts
registry/platform-registry.ts   → apps/web/src/config/platform-registry.ts
pages/games/page.tsx             → apps/web/src/app/games/page.tsx
pages/dirty-dozens/page.tsx      → apps/web/src/app/dirty-dozens/page.tsx
pages/deal-or-feud/page.tsx      → apps/web/src/app/deal-or-feud/page.tsx
pages/venues/page.tsx            → apps/web/src/app/venues/page.tsx
pages/shop/page.tsx              → apps/web/src/app/shop/page.tsx
```

---

## GRAND TOTAL — ALL 12 PACKS

| Pack | Files | Primary Contribution |
|---|---|---|
| 25-34 | 225 | Full platform architecture |
| 35 | 5 | Home 4, WorldSwitcher, Bot Orchestrator |
| **36** | **10** | **Venues, Games, Scoring, Item Economy, Registry, 5 Pages** |
| **TOTAL** | **240** | **Complete TMI platform** |

*BerntoutGlobal LLC — "This is your stage, be original."*
