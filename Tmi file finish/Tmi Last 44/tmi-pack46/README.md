# PACK 46 — ADMIN CONTROL BOARDS / HOST CONTROLS

## Files: 2
- `admin/admin-control.engine.ts` — All admin surfaces, host control actions (17 types), sponsor drop triggers, fraud review interface
- `host-controls/host-panel.tsx` — Complete host control panel page: lighting presets, rewards/giveaways, broadcast controls, room moderation, game controls, emergency panel

## Key Systems
- `HostControlAction` — 17 typed actions (lighting, scene, reward drop, prompt, manual gift, mute, remove, ad break, camera, game rounds, winner reveal, fireworks, crowd wave, lower thirds, broadcaster swap)
- `FraudReviewEntry` — Pattern data: claims in 24h, simultaneous rooms, velocity score, account age, previous flags
- `SponsorDropTrigger` — Immediate/scheduled/on-event drops with Big Ace approval gate
