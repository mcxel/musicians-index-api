// Shared memory types — tickets, NFTs, polaroids, prizes, clips + Pro Legacy Ledger

export type MemoryItemKind =
  | "polaroid"
  | "ticket"
  | "nft"
  | "prize"
  | "video-clip"
  | "badge"
  | "event-poster";

export interface MemoryItem {
  id: string;
  kind: MemoryItemKind;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  eventId?: string;
  eventTitle?: string;
  venueName?: string;
  date?: string;
  /** Only public memories can be shown in room broadcasts */
  visibility: "public" | "friends" | "private";
  capturedAt: string;
}

// ─── Pro Legacy Ledger — business side only ───────────────────────────────────
// Items are ONLY created by system events (Stripe, ticketing, analytics).
// Manual creation is not permitted.

export type ProLegacyKind =
  | "sponsor-gift"
  | "advertiser-milestone"
  | "promoter-win"
  | "crowd-favorite";

export interface MetricImpact {
  totalPaidOut?: number;
  audienceReached?: number;
  engagementRate?: number;
  conversionRate?: number;
  ticketsSold?: number;
  prizesAwarded?: number;
}

export interface ProLegacyItem {
  id: string;
  userId: string;
  kind: ProLegacyKind;
  title: string;
  eventId?: string;
  eventTitle?: string;
  metricImpact: MetricImpact;
  visualProof?: string;
  /** true only when created by a verified system event (Stripe/ticketing/analytics) */
  verified: boolean;
  /** when true the item appears on the user's public profile hub */
  showcaseMode: boolean;
  displayMode: "holographic-card" | "verified-badge";
  createdAt: string;
}

// ─── Writer Wall — published works, portfolio, assignments ───────────────────
// Separate from MemoryWall (fan/performer). Same modal system, different card.

export type WriterWorkKind =
  | "article"
  | "interview"
  | "review"
  | "feature"
  | "past-work"
  | "image"
  | "draft"
  | "assignment";

export interface WriterWorkMetrics {
  views?: number;
  readTimeMinutes?: number;
  engagementRate?: number;
  sponsorLinked?: boolean;
  paidAmount?: number;
}

export interface WriterWorkItem {
  id: string;
  writerId: string;
  kind: WriterWorkKind;
  title: string;
  description?: string;
  mediaUrl?: string;
  /** Slug of the live TMI article this links to */
  articleSlug?: string;
  publication?: string;
  status: "draft" | "published" | "archived";
  visibility: "private" | "editorial" | "public";
  metrics?: WriterWorkMetrics;
  /** Badges earned from editorial system */
  badges?: string[];
  /** Set true only by admin/editorial approval */
  verified?: boolean;
  createdAt: string;
}

// ─── Union for the fullscreen modal ──────────────────────────────────────────

export type AnyMemoryItem =
  | { itemType: "memory"; item: MemoryItem }
  | { itemType: "pro-legacy"; item: ProLegacyItem }
  | { itemType: "writer-work"; item: WriterWorkItem };
