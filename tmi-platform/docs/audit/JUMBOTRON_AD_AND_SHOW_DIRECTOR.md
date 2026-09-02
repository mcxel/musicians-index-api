# Jumbotron Advertising + Automated Show Director + People Spotlight

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Status:** **DONE** (contracts + engines + unit cert) · **OPEN** (Observatory UI, AdSense 3D textures, commerce click-through)

## Laws encoded

1. **Four faces = one Jumbotron runtime, four independent Display Targets** (NORTH/EAST/SOUTH/WEST) — not one ad copied 4×.
2. **Physical Advertising Truth** — same canonical room → same physical surface state; faces may differ; viewability from frustum/duration; no fabricated impressions.
3. **Shared physical surfaces = shared room truth**; personalized ads belong in personal player/UI inventory only.
4. **Ad Safety** — never override emergency, critical live/competition, required cues, moderation, accessibility.
5. **Priority:** P0 EMERGENCY → P1 CRITICAL LIVE → P2 RESULT/TIMER/SCORE → P3 CONTRACTED SPONSOR → P4 DIRECT AD → P5 HOUSE → P6 AMBIENT.
6. **Campaign modes:** SINGLE_FACE, TWO_FACE, FOUR_FACE_TAKEOVER, ROTATING_FACE, SYNCHRONIZED_TAKEOVER.
7. **In-world 3D textures default** to direct sponsors / artist sponsors / house ads — AdSense/WebGL Google ads are **not** the default path.
8. **Fallback never blank:** paid → artist sponsor → event promo → merch → house → ambient art.
9. **People Spotlight:** real participants only; consent OFF / AVATAR ONLY / LIVE VIDEO; minors protected; friend groups first-class; random from eligible pool only.
10. **Composition modes:** FULL, PIP, SPLIT, TRIPLE, QUAD, LOWER_THIRD, SCORE_STRIP.
11. Ads may PiP while live moment shows — do not always kill sponsor.
12. Stage-facing face may prioritize performer cues during performance; monetize in breaks.

## Module map

| Module | Path |
|--------|------|
| Contracts | `apps/web/src/lib/jumbotron/JumbotronAdContracts.ts` |
| Face targets | `apps/web/src/lib/jumbotron/JumbotronFaceTargetRegistry.ts` |
| Content scheduler | `apps/web/src/lib/jumbotron/JumbotronContentScheduler.ts` |
| Show director | `apps/web/src/lib/jumbotron/JumbotronShowDirector.ts` |
| Spotlight | `apps/web/src/lib/jumbotron/JumbotronSpotlightDirector.ts` |
| Observatory control room | `apps/web/src/lib/jumbotron/JumbotronAdObservatoryControlRoom.ts` |
| Surface registry | `apps/web/src/lib/ads/VenueAdSurfaceRegistry.ts` |
| Ad director | `apps/web/src/lib/ads/VenueAdDirector.ts` |
| Impression ledger | `apps/web/src/lib/ads/VenueAdImpressionLedger.ts` |
| Cert | `apps/web/src/tests/runJumbotronAdAndShowDirectorCertification.test.ts` |

## Inventory IDs

```
venue:{venueId}:jumbotron:north|east|south|west
venue:{venueId}:stage-led
venue:{venueId}:ribbon
venue:{venueId}:scoreboard
venue:{venueId}:concourse
venue:{venueId}:lobby
```

## Impression law

- `recordAssignment` → `viewedAtMs = null`, `rejectReason = ASSIGN_ONLY`
- View counted only after frustum + ≥50% area + ≥1000ms continuous visibility
- Rejects: backface, offscreen, background tab, bots, QA harness

## Sellable packages (data contracts)

Fan Cam Presented By · Winner Spotlight · Round Timer Frame · Scoreboard Ribbon · Intermission Takeover · Two-Face Split Sponsor · Four-Face Event Takeover · Lower-Third House · Merch Drop Burst · Group Friend Spotlight

## Presentation templates (style only)

NEON_POP · COMIC_BURST · ARENA_FIRE · VICE_GLASS · GOLD_TICKER · CYPHER_CIRCLE · DISCO_PULSE · LOWER_THIRD_CLEAN — all `inventsOutcomes: false`.

## OPEN scaffolds (intentional)

| Item | Status |
|------|--------|
| Observatory Ad Surface Control Room **UI** | OPEN (types + TAKE/HOLD/NEXT commands exist) |
| AdSense as **in-world 3D texture** | OPEN / not default — web overlay opt-in only |
| Commerce click-through settlement | OPEN (URL field on creative; no checkout wire) |
| Aggregate engagement optimizer | OPEN (weights stub + hard constraints) |

## Cert command

```bash
cd apps/web
pnpm exec jest --config jest.config.ts --testPathPatterns=runJumbotronAdAndShowDirectorCertification --runInBand
```

## Isolation note

Built as additive jumbotron/ads modules. Does not modify Performer Live presentation slice wiring. Reuses existing P0 geometry (`DisplayTargetClass` face targets, placement resolver) without rebuilding.
