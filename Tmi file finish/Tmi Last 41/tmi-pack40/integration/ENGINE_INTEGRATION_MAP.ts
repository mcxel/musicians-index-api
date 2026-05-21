// packages/integration/ENGINE_INTEGRATION_MAP.ts
// The single source of truth for how every engine connects to every
// API module, database model, WebSocket namespace, and frontend route.
// Blackbox uses this file as the wiring blueprint.

// ══════════════════════════════════════════════════════════
// ENGINE → API MODULE CONNECTIONS
// ══════════════════════════════════════════════════════════

export const ENGINE_TO_API_MODULE = {

  REALTIME: {
    engine: "packages/realtime/realtime.server.ts",
    powers: [
      "apps/api/src/modules/rooms/rooms.gateway.ts",    // WebSocket room events
      "apps/api/src/modules/games/games.gateway.ts",    // WebSocket game events
      "apps/api/src/modules/chat/chat.gateway.ts",      // WebSocket chat
      "apps/api/src/modules/notifications/notifications.gateway.ts",
      "apps/api/src/modules/livestream/livestream.gateway.ts",
    ],
    emitsTo: [
      "rooms.gateway → lobby update (viewers_asc sort)",
      "games.gateway → score events, round changes",
      "chat.gateway → canSendMessage check before emit",
      "notifications.gateway → push to specific userId",
      "crown namespace → global crown pop-on animation",
      "hype namespace → synchronized hype meter",
      "ads namespace → house-ad-fallback rotation",
    ],
  },

  BROADCAST: {
    engine: "packages/broadcast-engine/broadcast.engine.ts",
    powers: [
      "apps/api/src/modules/livestream/",
      "apps/api/src/modules/rooms/broadcast.service.ts",
    ],
    calledBy: [
      "POST /api/livestream/start  → creates stream session, emits to /rooms ws",
      "POST /api/livestream/end    → finalizes, triggers replay pipeline",
      "POST /api/broadcast/personality/:id → sets broadcaster for session",
      "POST /api/broadcast/lower-third → displays lower third on overlay",
      "POST /api/broadcast/ad-break → triggers commercial break",
    ],
    failSafe: "fail-safe.bot monitors stream health, triggers standby at 60s dropout",
  },

  SCORING: {
    engine: "packages/scoring-engine/scoring.service.ts",
    powers: [
      "apps/api/src/modules/games/scoring.service.ts",
      "apps/api/src/modules/scoring/",
      "apps/api/src/modules/rewards/points.service.ts",
    ],
    calledBy: [
      "POST /api/games/:id/score          → records score event",
      "POST /api/games/:id/vote           → audience vote (1 per user per round)",
      "POST /api/games/:id/round/next     → closes round, calculates winner",
      "POST /api/games/:id/complete       → final winner, triggers rewards",
      "POST /api/scoring/points           → participation point action",
      "GET  /api/scoring/leaderboard/:type → sorted leaderboard",
      "GET  /api/scoring/crown            → current crown holder",
    ],
    emitsViaWebSocket: [
      "games namespace → score_update event",
      "games namespace → round_winner event",
      "games namespace → points_awarded event",
      "crown namespace → crown_awarded event (3000ms animation)",
    ],
  },

  ECONOMY: {
    engine: "packages/economy-engine/economy.service.ts",
    powers: [
      "apps/api/src/modules/wallet/",
      "apps/api/src/modules/points/",
      "apps/api/src/modules/economy/",  // shop + inventory
      "apps/api/src/modules/store/",
    ],
    calledBy: [
      "GET  /api/wallet/mine           → current balances",
      "POST /api/wallet/tip            → tip artist, updates wallet",
      "POST /api/wallet/payout-request → queues for Big Ace (REQUIRED)",
      "GET  /api/economy/shop          → current rotation",
      "POST /api/economy/purchase      → spend points, add to inventory",
      "POST /api/economy/equip         → update loadout",
      "GET  /api/economy/inventory     → user inventory",
      "POST /api/store/checkout        → Stripe checkout session",
    ],
    bigAceGates: [
      "All payout requests → never auto-release",
      "Owner profit distribution → never auto-release",
      "Campaign > $99.99/wk → approval required",
      "Exclusivity deals → always manual review",
    ],
  },

  VENUE: {
    engine: "packages/venue-engine/venue.service.ts",
    powers: [
      "apps/api/src/modules/venues/",
      "apps/api/src/modules/events/",
      "apps/api/src/modules/tickets/",
      "apps/api/src/modules/booking/",
    ],
    calledBy: [
      "GET  /api/venues             → venue list",
      "POST /api/venues             → create venue",
      "POST /api/venues/:id/staff   → assign staff with role + permissions",
      "POST /api/booking/request    → artist requests booking",
      "POST /api/booking/:id/accept → venue accepts",
      "POST /api/tickets/purchase   → buy ticket (max 8 per buyer per event)",
      "POST /api/tickets/:id/scan   → QR scan check-in",
      "GET  /api/events/:id/staff   → show day staff assignments",
    ],
    emitsViaWebSocket: [
      "rooms namespace → lighting_change (host changes preset)",
      "rooms namespace → dj_bpm_update (DJ BPM → lighting pulse)",
    ],
  },

  MEDIA_PIPELINE: {
    engine: "packages/media-pipeline/media.pipeline.ts",
    powers: [
      "apps/api/src/modules/media/",
      "apps/api/src/modules/uploads/",
    ],
    calledBy: [
      "POST /api/media/upload-url      → pre-signed S3/R2 URL",
      "POST /api/media/confirm/:id     → starts pipeline after upload",
      "GET  /api/media/:id/status      → pipeline progress",
      "GET  /api/media/:id             → CDN URL when ready",
    ],
    pipeline: [
      "1. upload_received → virus_scan",
      "2. virus_scan → format_validate",
      "3. format_validate → content_moderation (AI scan)",
      "4. content_moderation → [image: resize] OR [video: transcode] OR [audio: encode]",
      "5. thumbnail_generate → cdn_upload",
      "6. cdn_upload → database_update (Upload model cdnUrl field)",
      "7. database_update → delivery_ready → webhook to calling service",
    ],
    motionClips: "3-second artist cards: webm+mp4, 400×500px, transparent, loop, muted",
  },

  UI_HUD: {
    engine: "packages/ui-hud/ui-hud.engine.ts",
    powers: [
      "apps/web/src/components/scenes/SceneBackdrop.tsx",
      "apps/web/src/components/effects/",
      "apps/web/src/lib/scenes/",
    ],
    calledBy: [
      "SceneBackdrop component reads scene ID from route → loads SCENE_REGISTRY config",
      "WorldSwitcher reads active world → applies accentColor + transitionStyle",
      "VR engine reads isVRCapable flag → enables VR entry button",
      "Broadcast engine signals lower-thirds → HUD renders overlay",
    ],
    scenesByWorld: {
      home1: "magazine",
      home2: "dashboard",
      home3: "live-stage | lobby | underground-cypher | game-night",
      home4: "sponsor-showcase",
      stadium: "stadium-vr | concert-arena",
      vr: "vr-lobby | vr-concert | vr-stadium | all 15 VR scenes",
    },
  },

  AUDIO: {
    engine: "packages/audio-engine/audio.engine.ts",
    powers: [
      "apps/web/src/components/audio/SceneAudio.tsx",
      "packages/vr-engine/SpatialAudio.ts",
    ],
    triggers: [
      "Scene change → crossfade to scene audio profile",
      "Page flip → page-flip.mp3",
      "VHS insert → site entry (vhs-insert.mp3)",
      "Crown event → crown-reveal.mp3",
      "Game round start → round-start.mp3",
      "Winner → winner-fanfare.mp3",
      "Item purchase → purchase.mp3",
      "Reward → reward-unlock.mp3",
      "DJ BPM change → tempo-synced lighting (not audio)",
    ],
    autoplayPolicy: "NEVER assume autoplay. Show mute button if blocked. Mobile defaults to ambient only.",
  },

  VR_ENGINE: {
    engine: "packages/vr-engine/",
    powers: [
      "apps/web/src/app/stadium/",
      "apps/web/src/app/vr/[sceneId]/",
    ],
    connectsTo: {
      rooms: "VR scene = special room type. roomId stored on GameSession / Event.",
      users: "Avatar loadout from UserInventory. AvatarLoadout3D built from OwnedItem records.",
      livestream: "Stage video feed = artist Livestream.playbackUrl via HLS player in Three.js.",
      tickets: "Stadium entry checks Ticket.status === CONFIRMED for seat section assignment.",
      wallet: "Tip jar in VR = POST /api/wallet/tip (coin animation on success ws event).",
      sponsors: "SponsorBoard.mediaUrl = AdCreative.assetUrl. Impressions tracked via POST /api/ads/impressions.",
      scoring: "Game show arena reads GameSession via WebSocket. Scores update on game namespace.",
      realtime: "VR scene joins /rooms WebSocket. Viewer count updates. Hype meter synced.",
      audio: "SpatialAudio sources built from buildStadiumSpatialLayout(). Crown event triggers crown-reveal.mp3.",
    },
    stadiumCapacity: 10000,
    renderingStrategy: "InstancedMesh with 4 LOD levels. Full quality <30m, billboard >80m.",
  },

} as const;

// ══════════════════════════════════════════════════════════
// ENGINE → DATABASE MODEL CONNECTIONS
// ══════════════════════════════════════════════════════════

export const ENGINE_TO_DB_MODELS = {
  REALTIME: ["Room (viewerCount ↑↓)", "RoomMember (join/leave)", "Message (chat)"],
  BROADCAST: ["Livestream", "Room", "GameSession (adBreakActive)"],
  SCORING: ["GameSession", "GamePlayer", "GameRound", "AudienceVote", "CrownRecord", "PointsLedger"],
  ECONOMY: ["Wallet", "Transaction", "PointsLedger", "UserInventory", "OwnedItem", "AvatarLoadout", "ItemDefinition"],
  VENUE: ["Venue", "VenueSection", "VenueRoom", "VenueStaffAssignment", "Event", "TicketTier", "Ticket", "BookingRequest"],
  MEDIA_PIPELINE: ["Upload", "MediaAsset (if separate)"],
  UI_HUD: ["FeatureFlag (scene overrides)", "Room (scene field)"],
  AUDIO: ["Room (djEnabled, djBpm)", "Livestream"],
  VR_ENGINE: ["Room", "RoomMember", "User", "UserInventory", "AvatarLoadout", "Ticket", "Livestream", "GameSession", "Placement (sponsor boards)"],
} as const;

// ══════════════════════════════════════════════════════════
// ENGINE → WEBSOCKET NAMESPACE MAP
// ══════════════════════════════════════════════════════════

export const ENGINE_TO_WS_NAMESPACE = {
  REALTIME:  ["/rooms", "/games", "/chat", "/notifications", "/crown", "/hype", "/ads"],
  BROADCAST: ["/rooms (lighting_change, ad_break_start)"],
  SCORING:   ["/games (score_update, round_winner, points_awarded)", "/crown (crown_awarded)"],
  ECONOMY:   ["/notifications (reward unlocked, item purchased)"],
  VENUE:     ["/rooms (lighting_change, dj_bpm_update)"],
  VR_ENGINE: ["/rooms (join as VR member)", "/games (VR game sessions)"],
} as const;

// ══════════════════════════════════════════════════════════
// ENGINE → FRONTEND ROUTE MAP
// ══════════════════════════════════════════════════════════

export const ENGINE_TO_FRONTEND_ROUTES = {
  REALTIME: [
    "/lobby                → live lobby wall, viewer counts",
    "/live/[roomId]        → room viewer count, chat",
    "/games/[sessionId]    → game scoring in real-time",
  ],
  BROADCAST: [
    "/live/[roomId]        → HLS player, broadcaster overlay, lower-thirds",
    "/live/[roomId]/control→ host controls (broadcaster personality, lighting)",
  ],
  SCORING: [
    "/leaderboards         → live leaderboard with flame ranks",
    "/games/[id]/scoreboard→ live game scoreboard",
    "/results/[id]         → final results with explanation",
    "/hall-of-fame         → crown winners archive",
  ],
  ECONOMY: [
    "/shop                 → item shop with rotation",
    "/shop/avatar          → avatar cosmetics",
    "/inventory            → owned items, loadouts",
    "/wallet               → balance, transactions",
    "/points               → point history, daily caps",
    "/rewards              → reward claims",
  ],
  VENUE: [
    "/venues               → venue directory",
    "/venues/[slug]        → venue detail + rooms",
    "/venues/signup        → venue onboarding",
    "/booking              → booking requests",
    "/events/[id]          → event detail + lineup",
    "/events/[id]/tickets  → ticket purchase",
    "/tickets              → my tickets with QR codes",
    "/scanner/checkin      → QR scan operator interface",
  ],
  MEDIA_PIPELINE: [
    "/dashboard/artist/uploads → artist media upload",
    "/avatar-lab           → face scan + avatar creation",
  ],
  UI_HUD: [
    "ALL routes            → SceneBackdrop wraps every page",
  ],
  AUDIO: [
    "ALL routes            → SceneAudio component loads audio profile",
    "/games/*              → game-specific sound events",
  ],
  VR_ENGINE: [
    "/stadium              → Stadium page + VR entry",
    "/vr/lobby             → VR lobby",
    "/vr/concert           → VR concert",
    "/vr/cypher            → VR cypher arena",
    "/vr/gameshow          → VR game show",
    "/vr/store             → VR item store",
    "/vr/theater           → VR replay theater",
    "/vr/[sceneId]         → any VR scene by ID",
  ],
} as const;
