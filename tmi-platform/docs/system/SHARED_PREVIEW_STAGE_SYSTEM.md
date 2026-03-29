# SHARED PREVIEW STAGE SYSTEM
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## LAW

Arena and Cypher rooms must support one shared approved media source at a time.
The active source is room-owned, turn-controlled, and visible to all participants simultaneously.

---

## CORE STATE CONTRACT

`room.media.current` must include:
- `ownerUserId`
- `ownerArtistId`
- `sourceType`
- `sourceUrl`
- `title`
- `thumbnail`
- `startedAt`
- `status` (`idle | loading | live | paused | ended`)
- `turnSlot`

Only one active object may exist per room at any time.

---

## PERMISSION RULES

- Only current turn owner can start/stop/pause/swap shared media.
- Non-turn participants may react/comment, but cannot override active media.
- Host/mod may force stop or freeze stage for safety.

---

## SOURCE RULES

- No arbitrary paste-anything URLs in live room controls.
- Shared source must come from approved profile-linked media.
- Validation required before broadcast.

---

## UI REQUIREMENTS

Room surface must include:
- Main preview stage or PiP preview card
- Source owner label
- Turn owner indicator
- Live/paused/loading status
- Fallback frame when source unavailable

---

## REQUIRED CHAIN

Engine -> RoomMedia model/config -> API -> provider -> stage component -> room display -> HUD indicators -> logs

If any link is missing, preview stage is PARTIAL.
