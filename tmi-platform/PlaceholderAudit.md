# Placeholder / Fake Data Audit — 2026-06-21

Excludes findings already fixed this session (Home1CoverPage.tsx tabloid cards, OmniPresenceEngine video tiles, trending-artists route fallback).

## Highest severity: PerformerRegistry.ts uses random stranger faces for named real performers

`apps/web/src/lib/performers/PerformerRegistry.ts` lines 109, 125, 141, 157, 173, 189, 205, 221, 237, 253, 269, 285 — every registered performer (Wavetek, Nova Cipher, Astra Nova, DJ Kraze, etc.) has `profileImageUrl` pointing at `i.pravatar.cc`, a random-face generator. This isn't an anonymous-fallback use (which would be defensible) — it's the actual photo displayed for a specific, named identity across every surface that reads from this registry (Home 1 orbit, Home 1-2 billboard, performer profiles, discovery rails). This is the single highest-leverage fix in this audit: one file, platform-wide effect.

## Fake names still appearing as filler content

| File | Line | Name | Context |
|---|---|---|---|
| `app/battles/new/page.tsx` | 24 | Big Ace | SUGGESTED_OPPONENTS array |
| `app/artist/dashboard/page.tsx` | 27-28, 391 | Chario Ace | PLAYLIST array + live ticker text ("LIVE: Chario Ace — Main Stage") |
| `components/home/OrbitalWheel.tsx` | 27, 29 | DJ Kraze | Mock orbital node + pravatar image |
| `components/tmi/artist/ArtistProfileHub.tsx` | 16, 19 | Big Ace, Chario Ace | ARTISTS array with hardcoded viewer counts (2147, 743) |

Note: "Big Ace" was already corrected platform-wide as a host/registry identity (`PLATFORM_AUTHORITY`, not a public performer) earlier this session — these are separate, un-related occurrences in different files that the host canonicalization pass didn't touch, since they're battle-opponent/playlist filler data, not host-registry entries.

## Hardcoded viewer/audience counts not derived from any state

| File | Lines | Values |
|---|---|---|
| `components/admin/LiveFeedMonitor.tsx` | 19-23 | 312, 841, 198, 0, 0 |
| `components/widgets/LiveRoomsWidget.tsx` | 6-11 | 1240, 842, 620, 480, 3400, 310 |
| `components/discovery/DiscoveryRail.tsx` | 32-39 | 15200, 8400, 12000, 9800, 4200, 6100, 21000, 3800 (games section) |
| `components/tmi/games/GameNightHub.tsx` | 9-23 | 15 hardcoded values across games list |

## Fake presence/revenue (Math.random()-driven)

| File | Line | Pattern |
|---|---|---|
| `components/admin/TMIAdminOverseer.tsx` | 145, 146, 241 | Random viewer count, random 60%-live coin-flip, random revenue tick |
| `components/admin/RevenueStrip.tsx` | 38 | Random revenue auto-increment every 4s |
| `app/admin/overseer/page.tsx` | 304 | Hardcoded "3,271 users online" (confirmed still present from earlier audit) |
| `lib/mock/live.ts` | 1 | `export const isLive = true;` — a mock module |
| `lib/global/CountryParityEngine.ts` | 32-36 | 5 of 8 seeded country hubs hardcoded `isLive: true` |
| `lib/world/WorldRuntime.ts` | 99,117,135,170,187,204,221,238,255 | 9 hardcoded venue/room fixtures with `isLive: true` + fake viewer counts |

## Confirmed clean
No lorem ipsum found anywhere. `LiveLobbyPreviewEngine.ts` and `social/PresenceEngine.ts` are confirmed real, data-driven, not fake.

## Recommendation
Fix `PerformerRegistry.ts` first — single file, platform-wide visual-honesty impact. Then purge `WorldRuntime.ts`'s 9 fixtures and `CountryParityEngine.ts`'s 5 fixtures, since these are exactly the same fake-liveness pattern already purged elsewhere this session (Discovery Loop Certification) — these two files were evidently missed by that earlier pass.
