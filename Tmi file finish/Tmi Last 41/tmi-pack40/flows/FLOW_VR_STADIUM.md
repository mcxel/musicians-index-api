# EVENT FLOW: VR STADIUM CONCERT
## From Event Creation to 10,000 Avatar Crowd Live Show

```
TRIGGER: Venue creates Stadium event in /admin/events or /venues/dashboard

STEP 1 — EVENT SETUP
  → POST /api/events
    body: { title, venueId, startsAt, isVirtual: true, isLivestreamed: true }
  → Venue engine: creates TicketTiers for each section
    { GA: $19.99, Reserved: $29.99, VIP: $49.99, SponsorBox: $199.99 }
  → MaxPerBuyer: 8 enforced (Platform Law #4)
  → Sponsor boards assigned: POST /api/campaigns/:id/placements
    { zone: HOME3_LOBBY_WALL } (promotes event before it starts)

STEP 2 — TICKET SALES OPEN
  → Event published: ContentStatus → PUBLISHED
  → Ticket sales active at /events/[id]/tickets
  → Ticket purchase flow (see FLOW_TICKET_PURCHASE)
  → VR section shown: "Attend in VR" banner with device compatibility

STEP 3 — SHOW DAY: ARTIST STREAM STARTS
  → Artist: POST /api/livestream/start
  → StreamSession created: streamKey, ingestUrl, playbackUrl (HLS)
  → Broadcast engine: activates for this session
  → Broadcaster personality: "venue-host" selected

STEP 4 — VR STADIUM SPAWNS
  → WebXRManager.enterVR("vr-stadium")
  → SceneManager.loadScene("vr-stadium", xrConfig)
  → StadiumController initializes:
    - Loads stage geometry (Three.js)
    - Loads crowd positions for 10,000 seats
    - Configures GPU InstancedMesh for avatars
    - Places sponsor boards (from Campaign/Placement records)
    - Configures spatial audio layout (buildStadiumSpatialLayout)
    - Stage big screens load: artist HLS playbackUrl
  → WebSocket: joins /rooms namespace for this event roomId

STEP 5 — FAN ENTERS STADIUM VR
  → Fan has confirmed ticket
  → Fan opens /stadium or /vr/concert on Quest/browser
  → VREntryPoint component detects device (meta-quest / desktop_3d / etc)
  → POST /api/rooms/:roomId/join → RoomMember created
  → GET /api/tickets/:code → confirms ticket CONFIRMED status
  → AvatarController: loads fan's AvatarLoadout from UserInventory
  → AVATAR_PLACEMENT_RULES: Diamond → front_row, VIP ticket → vip section
  → Avatar spawned in 3D seat at correct position
  → Spatial audio initialized: crowd murmur from crowd-ambient source

STEP 6 — CROWD FILLS (10,000 AVATARS)
  → Each fan who joins → avatar instance added to InstancedMesh
  → LOD rendering:
    < 30m: full avatar quality (hat, chain, effect visible)
    30-80m: medium quality (base model only)
    > 80m: 2D billboard sprite (performance)
    > 500m: not rendered
  → GPU batching: 1000 avatars per draw call
  → Target: 90fps on Meta Quest, 72fps on other headsets
  → viewerCount updates via WebSocket → lobby sort updates

STEP 7 — SHOW IS LIVE
  → Artist HLS stream plays on stage big screens
  → Spatial audio: stage speakers project sound into 3D space
  → Fans hear stage clearly from front, crowd murmur from sides
  → Broadcaster (Venue Host personality) narrates:
    "We've got [N] face-scanned avatars in the stands tonight!"
  → Lower-thirds: artist name, song title
  → Sponsor boards: rotating campaigns, impressions tracked

STEP 8 — INTERACTIVE MOMENTS

  TIP JAR:
    Fan points at tip jar (hand tracking: "point" gesture)
    → POST /api/wallet/tip { artistId, amountCents }
    → WebSocket: tip event → coin animation flies from avatar to stage
    → Broadcaster shoutout: "Shout out to [fanName] for that Mega-Tip!"
    → PointsLedger: tip_artist +15

  CROWD WAVE:
    Hype reaches 80% threshold
    → WebSocket: hype_surge event
    → StadiumController.triggerCrowdWave()
    → CrowdWaveEvent: left_to_right, rippleSpeedMs: 200, waveHeightUnits: 2
    → All avatar instances animate in sequence
    → Audio: cheers-section.mp3 plays spatially from each section

  FIREWORKS:
    Crown awarded OR winner revealed OR sponsor trigger
    → WebSocket: crown_awarded OR winner_reveal
    → StadiumController.fireworks.trigger("winner_event")
    → FireworkSequence plays: burst → spiral → fountain
    → Audio: fireworks sounds from position above stage

  CAMERA SWITCHES:
    Host in /live/[roomId]/control changes camera
    → WebSocket: camera_switch event
    → All VR attendees' POV shifts to new StadiumCamera
    → Auto-trigger: "overhead" camera on hype_surge

STEP 9 — SPONSOR BOARD ROTATION
  → Every 60 seconds: /ads namespace rotates active campaigns
  → SponsorBoard.mediaUrl updates → Three.js texture swap
  → POST /api/ads/impressions → analytics tracked
  → If board is interactive: click/select gesture → opens ctaUrl

STEP 10 — SHOW ENDS
  → Artist stops stream → broadcast fail-safe triggers
  → Stadium enters "off-air" lighting preset
  → VR scene: crowds animate exit
  → POST /api/livestream/end
  → Replay pipeline starts: HLS VOD available in 10-30min
  → WebSocket: room_closed → all VR clients disconnected gracefully
  → EarningsRecord: session totals for artist + venue
  → archivist.bot: stadium event snapshot saved

STEP 11 — VR REPLAY THEATER
  → After replay ready: available at /vr/theater
  → Fan can watch replay in vr-theater scene
  → Same spatial audio, but no live crowd — ghost audience from recording
  → Ticket not required for replay (separate access model)
```

**Engines involved:** ALL (realtime, broadcast, scoring, economy, venue, media-pipeline, ui-hud, audio, vr-engine)
**DB models:** Event, Ticket, Livestream, Room, RoomMember, AvatarLoadout, Placement, Transaction, CrownRecord
**VR capacity:** 10,000 avatars via GPU InstancedMesh LOD
**Device support:** Meta Quest, PSVR2, Apple Vision Pro, SteamVR, Desktop 3D, Mobile Gyroscope
