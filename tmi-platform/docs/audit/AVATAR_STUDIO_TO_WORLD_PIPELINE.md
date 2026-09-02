# Avatar Studio → World Pipeline

**Locked:** 2026-09-02  
**Rules:** 15, 18, 26, 28  
**Matrix row:** Avatar Studio · Fan Lobby · WDP · Concert audience  
**Spec companion:** [`VENUE_WORLD_RUNTIME_SPEC.md`](./VENUE_WORLD_RUNTIME_SPEC.md)

---

## Hard ownership law

- **Fans only** create/customize/equip avatars (Rule 26).
- **Performers/Bands** never own avatar wardrobe UI — real photo/video/live identity.
- Audience in a performer's room remains fan avatars (runtime stays; ownership does not transfer).

---

## Pipeline

```
CREATE (Avatar Creation Center /studio)
  → CUSTOMIZE (body/face/wardrobe — Herser canonical rig)
    → PREVIEW (AvatarPreviewMotionDirector context poses)
      → SAVE LOOKS (MY LOOKS presets)
        → EQUIP / PUBLISH (ownership + rig compatibility validate)
          → LiveAvatarSyncService broadcast
            → ENTER VENUE (LobbyEntryFlow → seat/spawn)
              → World presence (Fan Lobby / WDP floor / concert seat)
```

Draft appearance is **local preview only**. Equipped look is the only world-visible loadout.

---

## Route map

| Route | Role |
|-------|------|
| `/avatar/studio` | Full edit |
| `/avatar/closet` | Inventory |
| `/avatar/looks` | Saved looks |
| `/avatar/test` | QA Lab |
| Hub / HUD AVATAR | Avatar Quick Panel → studio |

Gate all ownership UI with `<RoleGate allow={['FAN']}>`.

---

## Enter venue requirements

1. Equipped look resolves: `avatarId → mesh → rig → animationGraph → wardrobe`.
2. Missing canonical binding → visible diagnostic (no silent substitute mesh).
3. Join path **must** go through `LobbyEntryFlow` for seated experiences.
4. Lounge / Performer Lobby: **do not** inject avatars — different presence model.

---

## Saved looks (first-class)

Everyday · Battle Night · World Dance Party · Concert · Monday Night Stage · Business · Fan Lobby · Formal · Custom.

One press equips full loadout. Operations: duplicate, rename, favorite, delete, set default.

---

## Current honesty (2026-09-02)

| Step | Status |
|------|--------|
| bobblehead_v0 Foundry + Canister SMILE | PARTIAL / certified for smile path |
| Full wardrobe / props / collision | OPEN |
| LiveAvatarSync into all rooms | OPEN |
| QA Lab full matrix | OPEN |
| Face-scan pipeline | OPEN (multi-specialist — do not stub) |

---

*Locked 2026-09-02. Create once — wear everywhere authorized.*
