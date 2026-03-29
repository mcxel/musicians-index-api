# LIVE CONTROL PANEL RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the minimum runtime responsibilities for the Live Control Panel scaffold so operator controls remain consistent and do not create parallel state ownership.

---

## REQUIRED INPUT RUNTIMES

- Audio runtime (`useAudio`)
- Shared preview runtime (`useSharedPreview`)
- Turn/queue runtime (`useTurnQueue`)
- Room watchdog runtime (`useRoomWatchdog`)

The control panel is a coordinator UI, not a state owner.

---

## REQUIRED SCAFFOLD ACTIONS

- play/pause audio (if current track exists)
- open/close shared preview
- open/close queue dock
- seed queue (dev scaffold only)
- next turn
- release turn lock
- set room status (`idle | active | paused`)

---

## PHASE BOUNDARY

Current scaffold explicitly excludes:
- moderation actions
- venue/event escalation
- sponsor slot orchestration
- recovery orchestration
- permanent operator permissions

These are later slices.

---

## UI RULES

- Must remain compact and non-invasive.
- Must not redesign existing pages.
- Must use platform panel language.
- Must be safe to remove via rollback without affecting runtime owners.

---

## CONFORMANCE RULE

Any future live control extensions must call existing runtime owners and may not duplicate ownership of:
- playback state
- preview state
- queue/turn state
- watchdog health state
