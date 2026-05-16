import type { LobbyRuntimeState } from "@/lib/lobby/LobbyStateEngine";

export type BillboardChannelId =
  | "live"
  | "ranking"
  | "sponsor"
  | "advertiser"
  | "venue"
  | "battle"
  | "winner";

export type VenueBillboardSelection = {
  primary: BillboardChannelId;
  secondary: BillboardChannelId;
  rotateMs: number;
  label: string;
};

const CHANNEL_LABELS: Record<BillboardChannelId, string> = {
  live: "Live World",
  ranking: "Ranking",
  sponsor: "Sponsor",
  advertiser: "Advertiser",
  venue: "Venue",
  battle: "Battle / Game",
  winner: "Contest Winners",
};

export function getChannelLabel(id: BillboardChannelId): string {
  return CHANNEL_LABELS[id];
}

export function selectBillboardChannels(state: LobbyRuntimeState): VenueBillboardSelection {
  switch (state) {
    case "FREE_ROAM":
      return { primary: "live", secondary: "sponsor", rotateMs: 15_000, label: "Free Roam — Live + Sponsor" };
    case "PRE_SHOW":
      return { primary: "live", secondary: "venue", rotateMs: 12_000, label: "Pre-Show — Live + Venue" };
    case "QUEUE_OPEN":
      return { primary: "live", secondary: "ranking", rotateMs: 10_000, label: "Queue Open — Live + Ranking" };
    case "SEATING":
      return { primary: "sponsor", secondary: "venue", rotateMs: 8_000, label: "Seating Lock — Sponsor + Venue" };
    case "LIVE_SHOW":
      return { primary: "battle", secondary: "ranking", rotateMs: 6_000, label: "Live Show — Battle + Ranking" };
    case "POST_SHOW":
      return { primary: "winner", secondary: "sponsor", rotateMs: 12_000, label: "Post-Show — Winners + Sponsor" };
    case "RESET":
      return { primary: "sponsor", secondary: "live", rotateMs: 20_000, label: "Reset — Sponsor + Live" };
    default:
      return { primary: "live", secondary: "sponsor", rotateMs: 15_000, label: "Default — Live + Sponsor" };
  }
}
