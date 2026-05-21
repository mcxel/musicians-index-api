# LIVE_SHOW_CHAIN.md
## Every Step When a Live Show Runs
### BerntoutGlobal XXL / The Musician's Index

---

## TRIGGER: Artist clicks "Go Live" from stage panel

```
Step 1: SHOW INIT
  POST /api/rooms (type:'arena', hostId: artistId)
  → Room record created
  → WebSocket room:state emitted
  → Room appears in /lobby (viewers_asc: position 1 since viewers=0)

Step 2: SPONSOR OVERLAYS ACTIVATED
  → ad-placement-bot checks for:
      SHOW_COUNTDOWN_SPONSOR (if show has a scheduled start)
      SHOW_LOWER_THIRD (if artist tier >= gold or sponsored)
      SHOW_TIP_MATCH (if sponsor campaign active for this artist)
  → scene-preset-bot applies default scene for room type

Step 3: VIEWER JOINS (repeated for each viewer)
  → WebSocket room:join fires
  → room:viewer_count emits updated count + viewers_asc position
  → If viewers=0 → position 1 maintained (discovery-first law ENFORCED)

Step 4: SHOW IN PROGRESS
  → Chat: real-time via room:chat WebSocket
  → Tips: POST /api/tips/intent → Stripe → room:tip_received → TipExplosionEffect
  → Tips split: 70% artist wallet, 30% platform
  → Scene changes: host triggers room:scene_change → all clients update
  → Turn queue: for cypher/battle rooms — enforced server-side

Step 5: SHOW ENDS (host triggers or inactivity)
  → room:ended fires to all clients
  → Room status = 'ended'
  → WebSocket connections close

Step 6: REPLAY CREATION
  → show-replay.pipeline.ts runs
  → Replay record created
  → Accessible at /shows/[id]/replay

Step 7: CLIP GENERATION
  → clip-generate-bot fires (if recording was enabled)
  → Segments extracted from replay
  → Clips encoded + thumbnails generated
  → Clips appear in artist's /dashboard/artist/clips

Step 8: ARCHIVE
  → Show added to /shows archive
  → Station archive updated /stations/[slug]/archive

Step 9: ANALYTICS UPDATE
  → Peak viewer count recorded
  → Total tips earned recorded
  → Watch time aggregated
  → Analytics visible in /dashboard/artist/analytics

Step 10: EARNINGS CALCULATION
  → earnings-calculate-pipeline runs after 7-day Stripe hold
  → Tip earnings (70%) credited to artist wallet
  → Show revenue attributed in earnings panel
  → Coaching note may fire: "Great show! Your next task: thank your sponsor."
```
