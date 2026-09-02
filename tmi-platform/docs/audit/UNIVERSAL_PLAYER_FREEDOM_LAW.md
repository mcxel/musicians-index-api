# UNIVERSAL PLAYER FREEDOM LAW

**Locked by:** Marcel Dickens  
**Date:** 2026-09-02  

**Platform slogan:** Everything visual is a source. Every source can go to any authorized media player. Every player can be one view or multiple views. Starting another view does not force the first to stop. The user stays inside the experience while arranging screens.

**Short slogan:** Any source. Any player. Any authorized viewpoint. Any time. Players are never dedicated. Splitting changes presentation, not ownership. Switching views never restarts the experience.

---

## Core law

No media player slot, video panel, monitor, or screen is permanently dedicated to any experience, source type, Jumbotron feed, chat, audience, Battle, or function.

**PLAYER = DISPLAY TARGET** — not **PLAYER = EXPERIENCE**.

Hierarchy:

```
LIVE SESSION → AVAILABLE VIEWPOINTS/SOURCES → MEDIA PLAYER → PLAYER LAYOUT → ONE / TWO / MULTI-VIEW
```

---

## Dual-View Experience Law

Complex live experiences may **recommend** two starting viewpoints:

1. Primary — main experience/program  
2. Secondary — personal/audience/social/avatar/chat/alt camera  

Either may be single or split/multi-view.

**Defaults are convenience only** — never reserve Player 1 as program or Player 2 as social in architecture code.

```
recommendedAssignment[0] = PROGRAM
recommendedAssignment[1] = USER_CONTEXT
```

Then the user owns composition. Preferred layouts (Battle/Concert/Hangout) may be saved later without changing session architecture.

Implementation: `PresentationTargetResolver.buildRecommendedDualAssignment()` + `CanonicalUniversalPlayerFabric.applyDefaultDualView()`.

---

## Presence Continuity Law

Starting a secondary visual (private video chat, friend call, alt cam, audience, avatar, Jumbotron feed, shared screen) must **NOT** terminate/replace/restart the primary room/session.

Primary stays alive until the user explicitly leaves.

Applies to: Battles, Challenges, Cyphers, Gauntlets, Game Shows, Regular GO LIVE, Fan Social Live, Concerts, Releases, Watch/Listening Parties, MNS, WDP, Fan Avatar Lobbies, Performer Lobbies, Lounges, rehearsals, auditions.

Lounge example:

```
PLAYER 1 → LOUNGE WORLD
PLAYER 2 → PRIVATE VIDEO CHAT
```

Chat focus → lounge remains connected, presence/position preserved, lounge softens/bokeh, chat promoted, audio ducks; end chat → release tracks, restore lounge clarity.

Bokeh is a **presentation contract**, not a separate room system.  
3D/avatar lobby is a canonical rendered **source** assignable to any player.

---

## Jumbotron dual role

1. Physical Jumbotron = venue display target (Director-owned; survives player reassignment).  
2. `JUMBOTRON_FEED` may assign to any player N — never a dedicated jumbotron slot.

---

## Control contract (identical on all 16 slots)

TAKE · CHANGE VIEW · MOVE · SWAP · SPLIT · UNSPLIT · PIN · UNPIN · EXPAND · FULLSCREEN · RETURN · SEND TO PLAYER N · SEND TO AVAILABLE PLAYER

| FORBIDDEN | REQUIRED |
|-----------|----------|
| `PLAYER_3_IS_BATTLE` | mutable `sourceId` |
| `PLAYER_8_IS_CHAT` | `previousSourceStack` for RETURN |
| `PLAYER_16_IS_JUMBOTRON` | RETURN at **current live position** |

---

## Related

- [`DYNAMIC_COMMUNICATION_PLAYER_LAW.md`](./DYNAMIC_COMMUNICATION_PLAYER_LAW.md)
- [`JUMBOTRON_P0_CERT.md`](./JUMBOTRON_P0_CERT.md)
- `apps/web/src/lib/media/CanonicalUniversalPlayerFabric.ts`
- `apps/web/src/lib/media/PresentationTargetResolver.ts`
