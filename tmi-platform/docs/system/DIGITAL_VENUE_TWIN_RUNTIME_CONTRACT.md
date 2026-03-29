# DIGITAL VENUE TWIN RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the minimum digital venue twin scaffold that attaches venue and environment identity to room infrastructure without introducing booking/event/operator implementation.

---

## REQUIRED IDENTITY FIELDS

The digital venue twin runtime owner must expose:

- `venueId`
- `venueName`
- `venueType`
- `city`
- `region`
- `environmentThemeKey`
- `roomTemplateKey`
- `eventId` (placeholder)
- `sponsorSkin` (placeholder)
- live status placeholder (`live | not_live`)

---

## ROOM ATTACHMENT RULES

- Venue twin must attach to room infrastructure via room-derived identity (`roomId`, `roomType`).
- Room identity ownership remains in room infrastructure owner.
- Venue twin must not create duplicate room ownership fields.

---

## THEME INHERITANCE RULES

- `environmentThemeKey` is the canonical venue theme source for room-family surfaces.
- Room-family variants may override presentation details, but must inherit from venue theme first.

---

## TEMPLATE INHERITANCE RULES

- `roomTemplateKey` is the canonical room template pointer for venue-attached room provisioning.
- Future room provisioning systems must consume this key instead of hardcoding per-route templates.

---

## FUTURE HOOKS (DECLARED)

- sponsor skin resolution and campaign delivery hooks
- event bridge/provisioning hooks
- operator venue control hooks
- world-map and city-scene routing hooks

---

## NON-GOALS (THIS SLICE)

- no booking or event provisioning logic
- no sponsor campaign logic
- no venue operator control logic
- no room-family behavior implementation

---

## CONFORMANCE RULE

Venue identity and environment inheritance must be centralized in a single digital venue twin owner and consumed by downstream room-family systems, with room infrastructure retained as the sole owner of room identity/state.
