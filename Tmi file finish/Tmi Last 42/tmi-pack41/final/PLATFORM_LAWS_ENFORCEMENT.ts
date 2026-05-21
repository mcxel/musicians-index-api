// PLATFORM_LAWS_ENFORCEMENT.ts
// The 15 permanent platform laws with exact enforcement points.
// These are NEVER changed regardless of feature requests.
// Every new developer reads this file first.

export const PLATFORM_LAWS = [
  {
    law: 1,
    rule: "Discovery-first: 0 viewers = position 1 in lobby ALWAYS",
    enforcement: [
      "GET /api/rooms → ORDER BY viewer_count ASC NULLS FIRST",
      "rooms.gateway.ts LobbyUpdateEvent.sortedBy = 'viewer_count_asc' (locked string)",
      "lib/utils/discovery-sort.ts → only export ascending sort",
      "NEVER allow sort to be changed by any parameter, user preference, or admin flag",
    ],
    locked: true,
  },
  {
    law: 2,
    rule: "Permanent Diamond: Marcel Dickens (berntmusic33@gmail.com) + B.J. M Beat's — forever, verified every 4h",
    enforcement: [
      "packages/db/prisma/seed.ts → isPermanentDiamond: true for both users",
      "billing-integrity.bot.ts → runs every 4h, resets to DIAMOND if ever changed",
      "admin/users service → rejects any attempt to remove Diamond from these users",
      "Never auto-bill, charge, or downgrade permanent Diamond users",
    ],
    locked: true,
  },
  {
    law: 3,
    rule: "Kids only talk to kids — canSendMessage middleware gates all message flows",
    enforcement: [
      "chat.gateway.ts → canSendMessage(senderId, receiverId) before every emit",
      "Returns false + blocks if adult↔unlinked-child",
      "ConversationMember.canSendMessage field used as DB gate",
      "COPPA compliance: under-13 users cannot be messaged by adults",
    ],
    locked: true,
  },
  {
    law: 4,
    rule: "Max 8 tickets per buyer per event",
    enforcement: [
      "POST /api/tickets/purchase-intent → validate quantity + existing tickets ≤ 8",
      "TicketTier.maxPerBuyer DB field = 8 (default, never override higher)",
      "Frontend: quantity picker max capped at 8",
    ],
    locked: true,
  },
  {
    law: 5,
    rule: "Owner payouts from NET PROFIT only — never gross",
    enforcement: [
      "wallet.service.ts → BIG_ACE_GATES.payoutRequest = true ALWAYS",
      "POST /wallet/payout-request → creates pending request, NEVER auto-releases",
      "admin/finance/profit page → Big Ace reviews and approves weekly",
      "EarningsRecord calculation: gross - Stripe fees - artist payouts - ops costs = distributable",
    ],
    locked: true,
  },
  {
    law: 6,
    rule: "TMI visual identity: #0D0520, Bebas Neue, cyan/gold/pink — NEVER generic SaaS",
    enforcement: [
      "packages/ui-hud/ui-hud.engine.ts → SCENE_REGISTRY primaryColor hardcoded",
      "All components import design tokens — never override with generic blue/gray",
    ],
    locked: true,
  },
  {
    law: 7,
    rule: "GET /api/ads/slot/:id ALWAYS returns 200 — never blank",
    enforcement: [
      "ads.controller.ts → 5-level fallback chain in try/catch",
      "Level 5: TMI brand house ad always available",
      "Never return 204 / 404 / empty body from this endpoint",
      "house-ad-fallback.bot.ts → fills empty zones immediately on campaign expiry",
    ],
    locked: true,
  },
  {
    law: 8,
    rule: "Party persists when members enter/exit rooms",
    enforcement: [
      "Room.isActive = true even when viewerCount = 0",
      "Room only closes when host explicitly ends it (POST /rooms/:id/close)",
      "RoomMember.leftAt set on leave, but room stays active",
    ],
    locked: true,
  },
  {
    law: 9,
    rule: "Article pages ALWAYS link to artist station",
    enforcement: [
      "Article model → stationSlug field REQUIRED when authorId present",
      "articles.service.ts → validates stationSlug present before PUBLISHED status",
      "Article page template → renders station link in sidebar ALWAYS",
      "auto-article creation (Law #14) → stationSlug auto-populated from Artist.stationSlug",
    ],
    locked: true,
  },
  {
    law: 10,
    rule: "'Stations' not 'Channels' in all public UI",
    enforcement: [
      "All UI strings: 'Station' never 'Channel'",
      "Route: /stations/[slug] never /channels/[slug]",
      "DB: Artist.stationSlug never channelSlug",
    ],
    locked: true,
  },
  {
    law: 11,
    rule: "Coaching sticky notes on artist dashboard",
    enforcement: [
      "SponsorCoachingSticky component (Pack 34) renders on /dashboard/artist",
      "earnings-coaching.engine.ts returns up to 10 contextual notes",
      "Notes include sponsor task reminders, payment tips, discovery advice",
    ],
    locked: true,
  },
  {
    law: 12,
    rule: "No system should break another system — isolated modules only",
    enforcement: [
      "No circular imports between modules",
      "Each module exports only its Service via exports array",
      "Engines are in packages/, not imported directly between modules",
    ],
    locked: true,
  },
  {
    law: 13,
    rule: "If a page exceeds 5 major zones, create child routes",
    enforcement: [
      "Route structure: pages with > 5 belts get sub-routes",
      "Example: /admin → /admin/users, /admin/bots, etc.",
      "Prevents single mega-pages that are hard to maintain",
    ],
    locked: true,
  },
  {
    law: 14,
    rule: "Artist articles auto-create on profile completion",
    enforcement: [
      "artists.service.ts onProfileComplete() hook fires when slug + bio + stationSlug set",
      "Auto-creates Article: title='Meet [stageName]', isAutoGenerated: true",
      "Sets Article.stationSlug from Artist.stationSlug (Law #9)",
      "Publishes immediately (status: PUBLISHED)",
    ],
    locked: true,
  },
  {
    law: 15,
    rule: "Freshness engine prevents same content repeating on same surface",
    enforcement: [
      "freshness.engine.ts (Pack 33) tracks last_seen per content per surface",
      "Belt composition queries exclude recently shown content",
      "homepage-rotation.bot uses freshness scores for selection",
    ],
    locked: true,
  },
] as const;

// Quick lookup
export function getPlatformLaw(n: number) {
  return PLATFORM_LAWS.find(l => l.law === n);
}
