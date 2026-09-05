/**
 * Magazine issue lock — CONTENT ≠ LAYOUT ≠ THEME ≠ MONETIZATION.
 * Types + laws only. Anti-Gravity studio / 31 templates remain LOCKED SPEC.
 */

export const MAGAZINE_LAYER = {
  CONTENT: "CONTENT",
  LAYOUT: "LAYOUT",
  THEME: "THEME",
  MONETIZATION: "MONETIZATION",
} as const;

export type MagazineLayer = (typeof MAGAZINE_LAYER)[keyof typeof MAGAZINE_LAYER];

export type MagazinePageClass = "PERFORMER" | "NEWS" | "RANDOM";

/** Default issue rhythm. Never P,P,P or AD,AD,AD unless special-issue override. */
export const DEFAULT_ISSUE_RHYTHM: readonly MagazinePageClass[] = ["PERFORMER", "NEWS", "RANDOM"];

export type RandomPageSubtype =
  | "SHOP"
  | "DIRECT_SPONSOR"
  | "FULL_PAGE_AD"
  | "PREMIUM_PLACEMENT"
  | "RANKINGS"
  | "WINNERS_CIRCLE"
  | "PLATFORM_UPDATE"
  | "LOBBY"
  | "GAME"
  | "EVENT"
  | "VENUE"
  | "PROMOTER"
  | "CHART"
  | "RELEASES"
  | "FAN_POLL"
  | "REWARDS"
  | "BATTLE_RECAP"
  | "CYPHER_RECAP"
  | "CHALLENGE"
  | "MARKETPLACE"
  | "FAN_YOPHO_MOSAIC"
  | "PERFORMER_YOPHO_MOSAIC"
  | "COMMUNITY_CORKBOARD"
  | "HAPPY_DAYS"
  | "STREAM_AND_WIN_DISCOVERY"
  | "VIDEO_SHUFFLE_DISCOVERY"
  | "OTHER_APPROVED_RANDOM";

export const PAID_RANDOM_SUBTYPES: readonly RandomPageSubtype[] = [
  "DIRECT_SPONSOR",
  "FULL_PAGE_AD",
  "PREMIUM_PLACEMENT",
];

/** Subtypes that are not a living community board unless a real submit path exists. */
export const NON_LIVING_COMMUNITY_RANDOM: readonly RandomPageSubtype[] = [
  "FAN_YOPHO_MOSAIC",
  "PERFORMER_YOPHO_MOSAIC",
  "COMMUNITY_CORKBOARD",
];

export type MonetizationLayer =
  | "NONE"
  | "TMI_DIRECT_SPONSOR"
  | "ADSENSE"
  | "PLATFORM_PROMO"
  | "ADVERTISE_CTA";

export const ADSENSE_IS_NOT_TMI_DIRECT_SPONSOR = true;

export type InteractionExclusionAction = "PLAY" | "BUY" | "WATCH";

export const INTERACTION_EXCLUSION_ZONE: readonly InteractionExclusionAction[] = ["PLAY", "BUY", "WATCH"];

export type MagazinePublicationState =
  | "INGESTED"
  | "VALIDATED"
  | "QUEUED"
  | "LAYOUT_BOUND"
  | "MONETIZATION_BOUND"
  | "PUBLISHED"
  | "ARCHIVED";

/** Structured blocks — never bodyHtml as the content model. */
export type MagazineStructuredBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "image"; url: string; alt?: string }
  | { type: "cta"; label: string; href: string; zone?: InteractionExclusionAction | "READ" };

export type EditorialStory = {
  storyId: string;
  publicationState: MagazinePublicationState;
  title: string;
  subtitle?: string;
  author: string;
  writerSlug?: string;
  performerSlug?: string;
  category: "news" | "interview" | "editorial";
  blocks: MagazineStructuredBlock[];
  href: string;
  source: "magazine-issue-data" | "writer-submit";
};

export type MagazinePerformerEligibility = {
  slug: string;
  name: string;
  active?: boolean;
  publishable?: boolean;
  safetyClear?: boolean;
};

export type MagazinePerformerSlotSource = MagazinePerformerEligibility & {
  category: string;
  xp: number;
  rank: number;
  profileRoute: string;
  liveRoomRoute: string;
  isLive: boolean;
  profileImageUrl: string;
  articleSlug?: string;
  articleTitle?: string;
  articleSubtitle?: string;
  heroColor?: string;
  merchHref?: string;
};

export type MagazineNewsSlotSource = {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  heroColor?: string;
  preview?: string;
  author?: string;
};

export type MagazineRandomSlotSource = {
  id: string;
  subtype: RandomPageSubtype;
  paidObligation: boolean;
  title: string;
  href: string;
  deck?: string;
  monetizationLayer: MonetizationLayer;
  imageUrl?: string;
};

export type MagazineIssueSlot = {
  id: string;
  pageClass: MagazinePageClass;
  title: string;
  href: string;
  deck?: string;
  heroColor?: string;
  imageUrl?: string;
  xpEligible: boolean;
  randomSubtype?: RandomPageSubtype;
  monetizationLayer: MonetizationLayer;
  performerSlug?: string;
  articleSlug?: string;
  liveHref?: string;
  merchHref?: string;
  isLive?: boolean;
};

export const MAGAZINE_XP_POLICY = {
  trigger: "article_completion" as const,
  pageOpenDoesNotGrant: true,
  xpActionKey: "read_article" as const,
  /**
   * POST /api/magazine/read-xp is the real authority: real signed-in user
   * (not a hardcoded placeholder), real once-per-story dedup and daily-cap
   * enforcement against ParticipationLedger, real persistence to UserStats.
   * Client ProgressionEngine.DAILY_XP_CAP is still the shared cap constant
   * (imported server-side too, not a second definition) — the enforcement
   * boundary itself is now the server, not localStorage.
   */
  dailyCapStatus: "SERVER_ENFORCED" as const,
};

export const ANTI_GRAVITY_STUDIO = {
  status: "LOCKED_SPEC" as const,
  built: false,
  templates01to31: "NOT_BUILT" as const,
};

export const WRITER_CASH_PAYOUT = {
  launchMode: "XP_REPUTATION_ONLY" as const,
  cash: false,
};

export function isMagazinePerformerEligible(p: MagazinePerformerEligibility): boolean {
  if (!p.slug.trim() || !p.name.trim()) return false;
  if (p.active === false) return false;
  if (p.publishable === false) return false;
  if (p.safetyClear === false) return false;
  return true;
}

export function isPaidRandomSubtype(subtype: RandomPageSubtype): boolean {
  return PAID_RANDOM_SUBTYPES.includes(subtype);
}

export function paidPageMayMasqueradeAsEditorial(): false {
  return false;
}

export function isPnrRhythm(
  classes: MagazinePageClass[],
  override: readonly MagazinePageClass[] = DEFAULT_ISSUE_RHYTHM,
): boolean {
  if (classes.length === 0) return true;
  return classes.every((cls, i) => cls === override[i % override.length]);
}

export function editorialSubmissionToStory(input: {
  submissionId: string;
  title: string;
  body: string;
  category: string;
  status: string;
  contributorId: string;
  artistSlug?: string;
}): EditorialStory {
  const approved = input.status === "approved";
  const paragraphs = input.body
    .split(/\n+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text): MagazineStructuredBlock => ({ type: "paragraph", text }));

  return {
    storyId: input.submissionId,
    publicationState: approved ? "QUEUED" : "INGESTED",
    title: input.title,
    author: input.contributorId,
    writerSlug: input.contributorId,
    performerSlug: input.artistSlug,
    category: input.category === "interview" ? "interview" : "news",
    blocks: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph", text: input.title }],
    href: "/writers/dashboard",
    source: "writer-submit",
  };
}
