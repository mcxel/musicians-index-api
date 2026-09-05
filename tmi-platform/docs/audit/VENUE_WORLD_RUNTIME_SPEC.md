# Venue World Runtime Spec

**Locked:** 2026-09-02  
**Matrix:** [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)  
**Avatar pipeline:** [`AVATAR_STUDIO_TO_WORLD_PIPELINE.md`](./AVATAR_STUDIO_TO_WORLD_PIPELINE.md)  
**Code contracts:** `WorldInteractionRegistry`, `VenueOccupancyDirector` in `apps/web/src/lib/experiencePresentation/`

Build **upward** on existing Venue / Audience runtimes (Rule 21). Do not spawn a second world system.

---

## Authority chain

```
CanonicalEnvironmentRegistry (venue → world asset → collision → navmesh → dimensions)
  → VenueOccupancyDirector (real participants only)
    → AudienceSocialRuntime (proximity, clusters, talk intent)
      → WorldReactionRuntime (real reactions → spatial FX)
        → GroupActionDirector (waves, coordinated emotes — real opt-in)
          → WorldInteractionRegistry (interactables: doors, seats, props, jumbotron)
```

---

## Geometry & collision

| Concern | Law |
|---------|-----|
| Dimensions | Herser / CanonicalEnvironmentRegistry authoritative — do not silently resize |
| Collision | Canonical collision asset; fail visible if unbound (`CANONICAL_COLLISION_NOT_BOUND`) |
| Navmesh | Required for walkable Fan Lobby / WDP / concert floor |
| Personal space | Performer Lobby panels: **1.5m** (see `backstagePerformerLobby.ts`) |
| Door / stair clearance | Avatar QA Lab cert checklist (Rule 28) |

---

## Seating & spawn

| Concern | Law |
|---------|-----|
| Seat claim | Canonical `audienceRuntimeEngine` / `useSeatSession` — one membership system |
| Spawn | SpawnAnchorSet from environment registry |
| Stage / audience anchors | StageAnchorSet / AudienceAnchorSet |
| Progressive fill | Real users + policy bots only; **no fake crowds**; max bot fill 92% where BotCrowdFillEngine applies — bots labeled, yield to humans |
| Performer Lobby / Lounge | **No avatar seats** — panel free-roam spawn points |

---

## LOD

```
Full avatar → simplified → billboard → point-cloud (distance)
```

LOD only after canonical rig bound (Rule 18/28). Never fake occupancy with LODs.

---

## AudienceSocialRuntime (contract)

- Inputs: real occupant ids, positions, mute/speak state, friend graph (optional).
- Outputs: proximity clusters, whisper/talk radius suggestions, seat neighbor hints.
- **Forbidden:** inventing occupants or applause.

---

## WorldReactionRuntime (contract)

- Subscribes to authoritative reaction events (PresentationEventBus / domain).
- Maps to spatial FX (glow sticks, jumps) on **real** avatar or panel emitters.
- **Forbidden:** auto-farm muted-tab reactions (RadioIntegrity spirit applies).

---

## GroupActionDirector (contract)

- Coordinates opt-in group emotes/waves among real occupants.
- Never triggers "full stadium cheer" without real participation signal policy.

---

## WorldInteractionRegistry (contract)

Interactable kinds (scaffold):

```
SEAT | DOOR | JUMBOTRON_SCREEN | PROP | DJ_BOOTH | STAGE_EDGE
PLAYLIST_TERMINAL | COMMERCE_KIOSK | SPAWN_PAD | PRIVATE_SUBROOM_PORTAL
```

Each entry: `interactableId`, `venueId`, `kind`, `anchor`, `allowedRoles`, `handlerId`.

Lounges / Performer Lobby: panels interact; avatar wardrobe interactions **off**.

---

## VenueOccupancyDirector (contract)

- `listOccupants(venueId)` → real session participants only.
- Rejects fabricated crowd injection APIs.
- Cert helper: `assertNoFakeOccupancy(snapshot)`.

---

## Presence by experience (quick map)

| Experience | World body |
|------------|------------|
| Fan Lobby / WDP / Concert audience | Fan avatars |
| Performer Lobby / Lounge / Playlist Lounge | WebRTC panels |
| Battle / Challenge / Cypher stage | Live video panels on stage + avatar audience where applicable |
| Rehearsal / Audition | Private; no public occupancy wall |

---

*Locked 2026-09-02. One Venue Runtime — many modes.*
