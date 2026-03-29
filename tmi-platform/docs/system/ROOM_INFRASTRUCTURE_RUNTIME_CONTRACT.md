# ROOM INFRASTRUCTURE RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the minimum reusable room infrastructure scaffold that all live room families can share before full room logic is implemented.

---

## ROOM FAMILIES (PLACEHOLDER MODES)

The runtime must support these room modes as placeholders:

- `arena`
- `cypher`
- `mini_cypher`
- `producer`
- `battle`
- `venue`
- `watch`

---

## REQUIRED IDENTITY FIELDS

The room runtime owner must expose:

- `roomId`
- `roomType`
- `roomStatus`
- `roomTitle`
- participant roster shell
- participant count
- `roomMode`

---

## REQUIRED MOUNT REGIONS

The scaffold must declare stable mount region placeholders for:

- preview window
- turn/queue dock
- live control panel
- watchdog
- recovery

---

## NON-GOALS (THIS SLICE)

- no full room UI behavior
- no venue/event domain logic
- no battle scoring or voting logic
- no deep participant role/permissions orchestration

---

## CONFORMANCE RULE

Room identity and status ownership must exist in one reusable room infrastructure owner and be consumed by downstream room systems (watchdog, control, recovery, room surfaces) rather than duplicated per feature.
