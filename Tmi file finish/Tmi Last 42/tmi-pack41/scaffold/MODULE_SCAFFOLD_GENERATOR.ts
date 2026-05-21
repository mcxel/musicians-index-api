// COMPLETE MODULE SCAFFOLD GENERATOR
// Run this script to generate all 25 NestJS module folders at once.
// Each module gets: controller, service, module, dto, repository, spec.
// Blackbox fills in the business logic.

import * as fs from "fs";
import * as path from "path";

const MODULES_BASE = "apps/api/src/modules";

// Every module the platform needs
const MODULES = [
  // ── AUTH LAYER ──────────────────────────────────────────
  {
    name: "auth",
    routes: ["POST /login", "POST /register", "POST /logout", "POST /refresh", "GET /me", "POST /verify-email/:token", "POST /forgot-password", "POST /reset-password"],
    models: ["User", "Session", "Account"],
    guards: ["JwtAuthGuard", "RolesGuard"],
    platformLaws: [],
  },
  // ── USERS ───────────────────────────────────────────────
  {
    name: "users",
    routes: ["GET /users/:id", "PATCH /users/:id", "DELETE /users/:id", "GET /users/:id/profile"],
    models: ["User", "Profile", "FanProfile"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #2: Diamond users never billed"],
  },
  // ── ARTISTS ─────────────────────────────────────────────
  {
    name: "artists",
    routes: ["GET /artists", "GET /artists/:slug", "POST /artists", "PATCH /artists/:slug", "GET /artists/:slug/articles", "GET /artists/:slug/stats"],
    models: ["Artist", "ArtistMember"],
    guards: ["JwtAuthGuard", "ArtistGuard"],
    platformLaws: ["Law #9: Article pages MUST link to artist station", "Law #14: Auto-create article on profile completion"],
    onProfileComplete: "Trigger auto-article creation + station slug creation",
  },
  // ── VENUES ──────────────────────────────────────────────
  {
    name: "venues",
    routes: ["GET /venues", "GET /venues/:slug", "POST /venues", "PATCH /venues/:slug", "POST /venues/:id/staff", "GET /venues/:id/rooms", "GET /venues/:id/sections"],
    models: ["Venue", "VenueSection", "VenueRoom", "VenueManager", "VenueStaffAssignment"],
    guards: ["JwtAuthGuard", "VenueManagerGuard"],
    platformLaws: [],
  },
  // ── EVENTS ──────────────────────────────────────────────
  {
    name: "events",
    routes: ["GET /events", "GET /events/:id", "POST /events", "PATCH /events/:id", "GET /events/:id/lineup", "GET /events/:id/staff", "GET /events/:id/ticket-tiers"],
    models: ["Event", "ArtistEvent", "VenueStaffAssignment"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
  },
  // ── TICKETS ─────────────────────────────────────────────
  {
    name: "tickets",
    routes: ["GET /tickets/mine", "GET /tickets/:id", "POST /tickets/purchase-intent", "POST /tickets/purchase", "POST /tickets/:code/scan", "POST /tickets/:id/transfer"],
    models: ["Ticket", "TicketTier", "Order"],
    guards: ["JwtAuthGuard", "ScannerGuard"],
    platformLaws: ["Law #4: Max 8 tickets per buyer per event — enforce in service + DB"],
  },
  // ── ORDERS ──────────────────────────────────────────────
  {
    name: "orders",
    routes: ["GET /orders/mine", "GET /orders/:id", "POST /orders/:id/refund"],
    models: ["Order", "OrderItem", "Transaction"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #5: Payout from NET PROFIT only"],
  },
  // ── WALLET ──────────────────────────────────────────────
  {
    name: "wallet",
    routes: ["GET /wallet/mine", "GET /wallet/transactions", "POST /wallet/tip", "POST /wallet/payout-request"],
    models: ["Wallet", "Transaction"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #5: ALL payout-requests require Big Ace approval — NEVER auto-release"],
    bigAceGates: ["payout-request", "owner-distribution", "refund > $50"],
  },
  // ── POINTS ──────────────────────────────────────────────
  {
    name: "points",
    routes: ["GET /points/mine", "GET /points/history", "POST /points/earn (internal)"],
    models: ["PointsLedger"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
    caps: { MAX_DAILY: 500, MAX_WEEKLY: 2000, MAX_PER_EVENT: 100 },
  },
  // ── ECONOMY (Shop + Inventory) ───────────────────────────
  {
    name: "economy",
    routes: ["GET /economy/shop", "POST /economy/purchase", "GET /economy/inventory", "POST /economy/equip", "GET /economy/loadout", "POST /economy/loadout"],
    models: ["ItemDefinition", "UserInventory", "OwnedItem", "AvatarLoadout"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
  },
  // ── ARTICLES ────────────────────────────────────────────
  {
    name: "articles",
    routes: ["GET /articles", "GET /articles/:slug", "POST /articles", "PATCH /articles/:slug", "POST /articles/:id/like", "GET /articles/:id/comments"],
    models: ["Article", "ArticleComment", "ArticleLike", "Tag"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #9: stationSlug field MUST be populated if article has author", "Law #14: Auto-create on artist profile completion"],
  },
  // ── ADS ─────────────────────────────────────────────────
  {
    name: "ads",
    routes: ["GET /ads/slot/:zoneId", "POST /ads/impressions", "POST /ads/clicks", "GET /ads/campaigns", "POST /ads/campaigns", "GET /ads/creatives/:id"],
    models: ["Campaign", "AdCreative", "Placement", "AnalyticsEvent"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #7: GET /ads/slot/:zoneId ALWAYS returns 200 — 5-level fallback, NEVER blank"],
    fallbackChain: ["paid_campaign", "zone_expansion", "crown_winner_spotlight", "undiscovered_artist", "tmi_brand_card"],
  },
  // ── ROOMS ───────────────────────────────────────────────
  {
    name: "rooms",
    routes: ["GET /rooms", "GET /rooms/:id", "POST /rooms", "POST /rooms/:id/join", "POST /rooms/:id/leave", "GET /rooms/:id/members"],
    models: ["Room", "RoomMember"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #1: ORDER BY viewer_count ASC NULLS FIRST — NEVER change this sort", "Law #8: Room stays active even with 0 members"],
    criticalIndex: "@@index([viewerCount]) — 0 viewers = position 1 ALWAYS",
  },
  // ── LIVESTREAM ───────────────────────────────────────────
  {
    name: "livestream",
    routes: ["POST /livestream/start", "POST /livestream/end", "GET /livestream/:id", "GET /livestream/:id/playback"],
    models: ["Livestream", "Room"],
    guards: ["JwtAuthGuard", "ArtistGuard"],
    platformLaws: [],
  },
  // ── GAMES ───────────────────────────────────────────────
  {
    name: "games",
    routes: ["GET /games", "POST /games", "GET /games/:id", "POST /games/:id/join", "POST /games/:id/vote", "POST /games/:id/score", "POST /games/:id/round/next", "POST /games/:id/complete"],
    models: ["GameSession", "GamePlayer", "GameRound", "AudienceVote"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
    fraudRule: "@@unique([sessionId, userId, round]) on AudienceVote — 1 vote per user per round",
  },
  // ── SCORING ─────────────────────────────────────────────
  {
    name: "scoring",
    routes: ["GET /scoring/leaderboard/:type", "GET /scoring/crown", "GET /scoring/history/:userId", "POST /scoring/points (internal only)"],
    models: ["PointsLedger", "CrownRecord", "GameRound"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
  },
  // ── CHAT ────────────────────────────────────────────────
  {
    name: "chat",
    routes: ["GET /chat/conversations", "GET /chat/conversations/:id/messages", "POST /chat/conversations/:id/messages"],
    models: ["Conversation", "ConversationMember", "Message"],
    guards: ["JwtAuthGuard"],
    platformLaws: ["Law #3: canSendMessage() MUST run before every message — kids only talk to kids"],
    canSendMessageCheck: "canSendMessage(senderId, receiverId) → false if adult↔unlinked-child",
  },
  // ── NOTIFICATIONS ────────────────────────────────────────
  {
    name: "notifications",
    routes: ["GET /notifications", "POST /notifications/:id/read", "POST /notifications/read-all"],
    models: ["Notification"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
  },
  // ── MEDIA ───────────────────────────────────────────────
  {
    name: "media",
    routes: ["POST /media/upload-url", "POST /media/confirm/:id", "GET /media/:id/status", "GET /media/:id"],
    models: ["Upload"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
    pipeline: "upload → virus_scan → validate → moderate → resize/transcode → CDN → DB update",
  },
  // ── SEARCH ──────────────────────────────────────────────
  {
    name: "search",
    routes: ["GET /search?q=&type=artist|article|event|venue|item"],
    models: [],
    guards: [],
    platformLaws: [],
    provider: "Meilisearch (recommended) or Algolia",
  },
  // ── ANALYTICS ───────────────────────────────────────────
  {
    name: "analytics",
    routes: ["POST /analytics/events", "GET /analytics/campaigns/:id", "GET /analytics/dashboard (admin)"],
    models: ["AnalyticsEvent"],
    guards: ["JwtAuthGuard"],
    platformLaws: [],
  },
  // ── BOTS ────────────────────────────────────────────────
  {
    name: "bots",
    routes: ["GET /bots/status", "POST /bots/:id/pause", "POST /bots/:id/resume", "GET /bots/:id/logs"],
    models: ["Bot", "BotTask", "BotLog"],
    guards: ["AdminGuard"],
    platformLaws: ["ALL bots must respect BOT_SAFETY_RULES from bot-orchestrator.ts"],
  },
  // ── ADMIN ───────────────────────────────────────────────
  {
    name: "admin",
    routes: ["GET /admin/users", "PATCH /admin/users/:id", "GET /admin/events", "GET /admin/campaigns", "POST /admin/campaigns/:id/approve", "GET /admin/audit-logs"],
    models: ["AdminAuditLog", "User", "Campaign"],
    guards: ["AdminGuard"],
    platformLaws: ["Law #2: Never remove Diamond from Marcel (berntmusic33@gmail.com) or BJ M Beat's"],
  },
  // ── MODERATION ──────────────────────────────────────────
  {
    name: "moderation",
    routes: ["POST /moderation/reports", "GET /moderation/queue", "POST /moderation/actions"],
    models: ["ModerationReport", "ModerationActionRecord"],
    guards: ["ModeratorGuard"],
    platformLaws: [],
  },
  // ── DEVICE-PAIRING ──────────────────────────────────────
  {
    name: "device-pairing",
    routes: ["POST /device/pair/request", "POST /device/pair/confirm", "GET /device/pair/:code", "POST /device/handoff"],
    models: ["DeviceLinkSession"],
    guards: [],
    platformLaws: [],
  },
  // ── FEATURE-FLAGS ────────────────────────────────────────
  {
    name: "feature-flags",
    routes: ["GET /feature-flags", "GET /feature-flags/:key", "PATCH /feature-flags/:key (admin)"],
    models: ["FeatureFlag"],
    guards: ["AdminGuard"],
    platformLaws: [],
  },
] as const;

// Module file template generator
function generateModuleFiles(mod: typeof MODULES[number]) {
  const { name } = mod;
  const pascal = name.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("");

  return {
    [`${name}.controller.ts`]: `
// apps/api/src/modules/${name}/${name}.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ${pascal}Service } from "./${name}.service";

@Controller("${name}")
export class ${pascal}Controller {
  constructor(private readonly service: ${pascal}Service) {}
  // Routes: ${(mod.routes as readonly string[]).join(", ")}
}`,
    [`${name}.service.ts`]: `
// apps/api/src/modules/${name}/${name}.service.ts
import { Injectable } from "@nestjs/common";
import { ${pascal}Repository } from "./${name}.repository";
${(mod as any).platformLaws?.length ? `
// PLATFORM LAWS TO ENFORCE:
${(mod as any).platformLaws.map((l: string) => `// ${l}`).join("\n")}
` : ""}
@Injectable()
export class ${pascal}Service {
  constructor(private readonly repo: ${pascal}Repository) {}
}`,
    [`${name}.module.ts`]: `
// apps/api/src/modules/${name}/${name}.module.ts
import { Module } from "@nestjs/common";
import { ${pascal}Controller } from "./${name}.controller";
import { ${pascal}Service } from "./${name}.service";
import { ${pascal}Repository } from "./${name}.repository";

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service, ${pascal}Repository],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}`,
    [`${name}.repository.ts`]: `
// apps/api/src/modules/${name}/${name}.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ${pascal}Repository {
  constructor(private readonly prisma: PrismaService) {}
  // Models: ${(mod.models as readonly string[]).join(", ")}
}`,
    [`dto/create-${name}.dto.ts`]: `
// apps/api/src/modules/${name}/dto/create-${name}.dto.ts
export class Create${pascal}Dto {}`,
    [`dto/update-${name}.dto.ts`]: `
// apps/api/src/modules/${name}/dto/update-${name}.dto.ts
export class Update${pascal}Dto {}`,
    [`${name}.spec.ts`]: `
// apps/api/src/modules/${name}/${name}.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { ${pascal}Service } from "./${name}.service";

describe("${pascal}Service", () => {
  let service: ${pascal}Service;
  it("should be defined", () => expect(service).toBeDefined());
});`,
  };
}

// Export the module list for Blackbox
export { MODULES, generateModuleFiles };
// Total modules: 25
// Total routes: ${MODULES.reduce((acc, m) => acc + m.routes.length, 0)}+
