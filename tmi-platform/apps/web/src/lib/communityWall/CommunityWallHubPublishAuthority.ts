/**
 * Hub-only community publishing (§9966–§9988).
 *
 * Walls = display / discover / interact (reply · DM · translate · report).
 * NEW POSTS originate from Hub → HappyDaysPromptCard (canonical social-moment canister UI).
 * Do not invent CommunityGossipComposer / HappyDaysComposer / MagazineWallComposer.
 */

import type { CommunityWallChannel, CommunityWallNote } from "./CommunityWallContracts";
import type { HappyDaysDestination, SocialMomentChannel } from "@/lib/happydays/HappyDaysContracts";
import { createUserWallNote } from "./CommunityWallEngine";

/** Owner law: wall must not expose a general new-post composer. */
export const WALL_NEW_POST_COMPOSER_LAW = "ABSENT_REQUIRED" as const;

/** Handback applied: default false + Magazine mounts force false. */
export const WALL_NEW_POST_COMPOSER = "ABSENT" as const;

export const OLD_WALL_COMPOSER_DISPOSITION = {
  component: "CommunityWallBoard",
  file: "apps/web/src/components/communityWall/CommunityWallBoard.tsx",
  testId: "community-wall-composer",
  prop: "composerEnabled",
  currentDefault: false,
  sharedElsewhere: false,
  createUserWallNoteReuse:
    "KEEP in CommunityWallEngine — Hub→wall adapter may call it after persistence; wall UI must not",
  handbackActions: [
    "DONE: CommunityWallBoard default composerEnabled = false",
    "DONE: MagazineArticleFocusOverlay passes composerEnabled={false}",
    "Physical negative composer cert still PENDING",
  ],
} as const;

export const COMMUNITY_GOSSIP_WINDOW = "ROLLING_24_HOURS" as const;
export const PUBLIC_VISIBILITY_GATE = "magazine" as const;
export const OWNER_VALUE_REQUIRED = "NONE" as const;
export const PREVIEW_3130 = "STOPPED_OR_UNKNOWN_AFTER_TERMINATION" as const;

export const HUB_AUTHORING_AUTHORITY = {
  primaryComponent: "HappyDaysPromptCard",
  file: "apps/web/src/components/happydays/HappyDaysPromptCard.tsx",
  channelType: "SocialMomentChannel = HAPPY_DAYS | COMMUNITY_GOSSIP",
  destinationType: "HappyDaysDestination = private | friends | magazine | public_page",
  mounts: [
    "apps/web/src/components/commandCenter/HubCommunicationsRail.tsx",
    "apps/web/src/components/fan/FanDashboard.tsx",
    "apps/web/src/app/performer/dashboard/page.tsx",
  ],
  hubRailContextChip: "happydays",
  persistenceToday: "public_page writes the existing page document on this device; magazine, friends, and private still do not publish",
  doNotCreate: [
    "CommunityGossipComposer",
    "HappyDaysComposer",
    "MagazineWallComposer",
  ],
} as const;

export const CANISTER_AUTHORING_COMPONENT = "HappyDaysPromptCard" as const;

export const DESTINATION_SELECTOR = {
  channelControl: "SocialMomentChannel toggle inside HappyDaysPromptCard / socialMomentPresentation",
  visibilityControl: "HappyDaysDestination private | friends | magazine | public_page",
  wallRoutingField: "SocialMomentChannel (exact) — NOT inferred from sentiment",
  note: "HappyDaysDestination does not duplicate COMMUNITY_GOSSIP/HAPPY_DAYS — channel is the wall destination id",
} as const;

/** Exact discovered destination ids — reuse, do not invent DB enums. */
export const COMMUNITY_GOSSIP_DESTINATION = {
  wallChannel: "COMMUNITY_GOSSIP" as CommunityWallChannel,
  socialMomentChannel: "COMMUNITY_GOSSIP" as SocialMomentChannel,
  conversationId: "community-platform-wide",
  gpsHubChip: "happydays", // HubCommunicationsRail hosts the social-moment card
} as const;

export const HAPPY_DAYS_DESTINATION = {
  wallChannel: "HAPPY_DAYS" as CommunityWallChannel,
  socialMomentChannel: "HAPPY_DAYS" as SocialMomentChannel,
  happyDaysDestinationForPublicWall: "magazine" as HappyDaysDestination,
  conversationId: "community-platform-wide",
  gpsHubChip: "happydays",
} as const;

export type HubWallPublishIntent = {
  channel: SocialMomentChannel;
  body: string;
  authorLabel: string;
  userId: string;
  userRole: "fan" | "performer";
  visibility: HappyDaysDestination;
  /** Optional presentation chosen in Hub — not required for routing. */
  shape?: CommunityWallNote["shape"];
  color?: CommunityWallNote["color"];
  originalLanguage?: string;
};

/**
 * Route Hub publish → wall channel. Destination from canonical metadata only.
 * private/friends never become public wall notes.
 */
export function resolveHubPublishWallRoute(
  intent: Pick<HubWallPublishIntent, "channel" | "visibility">,
): {
  wallChannel: CommunityWallChannel | null;
  publicWallEligible: boolean;
  reason: string;
} {
  if (intent.visibility !== "magazine") {
    return {
      wallChannel: null,
      publicWallEligible: false,
      reason: `visibility=${intent.visibility} is not the magazine wall — friends, private, and public page stay off that wall`,
    };
  }
  if (intent.channel === "COMMUNITY_GOSSIP") {
    return {
      wallChannel: "COMMUNITY_GOSSIP",
      publicWallEligible: true,
      reason: "SocialMomentChannel COMMUNITY_GOSSIP + magazine → Community Gossip wall",
    };
  }
  return {
    wallChannel: "HAPPY_DAYS",
    publicWallEligible: true,
    reason: "SocialMomentChannel HAPPY_DAYS + magazine → Happy Days wall",
  };
}

/**
 * Build a presentation note AFTER persistence succeeds.
 * Does not write stores — caller owns HappyDaysRegistry / Message persistence.
 */
export function mapHubPublishToWallNote(
  intent: HubWallPublishIntent,
  persistedId: string,
): CommunityWallNote | null {
  const route = resolveHubPublishWallRoute(intent);
  if (!route.publicWallEligible || !route.wallChannel) return null;
  return createUserWallNote({
    id: persistedId,
    channel: route.wallChannel,
    authorLabel: intent.authorLabel,
    body: intent.body,
    shape: intent.shape ?? (route.wallChannel === "HAPPY_DAYS" ? "ROUNDED" : "POSTER"),
    color: intent.color ?? (route.wallChannel === "HAPPY_DAYS" ? "SUNSHINE" : "PAPER_WHITE"),
    dataClass: "REAL_PERSISTED",
    originalLanguage: intent.originalLanguage ?? "und",
  });
}

export const GOSSIP_HUB_TO_WALL_ROUTE = {
  path: "HUB → HappyDaysPromptCard (channel=COMMUNITY_GOSSIP) → visibility magazine → persistence → Community Gossip wall",
  status: "UI_EXISTS_PERSISTENCE_NOT_CONNECTED",
} as const;

export const HAPPY_HUB_TO_WALL_ROUTE = {
  path: "HUB → HappyDaysPromptCard (channel=HAPPY_DAYS) → visibility magazine → persistence → Happy Days wall",
  status: "UI_EXISTS_PERSISTENCE_NOT_CONNECTED",
} as const;

export const WALL_REPLY_FLOW =
  "CARD → resolveWallReplyIntent → CommunityFeedPanel / canonical conversation → composer there — NOT wall new-post box" as const;

export const DM_FLOW =
  "CARD → resolveWallDmIntent → MessagingCanister compact recipientId — NOT wall new-post box" as const;

export const HUB_PUBLISH_PHYSICAL_CHECKLIST = [
  {
    id: "HUB-G-01",
    name: "DESKTOP_HUB_TO_GOSSIP",
    steps:
      "Hub → HappyDaysPromptCard → COMMUNITY GOSSIP → magazine destination → type → send → open Community Gossip → same post",
  },
  {
    id: "HUB-H-01",
    name: "DESKTOP_HUB_TO_HAPPY",
    steps:
      "Hub → HappyDaysPromptCard → HAPPY DAYS → magazine → type → send → Happy Days wall shows celebration presentation",
  },
  {
    id: "HUB-G-M",
    name: "MOBILE_HUB_TO_GOSSIP",
    steps: "390×844 Hub → canister → destination → native keyboard → SEND → Gossip wall",
  },
  {
    id: "HUB-H-M",
    name: "MOBILE_HUB_TO_HAPPY",
    steps: "390×844 Hub → canister → destination → native keyboard → SEND → Happy Days wall",
  },
  {
    id: "WALL-NEG-01",
    name: "WALL_NEGATIVE_COMPOSER_TEST",
    steps:
      "Community Gossip + Happy Days (desktop+mobile): NO general new-post text box (data-testid community-wall-composer absent or hidden)",
  },
] as const;
