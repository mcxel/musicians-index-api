# LIVE ROOM CERTIFICATION
**TMI Platform — Live Room Buttons, Routing, Audience Fill & Commerce**  
**Date:** 2026-06-15 | **Priority:** P0 (Biggest launch risk)

---

## Architecture

Live Room = `LobbyEntryFlow` → `AudienceScene` → Room page + all its systems.

Entry path: `Discovery tile → LobbyEntryFlow (5 steps) → /live/rooms/[id]`

Authorized origins: `live-lobby | lobby-wall | fan-lobby-wall | performer-lobby-wall | mixed-lobby-wall | fan-hub | billboard | billboard-wall | home-3`

---

## 1. GO LIVE FLOW (Performer Side)

| Button / Step | Location | Destination / Action | Status |
|---|---|---|---|
| Go Live | Performer dashboard/profile | Opens broadcast setup modal | 🔲 |
| Camera ON/OFF | Live control panel | `WebRTCCapture.tsx` toggle | ✅ |
| Mic ON/OFF | Live control panel | `WebRTCBroadcast.tsx` toggle | ✅ |
| Select Room / Venue | Pre-broadcast | VenueRegistry venue selector | 🔲 |
| Invite Co-Host | Pre/during broadcast | `CoHostHandoffPanel.tsx` | ✅ |
| Start Stream | Confirms live | Sets `isLive=true` → updates PerformerRegistry | 🔲 |
| End Stream | Ends broadcast | Clears `isLive`, saves recap | 🔲 |
| Scene Picker | During stream | `ScenePickerPanel.tsx` | ✅ |

---

## 2. AUDIENCE ENTRY GATE

| Step | Mechanism | Status |
|---|---|---|
| Tile click (billboard/home) | Opens `LobbyEntryFlow` modal | ✅ |
| Step 1 — idle | Preview card shown | ✅ |
| Step 2 — preview | Room preview + viewer count | ✅ |
| Step 3 — access check | `TMILobbyAccessGate.tsx` — tier check | ✅ |
| Step 4 — seat assignment | Random Row A-H, Seat 1-40 | ✅ |
| Step 5 — AudienceScene | `AudienceScene.tsx` loaded dynamically | ✅ |
| Step 6 — enter room | Navigate to `/live/rooms/[id]?from=[origin]` | ✅ |
| Direct URL entry | Redirects to `/live/lobby?room=[id]&seat=1` | ✅ |

---

## 3. AUDIENCE FILL — STADIUM EFFECT (NEW — 2026-06-15)

Per Marcel Dickens directive: Seats fill progressively like a real stadium. Bots fill empty seats with unique avatars to give confidence to real performers.

### Two Entry Paths to Audience Seats (Marcel directive 2026-06-15)

Users can reach their audience seat via exactly two paths:

| Path | Entry Point | Flow | Status |
|---|---|---|---|
| **Path 1 — Avatar Lobby** | `/live/lobby`, `FanLobbyWall`, `AvatarLobbyCanvas` | User browses avatar lobby → sees rooms → clicks tile → LobbyEntryFlow 5-step → AudienceScene → Enter Room | ✅ All components exist |
| **Path 2 — Live Video Panel / Billboard Tile** | `BillboardLiveWall`, `MaskedVideoTile`, `Home 3` tiles | User clicks live card anywhere on platform → LobbyEntryFlow 5-step → AudienceScene → Enter Room | ✅ LobbyEntryFlow wired |

Both paths MUST route through `LobbyEntryFlow` — never direct to `/live/rooms/[id]` without seat assignment.

### Fill Rules
```
1. LIVE PUBLIC SHOW — seats fill progressively after Go Live
   - First 30 seconds: rows A-B fill (front rows, establishing presence)
   - 30s-2min: rows C-E fill (middle crowd builds energy)
   - 2min+: rows F-H fill if real audience hasn't taken those seats
   - Bot seats yield to real users (when real user joins, bot vacates their assigned seat)

2. PREDETERMINED SHOW — audience can be pre-filled
   - Promoter can set "pre-fill" on event creation
   - All bot seats fill at T-5 minutes before show start
   - Creates packed house effect for premiere moments

3. BOT SIT-INS — appearance rules
   - Every bot seat must show a DIFFERENT avatar (no duplicates visible on screen)
   - Bots have: unique avatar (from AvatarSystem palette), reaction animations, BPM sync sway
   - Bots respond to performer actions: tip animations, hype emotes, phone glow
   - Bots do NOT appear in tip feed, chat, or analytics
   - Admin can see "real: X / bots: Y" in Overseer Deck
```

### Implementation Components
| Component | File | Status |
|---|---|---|
| `AudienceScene` (canvas renderer) | `components/live/AudienceScene.jsx` | ✅ EXISTS |
| `AvatarAudienceCh aracter` | `components/avatar/AvatarAudienceCharacter.tsx` | ✅ |
| `AvatarSeatBehavior` | `components/avatar/AvatarSeatBehavior.tsx` | ✅ |
| `AvatarAttentionBehavior` | `components/avatar/AvatarAttentionBehavior.tsx` | ✅ |
| `AvatarReactionLayer` | `components/avatar/AvatarReactionLayer.tsx` | ✅ |
| Bot seat fill engine | **MISSING** — needs to be wired | ❌ |
| Bot avatar uniqueness check | **MISSING** | ❌ |
| Seat yield logic (bot → real user) | **MISSING** | ❌ |

### Bot Fill Engine — P0 Wire Task
```
Location: apps/web/src/lib/live/BotAudienceFill.ts
Purpose: fills empty seats with unique bot avatars on public go-live
Timing: setTimeout-based progressive fill per rules above
Bot yield: when real user joins with a seat ID already held by bot, bot moves to next available seat
```

---

## 4. IN-ROOM EXPERIENCE BUTTONS

### Audience Buttons
| Button | Action | Status |
|---|---|---|
| 🌊 WAVE | `AudienceScene` animation + `/api/participation` | ⚠️ Animation only, no DB |
| 🔥 HYPE | Same as wave | ⚠️ Animation only |
| 💰 Tip | Opens tip modal → Stripe → `TipJarWidget.tsx` | 🔲 Stripe needed |
| 👁 Follow | Auth → follow state | 🔲 |
| 🔔 Subscribe | Fan club join | 🔲 |
| 💬 Chat | `LobbyChatRail.tsx` in-room chat | ✅ |
| 📸 Capture Memory | `PolaroidCapture.tsx` → Memory Wall Canister | ✅ UI / 🔲 DB save |
| 🎵 Playlist | Shows room's playlist | 🔲 Wire PlaylistCanister |
| 📤 Share | Share URL generation | 🔲 |

### Performer In-Room Buttons
| Button | Action | Status |
|---|---|---|
| Camera ON/OFF | WebRTC toggle | ✅ |
| Mic ON/OFF | WebRTC toggle | ✅ |
| Challenge | Open challenge modal → opponent | 🔲 |
| Invite to Battle | Battle initiation | 🔲 |
| Start Cypher | Cypher room mode | 🔲 |
| Invite (guest) | `CoHostHandoffPanel` | ✅ |
| Props/Scene | `ScenePickerPanel.tsx` | ✅ |
| End Stream | Clears live status + recap | 🔲 |

---

## 5. AUDIENCE SCENE — 5 VENUE TYPES

| Venue Type | Shape | Status |
|---|---|---|
| Theater | Semicircle rows | ✅ |
| Arena | Full stadium circle | ✅ |
| Club | Flat floor grid | ✅ |
| Outdoor | Wide open field | ✅ |
| Boardroom | Small square | ✅ |

All venues: BPM sync sway, phone glow on tip, spotlight beams, crowd audio via `CrowdAudioEngine.tsx`.

---

## 6. LIVE ROOM CANISTER INTEGRATION (Rule 15)

Every live room must contain these canisters:

| Canister | In Live Room | Implementation | Status |
|---|---|---|---|
| Playlist Canister | Performer's set + crowd-requested | `PlaylistEngine.tsx` → embed in room | 🔲 Wire |
| Memory Wall Canister | Captures from audience | `PolaroidCapture.tsx` → MemoryWall | 🔲 Wire |
| Messaging Canister | In-room DMs + group chat | `LobbyChatRail.tsx` | ✅ |
| Inventory Canister | User emotes/props in room | `InventoryPanel.tsx` | ✅ component exists / 🔲 wire |
| Store Canister | Performer merch / beat drops | `BeatPurchaseModal.tsx` | ✅ |
| Private Lobby | Backstage/green room | `LiveLobbyDrawer.tsx` | ✅ |

---

## 7. ROOM ROUTING TABLE

| Surface | Route | Video | Audio | Chat | Avatar | Seat Join | Tip | Status |
|---|---|---|---|---|---|---|---|---|
| `/live/rooms/[id]` | ✅ | `WebRTCBroadcast` | ✅ | `LobbyChatRail` | `AudienceScene` | Row/Seat assigned | `TipJarWidget` | 🔲 E2E |
| `/live/lobby` | ✅ | Preview | — | — | Avatar canvas | Queue | — | ✅ |
| `/live/[slug]` | ✅ (redirects) | — | — | — | — | — | — | ✅ |
| `/live/schedule` | ✅ | Upcoming | — | — | — | — | — | ✅ |

---

## 8. CERTIFICATION CHECKLIST

| Test | Method | Status |
|---|---|---|
| Go Live button found in performer dashboard | Code audit | 🔲 |
| `isLive=true` propagates to PerformerRegistry | Code trace | 🔲 |
| LobbyEntryFlow 5 steps complete | Runtime test | 🔲 |
| AudienceScene renders with > 0 avatars | Runtime test | 🔲 |
| Bot seats fill progressively after go-live | Runtime test | ❌ BotAudienceFill.ts missing |
| Real user joins → bot yields seat | Runtime test | ❌ Not built |
| Tip button opens Stripe flow | Runtime + Stripe | 🔲 |
| Chat visible during stream | Runtime | 🔲 |
| Memory capture saves to wall | Runtime | 🔲 |
| End Stream clears live status | Runtime | 🔲 |
| Recap auto-generated | Runtime | 🔲 |

---

## P0 ACTIONS REQUIRED

1. **Create `lib/live/BotAudienceFill.ts`** — progressive seat fill engine with unique avatar assignment, yield logic
2. **Wire `BotAudienceFill` into `/live/rooms/[id]/page.tsx`** — trigger on `isLive` = true
3. **Wire `PlaylistCanister` into live room** — room playlist visible to audience
4. **Verify `isLive` flag propagates** — PerformerRegistry → Home 1 Crown → Discovery Rails
5. **Tip button → Stripe Connect** — `MaskedVideoTile` `$ Tip` → checkout flow
