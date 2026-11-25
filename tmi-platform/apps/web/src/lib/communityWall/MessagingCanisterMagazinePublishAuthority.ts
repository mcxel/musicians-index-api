/**
 * MessagingCanisterMagazinePublishAuthority — §20979
 *
 * Bidirectional: MAGAZINE PAGE ↔ EXISTING MessagingCanister.
 * Destinations: COMMUNITY_GOSSIP | HAPPY_DAYS only — never GLOBAL COMMUNITY.
 *
 * Privacy law: DMs / room chat / article Conversation NEVER auto-publish.
 * Explicit magazine destination + explicit submit required.
 *
 * Reuses CommunityWallHubPublishAuthority routing — no second composer.
 * Persistence today: session staging (COMMIT/PROD_DB off). Not a parallel DB.
 */

import type { CommunityWallChannel, CommunityWallNote } from "./CommunityWallContracts";
import {
  COMMUNITY_GOSSIP_DESTINATION,
  HAPPY_DAYS_DESTINATION,
  mapHubPublishToWallNote,
  resolveHubPublishWallRoute,
  type HubWallPublishIntent,
} from "./CommunityWallHubPublishAuthority";
import type { SocialMomentChannel } from "@/lib/happydays/HappyDaysContracts";

export const MESSAGING_CANISTER_MAGAZINE_PUBLISH_POLICY_ID =
  "MESSAGING_CANISTER_MAGAZINE_PUBLISH_AUTHORITY_v1" as const;

export const DUPLICATE_COMPOSER_CREATED = 0 as const;
export const GLOBAL_COMMUNITY_DESTINATION = 0 as const;
export const ORDINARY_DM_AUTO_PUBLISHED = 0 as const;
export const ARTICLE_CONVERSATION_AUTO_PUBLISHED = 0 as const;
export const CROSS_DESTINATION_LEAK = 0 as const;

export type MagazinePublishDestination = "COMMUNITY_GOSSIP" | "HAPPY_DAYS";

export const MAGAZINE_PUBLISH_DESTINATIONS: readonly MagazinePublishDestination[] = [
  "COMMUNITY_GOSSIP",
  "HAPPY_DAYS",
] as const;

export const MAGAZINE_PUBLISH_ROTATION_MS = 20_000 as const;

export const COMMUNITY_GOSSIP_FULL_PAGE_HREF = "/community-gossip" as const;
export const HAPPY_DAYS_FULL_PAGE_HREF = "/happy-days" as const;

const STAGE_KEY = "tmi.magazine.community.publish.v1";

export function isMagazinePublishDestination(v: unknown): v is MagazinePublishDestination {
  return v === "COMMUNITY_GOSSIP" || v === "HAPPY_DAYS";
}

export function destinationLabel(dest: MagazinePublishDestination): string {
  return dest === "HAPPY_DAYS" ? "HAPPY DAYS" : "COMMUNITY GOSSIP";
}

export function destinationFullPageHref(dest: MagazinePublishDestination): string {
  return dest === "HAPPY_DAYS" ? HAPPY_DAYS_FULL_PAGE_HREF : COMMUNITY_GOSSIP_FULL_PAGE_HREF;
}

export function defaultDestinationForPage(
  page: "COMMUNITY_GOSSIP" | "HAPPY_DAYS" | "ARTICLE" | "OTHER",
): MagazinePublishDestination | null {
  if (page === "COMMUNITY_GOSSIP") return "COMMUNITY_GOSSIP";
  if (page === "HAPPY_DAYS") return "HAPPY_DAYS";
  // Article page may offer both — no silent default publish destination
  return null;
}

/**
 * Build Hub publish intent ONLY when user explicitly chose a magazine destination
 * and visibility magazine. Never call from ordinary DM send path.
 */
export function buildExplicitMagazinePublishIntent(input: {
  destination: MagazinePublishDestination;
  body: string;
  authorLabel: string;
  userId: string;
  userRole: "fan" | "performer";
  /** Must be true — explicit confirm that this is magazine publication */
  explicitPublishIntent: boolean;
}): HubWallPublishIntent | { error: string } {
  if (!input.explicitPublishIntent) {
    return { error: "EXPLICIT_PUBLICATION_INTENT_REQUIRED" };
  }
  const body = input.body.trim();
  if (!body) return { error: "EMPTY_BODY" };
  return {
    channel: input.destination as SocialMomentChannel,
    body,
    authorLabel: input.authorLabel,
    userId: input.userId,
    userRole: input.userRole,
    visibility: "magazine",
  };
}

export function publishExplicitMagazineContribution(input: {
  destination: MagazinePublishDestination;
  body: string;
  authorLabel?: string;
  userId?: string;
  userRole?: "fan" | "performer";
  explicitPublishIntent: boolean;
}): { ok: true; note: CommunityWallNote; channel: CommunityWallChannel } | { ok: false; error: string } {
  const intentOrErr = buildExplicitMagazinePublishIntent({
    destination: input.destination,
    body: input.body,
    authorLabel: input.authorLabel ?? "You",
    userId: input.userId ?? "session-user",
    userRole: input.userRole ?? "fan",
    explicitPublishIntent: input.explicitPublishIntent,
  });
  if ("error" in intentOrErr) return { ok: false, error: intentOrErr.error };

  const route = resolveHubPublishWallRoute(intentOrErr);
  if (!route.publicWallEligible || !route.wallChannel) {
    return { ok: false, error: route.reason };
  }

  const note = mapHubPublishToWallNote(intentOrErr, `mag-pub-${Date.now()}`);
  if (!note) return { ok: false, error: "WALL_NOTE_MAP_FAILED" };

  // Destination lock — never cross-leak
  if (note.channel !== input.destination) {
    return { ok: false, error: "CROSS_DESTINATION_LEAK_BLOCKED" };
  }

  stagePublishedNote(note);
  return { ok: true, note, channel: note.channel };
}

export function stagePublishedNote(note: CommunityWallNote): void {
  if (typeof window === "undefined") return;
  try {
    const prev = readStagedNotes();
    const next = [note, ...prev.filter((n) => n.id !== note.id)].slice(0, 80);
    window.sessionStorage.setItem(STAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function readStagedNotes(channel?: CommunityWallChannel): CommunityWallNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityWallNote[];
    if (!Array.isArray(parsed)) return [];
    return channel ? parsed.filter((n) => n.channel === channel) : parsed;
  } catch {
    return [];
  }
}

export function messagingCanisterMagazinePublishLocks() {
  return {
    MESSAGING_CANISTER_REUSED: true,
    DUPLICATE_COMPOSER_CREATED,
    GLOBAL_COMMUNITY_DESTINATION,
    ORDINARY_DM_AUTO_PUBLISHED,
    ARTICLE_CONVERSATION_AUTO_PUBLISHED,
    CROSS_DESTINATION_LEAK,
    DESTINATIONS: MAGAZINE_PUBLISH_DESTINATIONS,
    GOSSIP_ROUTE: COMMUNITY_GOSSIP_DESTINATION,
    HAPPY_ROUTE: HAPPY_DAYS_DESTINATION,
    ROTATION_MS: MAGAZINE_PUBLISH_ROTATION_MS,
    HUB_AUTHORITY: "CommunityWallHubPublishAuthority",
    PERSISTENCE: "SESSION_STAGE_ONLY_UNTIL_ISOLATED_DB",
  } as const;
}
