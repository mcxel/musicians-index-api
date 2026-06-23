# TMI Platform — Missing Media Report
Generated: 2026-06-14

Media elements that are absent, faked, or placeholder-only. Cannot verify actual load success without browser runtime — this report covers code-level gaps only.

---

## Audio

| Surface | Expected | Actual | Gap |
|---|---|---|---|
| fan/theater Playlist Engine | Real `<audio>` playback | `setInterval` progress bar only — no `<audio>` element | Fake player — music not playing |
| app/playlist/page.tsx | `<MediaPlayer>` with real src | MediaPlayer present, STATIC_TRACKS have no real URLs | Tracks are placeholder titles only |
| Stream & Win Radio | Live audio stream | XP counters are localStorage-backed, stream source not verified | Need real stream URL in env |

---

## Video

| Surface | Expected | Actual | Gap |
|---|---|---|---|
| MaskedVideoTile | Real MediaStream or streamUrl | Falls back to emoji avatar when no stream passed | OK for battle/cypher until Daily.co/WebRTC connects |
| GoLiveStudio | Daily.co video room | Real camera via getUserMedia wired; Daily.co URL set | Depends on `DAILY_API_KEY` env var |
| SplitStreamMatrix | 3-way split video | getUserMedia real, split UI skeleton | Broadcast state incomplete |
| BillboardLiveWall | Performer video tiles rotating | Dependent on `fetchTrendingArtists()` API response | Falls back to mock `buildFallback()` if API returns null |
| AudienceScene | 3D canvas crowd view | Canvas renders generated pixel crowd | No real performer video stream shown inside AudienceScene |

---

## Images

| Surface | Expected | Actual | Gap |
|---|---|---|---|
| Performer profile images | Real headshots from DB | ProfileLobbyRuntime shows emoji/placeholder | No image upload → profile photo path |
| Magazine article images | Real editorial photos | 4 hardcoded performers have placeholder emoji | No image asset CDN wired |
| Billboard trending artists | Artist photo thumbnails | API fallback returns mock data | Depends on trending-artists API returning real data |
| Orbital nodes (Home 1) | 4:5 portrait card with real photo | Currently polygon + emoji | P7 not yet applied |

---

## Fonts

| Font | Expected On | Actual | Gap |
|---|---|---|---|
| Orbitron | All home pages (1–5) | NOT loaded via layout or global CSS | Only loaded in fan/theater via `<style>` inject |
| Exo 2 | All home pages (1–5) | NOT loaded globally | Only loaded in fan/theater via `<style>` inject |
| Orbitron + Exo 2 | Arena / Battle / Cypher pages | May not be loaded | Needs P8 fix in `apps/web/src/app/layout.tsx` |

---

## Sponsor / Ad Media

| Surface | Expected | Actual | Gap |
|---|---|---|---|
| SponsorRail on Home 1-5 | Rotating sponsor logos | Component mounted but receives empty array | No sponsors data passed from any home page |
| TieredAdSlot | Contextual ad creative | Renders placeholder if no ad creative served | Depends on ad network or manual ad slot content |
| Home 1 Sponsor Spotlight | Real sponsor logo + campaign bar | Hardcoded "Beats By TMX" placeholder | Replace with DB-backed sponsor |

---

## 3D / Canvas

| Surface | Expected | Actual | Gap |
|---|---|---|---|
| AudienceScene (Theater) | Canvas-based 3D crowd, BPM sync, phone glow | MATCH — canvas renders generated pixel crowd | No real BPM data piped in |
| HeroRigController | GLB 3D avatar rig | Emoji-only; P12 comment says "swap to GLB" | 3D character models not loaded |
| Home 1 Orbital | Animated genre orbital | CSS/SVG polygon nodes | Portrait card upgrade (P7) pending |

---

## Environment Variables Required for Real Media

| Variable | Purpose | Impact if Missing |
|---|---|---|
| `DAILY_API_KEY` | GoLiveStudio video rooms | Camera opens but room join fails |
| `VERCEL_BLOB_TOKEN` | Upload pipeline | File uploads fail |
| `OPENAI_API_KEY` | Big Ace / Michael Charlie bots | Agent routes fall back to rule-based |
| `API_BASE_URL` | Room join proxy route | `/api/rooms/[id]/join` returns 501 (non-fatal) |
| Stream & Win radio stream URL | Live audio stream | No real stream URL documented in codebase |
