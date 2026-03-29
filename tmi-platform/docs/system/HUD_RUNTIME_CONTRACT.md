# HUD RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Prevent HUD drift as runtime systems connect by defining required HUD state fields and extension slots.

---

## BASE HUD RUNTIME FIELDS (PHASE 1)

### Audio
- `trackTitle: string | null`
- `trackArtist: string | null`
- `isPlaying: boolean`
- `currentTime: number`
- `duration: number`
- `sourceUrl: string | null`
- `canPlayPause: boolean`
- `play(): void`
- `pause(): void`

### Preview (scaffold hooks)
- `previewIsOpen: boolean`
- `previewSourceType: string | null`
- `previewStatus: string | null`
- `openPreview(content): void`
- `closePreview(): void`

---

## RESERVED HUD SLOT FAMILIES

- `audioSlot`
- `previewSlot`
- `notificationSlot`
- `roomStateSlot`
- `operatorHealthSlot`
- `pointsSlot`

Only `audioSlot` and `previewSlot` are required in current phase.

---

## PHASED EXTENSIONS

### Phase 2
- room state signals
- queue/turn signals
- live preview ownership indicators

### Phase 3
- venue/event status hooks
- operator alerts and incident markers

### Phase 4
- economy/mission signals
- sponsor campaign runtime signals

---

## CONFORMANCE RULE

Any HUD module integration must:
1. read from runtime providers, not local page state
2. declare fallback behavior for missing runtime
3. emit telemetry for user control actions
4. avoid introducing parallel ownership of existing runtime fields

If violated, module is PARTIAL.
