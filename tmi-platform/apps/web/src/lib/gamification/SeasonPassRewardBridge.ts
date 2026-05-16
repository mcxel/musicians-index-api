// SeasonPassRewardBridge
// Connects SeasonPassEngine reward claims to downstream systems:
// NFT minting, ticket grants, venue access, studio credits
// Each bridge method is a one-way connector — it calls the downstream system
// and returns a typed result so the UI can react.

import { seasonPassEngine, type SeasonPassReward } from "./SeasonPassEngine";

export type BridgeResult = {
  success: boolean;
  rewardId: string;
  rewardType: SeasonPassReward["type"];
  downstream: DownstreamAction;
  message: string;
};

export type DownstreamAction =
  | { system: "nft"; tokenId: string; contractHint: string }
  | { system: "ticket"; ticketCode: string; eventSlug: string }
  | { system: "venue"; venueSlug: string; accessLevel: "vip" | "backstage" | "press" }
  | { system: "studio"; creditAmount: number; expiresAt: number }
  | { system: "store_credit"; creditUsd: number }
  | { system: "badge"; badgeId: string }
  | { system: "emote"; emoteId: string }
  | { system: "none" };

// ── Token generators (deterministic stubs — replace with API calls in prod) ──

function generateNftTokenId(rewardId: string, userId: string): string {
  let hash = 0;
  for (const ch of `${rewardId}-${userId}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `TMI-S1-${String(hash).padStart(8, "0").slice(-8)}`;
}

function generateTicketCode(rewardId: string, userId: string): string {
  const seed = `${rewardId}-${userId}-${Date.now()}`;
  let hash = 0;
  for (const ch of seed) hash = (hash * 37 + ch.charCodeAt(0)) >>> 0;
  return `TKT-${String(hash >>> 0).toUpperCase().slice(-6)}`;
}

// ── Claim router ──────────────────────────────────────────────────────────────

export function claimAndBridge(userId: string, rewardId: string): BridgeResult | null {
  const reward = seasonPassEngine.getAllRewards().find((r) => r.id === rewardId);
  if (!reward) return null;

  const claimed = seasonPassEngine.claimReward(userId, rewardId);
  if (!claimed) return null;

  const downstream = routeDownstream(reward, userId);
  return {
    success: true,
    rewardId,
    rewardType: reward.type,
    downstream,
    message: buildSuccessMessage(reward, downstream),
  };
}

function routeDownstream(reward: SeasonPassReward, userId: string): DownstreamAction {
  switch (reward.type) {
    case "nft_drop":
      return {
        system: "nft",
        tokenId: generateNftTokenId(reward.id, userId),
        contractHint: "tmi-season-1-rewards",
      };

    case "vip_access":
      return {
        system: "venue",
        venueSlug: "tmi-arena",
        accessLevel: "backstage",
      };

    case "store_credit": {
      const creditUsd = parseCreditAmount(reward.title);
      return { system: "store_credit", creditUsd };
    }

    case "exclusive_emote":
      return { system: "emote", emoteId: reward.id };

    case "avatar_skin":
      return {
        system: "ticket",
        ticketCode: generateTicketCode(reward.id, userId),
        eventSlug: "skin-unlock",
      };

    case "badge":
      return { system: "badge", badgeId: reward.id };

    default:
      return { system: "none" };
  }
}

function parseCreditAmount(title: string): number {
  const match = /\$(\d+)/.exec(title);
  return match ? parseInt(match[1]!, 10) : 0;
}

function buildSuccessMessage(reward: SeasonPassReward, downstream: DownstreamAction): string {
  if (downstream.system === "nft") return `NFT minted: ${downstream.tokenId}`;
  if (downstream.system === "venue") return `${downstream.accessLevel.toUpperCase()} access granted at ${downstream.venueSlug}`;
  if (downstream.system === "store_credit") return `$${downstream.creditUsd} store credit added`;
  if (downstream.system === "ticket") return `Ticket issued: ${downstream.ticketCode}`;
  if (downstream.system === "badge") return `Badge unlocked: ${downstream.badgeId}`;
  if (downstream.system === "emote") return `Emote unlocked: ${downstream.emoteId}`;
  return `${reward.title} claimed`;
}

// ── Direct reward grant helpers ───────────────────────────────────────────────

export function grantNftReward(userId: string, rewardId: string): DownstreamAction | null {
  const reward = seasonPassEngine.getAllRewards().find((r) => r.id === rewardId && r.type === "nft_drop");
  if (!reward) return null;
  return { system: "nft", tokenId: generateNftTokenId(rewardId, userId), contractHint: "tmi-season-1-rewards" };
}

export function grantVenueAccess(userId: string, venueSlug: string, level: "vip" | "backstage" | "press"): DownstreamAction {
  void userId;
  return { system: "venue", venueSlug, accessLevel: level };
}

export function grantStudioCredit(userId: string, creditUsd: number, durationDays = 30): DownstreamAction {
  void userId;
  return {
    system: "studio",
    creditAmount: creditUsd * 100, // store as cents
    expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000,
  };
}

export function grantEventTicket(userId: string, eventSlug: string, rewardId: string): DownstreamAction {
  return {
    system: "ticket",
    ticketCode: generateTicketCode(rewardId, userId),
    eventSlug,
  };
}

// ── Claimable reward summary ──────────────────────────────────────────────────

export function getClaimableSummary(userId: string): {
  count: number;
  hasNft: boolean;
  hasTicket: boolean;
  hasVenueAccess: boolean;
  topRewardLabel: string;
} {
  const rewards = seasonPassEngine.getClaimableRewards(userId);
  return {
    count: rewards.length,
    hasNft: rewards.some((r) => r.type === "nft_drop"),
    hasTicket: rewards.some((r) => r.type === "vip_access"),
    hasVenueAccess: rewards.some((r) => r.type === "vip_access"),
    topRewardLabel: rewards[0]?.title ?? "",
  };
}
