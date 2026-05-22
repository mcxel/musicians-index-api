import { useState } from "react";
import type { LobbyGenre, LiveFeedItem, PerformerTier } from "@/components/billboard/TMIBillboardLiveWall";

export interface RouterOptions {
  genre?: LobbyGenre;
  userTier: PerformerTier;
  excludeRoomIds?: string[];
  preferLive?: boolean;
  preferPaid?: boolean;
}

export interface RouterResult {
  found: boolean;
  lobby?: LiveFeedItem;
  reason?: string;
  alternativeCount: number;
}

export class TMIAutoLobbyRouter {
  private registry: LiveFeedItem[] = [];

  updateRegistry(lobbies: LiveFeedItem[]): void {
    this.registry = lobbies;
  }

  findLobby(opts: RouterOptions): RouterResult {
    const {
      genre = "all",
      userTier,
      excludeRoomIds = [],
      preferLive = true,
      preferPaid = false,
    } = opts;

    const isDiamond = userTier === "diamond";

    let candidates = genre === "all"
      ? [...this.registry]
      : this.registry.filter((l) => l.genre === genre);

    candidates = candidates.filter((l) => !excludeRoomIds.includes(l.roomId));

    candidates = candidates.filter((l) => {
      if (l.privacy === "PRIVATE") return false;
      if (l.privacy === "INVITE_ONLY") return false;
      if (l.privacy === "PAID_ENTRY" && !preferPaid && userTier !== "diamond") return false;
      if (l.privacy === "DIAMOND_SURF" && !isDiamond) return false;
      return true;
    });

    if (candidates.length === 0) {
      return { found: false, reason: "No matching lobbies available", alternativeCount: 0 };
    }

    const scored = candidates.map((l) => ({
      lobby: l,
      score: this.routerScore(l, preferLive),
    }));
    scored.sort((a, b) => b.score - a.score);

    const winner = scored[0].lobby;
    return {
      found: true,
      lobby: winner,
      reason: this.describeReason(winner),
      alternativeCount: scored.length - 1,
    };
  }

  findRandomLobby(opts: Omit<RouterOptions, "genre"> & { genre?: LobbyGenre }): RouterResult {
    const result = this.findLobby(opts);
    if (!result.found || !result.lobby) return result;

    const { genre = "all", userTier, excludeRoomIds = [] } = opts;
    const candidates = this.registry
      .filter((l) => (genre === "all" || l.genre === genre) && !excludeRoomIds.includes(l.roomId))
      .filter((l) => l.privacy === "PUBLIC" || (l.privacy === "DIAMOND_SURF" && userTier === "diamond"));

    if (candidates.length === 0) return result;
    const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
    return {
      found: true,
      lobby: pick,
      reason: "Random pick — enjoy!",
      alternativeCount: candidates.length - 1,
    };
  }

  private routerScore(lobby: LiveFeedItem, preferLive: boolean): number {
    let score = 0;
    if (lobby.isLive && preferLive) score += 50;
    score += lobby.viewers * 0.5;
    score += lobby.tips * 1;
    score += lobby.activityLevel * 2;
    if (lobby.privacy === "PUBLIC") score += 10;
    return score;
  }

  private describeReason(lobby: LiveFeedItem): string {
    if (lobby.viewers > 100) return "High viewer count";
    if (lobby.isLive) return "Currently live";
    if (lobby.tips > 50) return "High tip activity";
    return "Active room";
  }
}

export function useAutoLobby(feeds: LiveFeedItem[], userTier: PerformerTier) {
  const [router] = useState(() => {
    const r = new TMIAutoLobbyRouter();
    r.updateRegistry(feeds);
    return r;
  });

  function joinAuto(genre: LobbyGenre = "all"): RouterResult {
    return router.findLobby({ genre, userTier });
  }

  function joinRandom(genre: LobbyGenre = "all"): RouterResult {
    return router.findRandomLobby({ genre, userTier });
  }

  return { joinAuto, joinRandom };
}
