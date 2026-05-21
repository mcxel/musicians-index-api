// packages/integration/ALL_SYSTEM_CHAINS.ts
// Every system chain in the platform.
// A chain is a sequence of events/operations that must complete in order.
// Blackbox implements the chain logic. Engines handle the heavy lifting.

export type ChainStep = {
  step: number;
  action: string;
  module: string;
  emits?: string;      // WebSocket event emitted
  triggers?: string;   // next chain triggered
  bigAceRequired?: boolean;
  platformLaw?: string;
};

export type Chain = {
  id: string;
  name: string;
  trigger: string;
  steps: ChainStep[];
};

// ══════════════════════════════════════════════════════════
export const ALL_CHAINS: Chain[] = [

  // ── AUTH CHAIN ──────────────────────────────────────────
  {
    id: "auth",
    name: "Authentication Chain",
    trigger: "User attempts login",
    steps: [
      { step:1, action:"Validate credentials / OAuth token", module:"auth" },
      { step:2, action:"Create Session record with deviceType", module:"auth" },
      { step:3, action:"Issue JWT access + refresh tokens", module:"auth" },
      { step:4, action:"Update User.lastLoginAt", module:"users" },
      { step:5, action:"Earn daily_login +5 pts if new day", module:"points" },
      { step:6, action:"Check Diamond status (billing-integrity-bot verifies every 4h)", module:"users", platformLaw:"Law #2" },
    ],
  },

  // ── ARTIST ONBOARDING CHAIN ────────────────────────────
  {
    id: "artist-onboarding",
    name: "Artist Profile Creation Chain",
    trigger: "Artist completes onboarding form",
    steps: [
      { step:1, action:"Create Artist record with slug + stationSlug", module:"artists" },
      { step:2, action:"Create Profile record linked to User", module:"profiles" },
      { step:3, action:"Auto-create Article: 'Meet [ArtistName]'", module:"articles", platformLaw:"Law #14" },
      { step:4, action:"Set Article.stationSlug = artist.stationSlug", module:"articles", platformLaw:"Law #9" },
      { step:5, action:"Publish Article (status: PUBLISHED)", module:"articles" },
      { step:6, action:"Notification: 'Your profile is live!'", module:"notifications", emits:"/notifications" },
      { step:7, action:"search-index.bot: index artist in search", module:"bots" },
      { step:8, action:"artist-onboarding.bot: send checklist email", module:"bots" },
    ],
  },

  // ── TICKET PURCHASE CHAIN ──────────────────────────────
  {
    id: "ticket-purchase",
    name: "Ticket Purchase Chain",
    trigger: "Fan clicks Buy Ticket",
    steps: [
      { step:1, action:"Validate quantity ≤ 8 per buyer per event", module:"tickets", platformLaw:"Law #4" },
      { step:2, action:"Create temporary seat hold (30 min)", module:"tickets" },
      { step:3, action:"Create Stripe PaymentIntent", module:"wallet" },
      { step:4, action:"Fan completes Stripe payment form" },
      { step:5, action:"Stripe webhook: payment_intent.succeeded", module:"orders" },
      { step:6, action:"Create Order (status: PAID)", module:"orders" },
      { step:7, action:"Create Ticket records (status: CONFIRMED)", module:"tickets" },
      { step:8, action:"Create Transaction (type: PURCHASE)", module:"wallet" },
      { step:9, action:"Generate QR code via media-pipeline", module:"media" },
      { step:10, action:"Email: 'Your tickets for [Event]' with QR", module:"notifications" },
      { step:11, action:"Earn purchase_item +5 pts", module:"points" },
      { step:12, action:"If VR Stadium: VR seat assignment queued", module:"bots" },
    ],
  },

  // ── LIVESTREAM CHAIN ────────────────────────────────────
  {
    id: "livestream",
    name: "Artist Goes Live Chain",
    trigger: "Artist clicks Go Live",
    steps: [
      { step:1, action:"Create Livestream record + stream key", module:"livestream" },
      { step:2, action:"Create Room (roomType: LIVE_STAGE, isLive: true)", module:"rooms" },
      { step:3, action:"Artist pushes RTMP to ingest URL", module:"livestream" },
      { step:4, action:"Media server transcodes to HLS (5 quality variants)", module:"media" },
      { step:5, action:"Emit host_started to /rooms WebSocket", module:"rooms", emits:"/rooms" },
      { step:6, action:"Lobby wall re-sorts: viewers_asc (0 viewers = pos 1)", module:"rooms", platformLaw:"Law #1" },
      { step:7, action:"Earn went_live +30 pts", module:"points" },
      { step:8, action:"notification.bot: alert followers 'Artist is Live!'", module:"bots" },
      { step:9, action:"live-pulse.bot: monitors stream health", module:"bots" },
      { step:10, action:"Sponsor ad slot: LIVE_ROOM_OVERLAY fills (always 200)", module:"ads", platformLaw:"Law #7" },
      { step:11, action:"On end: replay pipeline → HLS VOD in 10-30min", module:"media" },
      { step:12, action:"On end: archivist.bot snapshots session stats", module:"bots" },
      { step:13, action:"On end: editorial-assembly.bot drafts recap article", module:"bots" },
    ],
  },

  // ── GAME SCORING CHAIN ────────────────────────────────
  {
    id: "game-scoring",
    name: "Game Session Scoring Chain",
    trigger: "Host starts game session",
    steps: [
      { step:1, action:"Create GameSession (status: LOBBY)", module:"games" },
      { step:2, action:"Players join (GamePlayer records)", module:"games" },
      { step:3, action:"Earn enter_game +20 pts each player", module:"points" },
      { step:4, action:"Round starts: GameRound created, timer fires", module:"games", emits:"/games" },
      { step:5, action:"Audience votes: AudienceVote (1 per user per round)", module:"games" },
      { step:6, action:"Round ends: scoring.service calculates winner", module:"scoring" },
      { step:7, action:"If tie: apply TIEBREAK_ORDER (speed → round → judge → revote → sudden → coin)", module:"scoring" },
      { step:8, action:"Intermission: ad break fires (always 200)", module:"ads", platformLaw:"Law #7" },
      { step:9, action:"Final: scoring.service picks overall winner", module:"scoring" },
      { step:10, action:"Winner: points awarded (win_full_game +150)", module:"points", emits:"/games" },
      { step:11, action:"Winner: legendary avatar_effect item generated", module:"economy" },
      { step:12, action:"If crown game: CrownRecord + crown animation 3000ms", module:"scoring", emits:"/crown", platformLaw:"Law #2" },
      { step:13, action:"Leaderboard refresh + flame levels recalculated", module:"scoring" },
      { step:14, action:"End screen ad slot fires (always 200)", module:"ads", platformLaw:"Law #7" },
      { step:15, action:"archivist.bot: session archived", module:"bots" },
    ],
  },

  // ── SPONSOR DEAL CHAIN ─────────────────────────────────
  {
    id: "sponsor-deal",
    name: "Sponsor Campaign Chain",
    trigger: "Sponsor creates account or prospect-scout.bot finds lead",
    steps: [
      { step:1, action:"Sponsor registers or bot generates lead", module:"sponsors" },
      { step:2, action:"proposal.bot generates package options (max auto: $99.99/wk)", module:"bots" },
      { step:3, action:"If deal > $99.99/wk OR exclusivity: Big Ace review REQUIRED", module:"admin", bigAceRequired:true },
      { step:4, action:"Campaign created (status: PENDING_APPROVAL)", module:"ads" },
      { step:5, action:"Ad creatives uploaded → media-pipeline → CDN", module:"media" },
      { step:6, action:"brand-safety.bot reviews creatives", module:"bots" },
      { step:7, action:"Admin approves → Campaign status: ACTIVE", module:"admin" },
      { step:8, action:"ad-placement.bot assigns creatives to zones", module:"bots" },
      { step:9, action:"house-ad-fallback.bot deactivates (paid ad takes slot)", module:"bots" },
      { step:10, action:"sponsor-matching.bot: pair with local artist if local package", module:"bots" },
      { step:11, action:"Sponsorship record created: artist + sponsor linked", module:"sponsors" },
      { step:12, action:"SponsorCoachingSticky: artist notified of sponsor tasks", module:"notifications" },
      { step:13, action:"7 days before expiry: renewal.bot fires renewal offer", module:"bots" },
      { step:14, action:"Item generation trigger: new_sponsor_campaign → rare item (500 qty)", module:"economy" },
    ],
  },

  // ── WEEKLY CROWN CHAIN ─────────────────────────────────
  {
    id: "weekly-crown",
    name: "Weekly Crown Pipeline",
    trigger: "Sunday midnight — weekly cycle resets",
    steps: [
      { step:1, action:"crown.bot evaluates this week's cypher battle winner", module:"bots" },
      { step:2, action:"Create CrownRecord (weekNumber, artistId, genre)", module:"scoring" },
      { step:3, action:"Previous crown holder loses crown (decayAfterWeeks: 1)", module:"scoring" },
      { step:4, action:"Emit crown_awarded to /crown namespace", module:"scoring", emits:"/crown" },
      { step:5, action:"Frontend: crown pops onto artist head (animationDurationMs: 3000)", module:"ui-hud", platformLaw:"Law: always 3000ms" },
      { step:6, action:"Crown winner exclusive badge generated (1 qty)", module:"economy" },
      { step:7, action:"hallOfFame.bot: snapshots winner into Hall of Fame", module:"bots" },
      { step:8, action:"editorial-assembly.bot: 'New Crown Champion' article with stationSlug", module:"bots", platformLaw:"Law #9" },
      { step:9, action:"Home 1 cover updates: new crown winner in center card", module:"ui-hud" },
      { step:10, action:"leaderboard.bot: refreshes weekly_crown board", module:"bots" },
      { step:11, action:"Notification to all followers: '[Artist] won the crown!'", module:"notifications" },
    ],
  },

  // ── ITEM ECONOMY CHAIN ─────────────────────────────────
  {
    id: "item-economy",
    name: "Living Item Economy Chain",
    trigger: "Daily midnight + platform events",
    steps: [
      { step:1, action:"daily-drop.bot: rotates daily_featured shop zone (12 slots)", module:"bots" },
      { step:2, action:"Economy engine: selects items by rarity_weighted strategy", module:"economy" },
      { step:3, action:"ShopRotation record created (startsAt, endsAt: +24h)", module:"economy" },
      { step:4, action:"WebSocket /ads: ad_rotation event → shop banners update", module:"realtime" },
      { step:5, action:"When platform event triggers: item-generator.bot creates new item", module:"bots" },
      { step:6, action:"Fan buys item: POST /economy/purchase", module:"economy" },
      { step:7, action:"Deduct points from PointsLedger (daily cap enforced)", module:"points" },
      { step:8, action:"OwnedItem created in UserInventory", module:"economy" },
      { step:9, action:"Notification: 'You got a [RARE] Crown Hat!'", module:"notifications" },
      { step:10, action:"Fan equips: POST /economy/equip → AvatarLoadout updated", module:"economy" },
      { step:11, action:"VR engine: loadout synced to avatar in any VR scene", module:"vr-engine" },
      { step:12, action:"Pity timer check: epic after 50 drops, legendary after 200", module:"economy" },
    ],
  },

  // ── MEDIA UPLOAD CHAIN ─────────────────────────────────
  {
    id: "media-upload",
    name: "Media Upload Chain",
    trigger: "User uploads any media asset",
    steps: [
      { step:1, action:"POST /media/upload-url → pre-signed S3/R2 URL issued", module:"media" },
      { step:2, action:"Client uploads directly to storage URL", module:"media" },
      { step:3, action:"POST /media/confirm/:id → starts pipeline", module:"media" },
      { step:4, action:"virus_scan: ClamAV or API scan", module:"media" },
      { step:5, action:"format_validate: MIME type + magic bytes", module:"media" },
      { step:6, action:"content_moderation: AI scan for harmful content", module:"media" },
      { step:7, action:"[Image]: resize to all required dimensions", module:"media" },
      { step:8, action:"[Video]: transcode to HLS (1080p, 720p, 480p, 360p, 240p)", module:"media" },
      { step:9, action:"[Audio]: encode AAC + generate waveform PNG", module:"media" },
      { step:10, action:"thumbnail_generate: video frame → thumbnail", module:"media" },
      { step:11, action:"cdn_upload: push all variants to CDN", module:"media" },
      { step:12, action:"database_update: Upload.cdnUrl + Upload.thumbnailUrl", module:"media" },
      { step:13, action:"Webhook → calling service notified: delivery_ready", module:"media" },
    ],
  },

  // ── AD ROTATION CHAIN ──────────────────────────────────
  {
    id: "ad-rotation",
    name: "Ad Rotation Chain — Platform Law #7",
    trigger: "Any page load with ad zone OR timer fires",
    steps: [
      { step:1, action:"GET /ads/slot/:zoneId called by any page", module:"ads" },
      { step:2, action:"Level 1: Query active paid campaign for exact zone", module:"ads" },
      { step:3, action:"Level 2: If not found, expand to any active campaign", module:"ads" },
      { step:4, action:"Level 3: If not found, return crown winner spotlight", module:"ads" },
      { step:5, action:"Level 4: If not found, return undiscovered artist (0 viewers)", module:"ads", platformLaw:"Law #1+#7" },
      { step:6, action:"Level 5: TMI brand house ad — ALWAYS returns 200", module:"ads", platformLaw:"Law #7" },
      { step:7, action:"IntersectionObserver: 50% visible > 1sec → POST /ads/impressions", module:"ads" },
      { step:8, action:"Click: POST /ads/clicks → CTR recalculated", module:"ads" },
      { step:9, action:"ctr-optimizer.bot: adjusts placement weights hourly", module:"bots" },
      { step:10, action:"If budget exhausted: campaign-expiration.bot → EXPIRED status", module:"bots" },
      { step:11, action:"house-ad-fallback.bot: immediately fills vacated zone", module:"bots" },
    ],
  },

  // ── NOTIFICATION CHAIN ─────────────────────────────────
  {
    id: "notification",
    name: "Notification Dispatch Chain",
    trigger: "Any platform event that requires user notification",
    steps: [
      { step:1, action:"Service creates Notification record (channel: IN_APP)", module:"notifications" },
      { step:2, action:"Emit to /notifications WebSocket → in-app badge updates", module:"notifications", emits:"/notifications" },
      { step:3, action:"notification.bot queues email if channel: EMAIL", module:"bots" },
      { step:4, action:"email.queue processes: send via Resend/SendGrid", module:"bots" },
      { step:5, action:"push.queue processes: Firebase FCM or Web Push", module:"bots" },
      { step:6, action:"Notification marked: sentAt = now()", module:"notifications" },
    ],
  },

  // ── MODERATION CHAIN ───────────────────────────────────
  {
    id: "moderation",
    name: "Content Moderation Chain",
    trigger: "User reports content OR AI flag OR velocity alert",
    steps: [
      { step:1, action:"ModerationReport created (status: open)", module:"moderation" },
      { step:2, action:"moderation.bot: auto-review common violations", module:"bots" },
      { step:3, action:"If auto-resolved: status → resolved, action logged", module:"moderation" },
      { step:4, action:"If escalated: moderator notified via notification chain", module:"notifications" },
      { step:5, action:"Moderator reviews in /admin/moderation queue", module:"admin" },
      { step:6, action:"Action applied: warning | mute | suspend | ban", module:"moderation" },
      { step:7, action:"ModerationAction created with expiresAt if temporary", module:"moderation" },
      { step:8, action:"AdminAuditLog: action recorded for accountability", module:"admin" },
    ],
  },

];

// Total chains: 12
// Total steps across all chains: 100+
export type ChainId = typeof ALL_CHAINS[number]["id"];
