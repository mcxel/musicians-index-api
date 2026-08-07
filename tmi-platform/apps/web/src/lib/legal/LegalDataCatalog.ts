/**
 * LegalDataCatalog — maps disclosure categories to known Prisma models / file paths
 * in THIS repo. Index only — does NOT grant unrestricted government database access.
 */

import type { LegalDataCategory } from "./types";

export type CatalogEntry = {
  category: LegalDataCategory;
  label: string;
  description: string;
  prismaModels: string[];
  filePaths: string[];
  /** Never auto-export without HumanApprovalGate. */
  defaultAccessMode: "METADATA_INDEX" | "SCOPED_EXPORT" | "BLOCKED";
};

const CATALOG: CatalogEntry[] = [
  {
    category: "ACCOUNT",
    label: "Account & Profile",
    description: "User identity, roles, profiles — scoped fields only after approval.",
    prismaModels: [
      "User",
      "UserRole",
      "UserProfile",
      "ArtistProfile",
      "FanProfile",
      "VenueProfile",
      "UserSettings",
    ],
    filePaths: [
      "packages/db/prisma/schema.prisma",
      "apps/web/src/lib/auth/UserStore.ts",
      "apps/web/src/lib/performers/PerformerRegistry.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "AUTH",
    label: "Authentication Sessions",
    description: "Session and account-link metadata. Secrets/tokens never leave the vault.",
    prismaModels: ["Account", "Session", "VerificationToken"],
    filePaths: [
      "apps/web/src/lib/auth/session.ts",
      "apps/web/src/lib/auth/adapter.ts",
      "apps/web/src/middleware.ts",
    ],
    defaultAccessMode: "BLOCKED",
  },
  {
    category: "LIVE",
    label: "Live Rooms & Presence",
    description: "Room sessions, lobby membership, live presence records.",
    prismaModels: ["Room", "RoomSession", "RoomMember", "Lobby", "Section"],
    filePaths: [
      "apps/web/src/lib/live/",
      "apps/web/src/app/api/live/",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "COMM",
    label: "Communications",
    description: "Messages and notifications — minimize to request scope.",
    prismaModels: [
      "Message",
      "Notification",
      "InAppNotification",
      "OutgoingNotification",
      "UserBlock",
      "UserMute",
    ],
    filePaths: [
      "apps/web/src/components/canisters/MessagingCanister.tsx",
      "apps/web/src/lib/trustSafety/EvidenceVault.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "MEDIA",
    label: "Media & Content",
    description: "Articles, beats, memories, feed items — content metadata first.",
    prismaModels: [
      "Article",
      "Beat",
      "FanMemory",
      "MemoryAlbum",
      "FeedItem",
      "MusicLink",
    ],
    filePaths: [
      "apps/web/src/lib/magazine/magazineIssueData.ts",
      "apps/web/src/lib/submissions/SubmissionEngine.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "COMPETITION",
    label: "Competition & Rankings",
    description: "Battles, contests, ranks — competition records only.",
    prismaModels: [
      "Competition",
      "Battle",
      "ContestEntry",
      "ContestVote",
      "RankEntry",
      "Season",
    ],
    filePaths: [
      "apps/web/src/lib/championship/",
      "apps/web/src/lib/xp/XpActionRegistry.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "COMMERCE",
    label: "Commerce & Tickets",
    description: "Orders, tickets, tips, wallets — financial metadata; no raw card data.",
    prismaModels: [
      "Order",
      "Ticket",
      "TicketType",
      "Subscription",
      "Tip",
      "Wallet",
      "Transaction",
      "Payout",
      "LedgerEntry",
    ],
    filePaths: [
      "apps/web/src/lib/stripe/client.ts",
      "apps/web/src/lib/tickets/ticketEngine.ts",
      "apps/web/src/lib/commerce/SponsorRegistry.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
  {
    category: "AUDIT",
    label: "Platform Audit & Safety",
    description: "Audit logs, moderation, trust & safety cases — complementary to Legal Ledger.",
    prismaModels: [
      "AuditLog",
      "Report",
      "ModerationAction",
      "CronJobLog",
      "PipelineRun",
    ],
    filePaths: [
      "apps/web/src/lib/trustSafety/",
      "apps/web/src/lib/legal/LegalAuditLedger.ts",
      "apps/web/src/lib/legal/complianceGuard.ts",
    ],
    defaultAccessMode: "METADATA_INDEX",
  },
];

export function listLegalDataCatalog(): CatalogEntry[] {
  return CATALOG.map((e) => ({
    ...e,
    prismaModels: [...e.prismaModels],
    filePaths: [...e.filePaths],
  }));
}

export function getCatalogEntry(category: LegalDataCategory): CatalogEntry | null {
  const hit = CATALOG.find((c) => c.category === category);
  if (!hit) return null;
  return {
    ...hit,
    prismaModels: [...hit.prismaModels],
    filePaths: [...hit.filePaths],
  };
}

export function resolveCatalogRefs(categories: LegalDataCategory[]) {
  return categories.map((category) => {
    const entry = getCatalogEntry(category);
    return {
      category,
      sourceLabel: entry?.label ?? category,
      prismaModels: entry?.prismaModels ?? [],
      filePaths: entry?.filePaths ?? [],
      accessMode: entry?.defaultAccessMode ?? ("BLOCKED" as const),
    };
  });
}
