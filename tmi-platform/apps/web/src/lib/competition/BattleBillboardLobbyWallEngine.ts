/**
 * BattleBillboardLobbyWallEngine
 * Publishes accepted/live battle artifacts to billboard and lobby-wall surfaces.
 */

export interface BattleContentArtifacts {
  liveRoom: {
    roomId: string;
    battleId: string;
    route: string;
    createdAt: number;
  };
  billboardCard: {
    battleId: string;
    headline: string;
    route: string;
    liveBadge: boolean;
  };
  fanNotification: {
    notificationId: string;
    title: string;
    body: string;
    route: string;
  };
  voteSurface: {
    battleId: string;
    route: string;
    enabled: boolean;
  };
  replayAsset: {
    replayId: string;
    route: string;
    status: "processing" | "ready";
  };
  leaderboardUpdate: {
    updateId: string;
    battleId: string;
    pending: boolean;
  };
}

export interface BattleBillboardCard {
  battleId: string;
  challengeId: string;
  challengerName: string;
  targetName: string;
  formatLabel: string;
  status: "accepted" | "live" | "completed";
  route: string;
  createdAt: number;
  endsAt: number;
}

export interface LiveBattleRoomCard {
  roomId: string;
  battleId: string;
  headline: string;
  roomRoute: string;
  billboardRoute: string;
  isLive: boolean;
}

export class BattleBillboardLobbyWallEngine {
  private cards: BattleBillboardCard[] = [];
  private artifactsByBattle: Map<string, BattleContentArtifacts> = new Map();

  publishAcceptedToWall(input: {
    challengeId: string;
    battleId: string;
    challengerName: string;
    targetName: string;
    formatLabel: string;
    endsAt: number;
  }): BattleBillboardCard {
    const card: BattleBillboardCard = {
      battleId: input.battleId,
      challengeId: input.challengeId,
      challengerName: input.challengerName,
      targetName: input.targetName,
      formatLabel: input.formatLabel,
      status: "accepted",
      route: `/battles/${input.battleId}`,
      createdAt: Date.now(),
      endsAt: input.endsAt,
    };
    this.cards.unshift(card);
    return card;
  }

  setLive(battleId: string): BattleBillboardCard | null {
    const card = this.cards.find((c) => c.battleId === battleId);
    if (!card) return null;
    card.status = "live";
    return card;
  }

  markCompleted(battleId: string): BattleBillboardCard | null {
    const card = this.cards.find((c) => c.battleId === battleId);
    if (!card) return null;
    card.status = "completed";
    return card;
  }

  createContentArtifacts(input: {
    challengeId: string;
    battleId: string;
    challengerName: string;
    targetName: string;
  }): BattleContentArtifacts {
    const artifacts: BattleContentArtifacts = {
      liveRoom: {
        roomId: `battle-${input.battleId}`,
        battleId: input.battleId,
        route: `/rooms/battle/battle-${input.battleId}`,
        createdAt: Date.now(),
      },
      billboardCard: {
        battleId: input.battleId,
        headline: `${input.challengerName} vs ${input.targetName}`,
        route: "/battle-billboard/live",
        liveBadge: true,
      },
      fanNotification: {
        notificationId: `notif-${input.challengeId}`,
        title: "New Live Battle",
        body: `${input.challengerName} challenged ${input.targetName}. Vote is open now.`,
        route: `/battles/${input.battleId}`,
      },
      voteSurface: {
        battleId: input.battleId,
        route: `/battles/${input.battleId}`,
        enabled: true,
      },
      replayAsset: {
        replayId: `replay-${input.battleId}`,
        route: `/battles/${input.battleId}?tab=replay`,
        status: "processing",
      },
      leaderboardUpdate: {
        updateId: `lb-${input.battleId}`,
        battleId: input.battleId,
        pending: true,
      },
    };

    this.artifactsByBattle.set(input.battleId, artifacts);
    return artifacts;
  }

  markReplayReady(battleId: string): BattleContentArtifacts | null {
    const artifacts = this.artifactsByBattle.get(battleId);
    if (!artifacts) return null;
    artifacts.replayAsset.status = "ready";
    return artifacts;
  }

  markLeaderboardUpdated(battleId: string): BattleContentArtifacts | null {
    const artifacts = this.artifactsByBattle.get(battleId);
    if (!artifacts) return null;
    artifacts.leaderboardUpdate.pending = false;
    return artifacts;
  }

  getCards(): BattleBillboardCard[] {
    return [...this.cards];
  }

  getArtifacts(battleId: string): BattleContentArtifacts | null {
    return this.artifactsByBattle.get(battleId) ?? null;
  }

  getLiveRoomCards(): LiveBattleRoomCard[] {
    return this.cards
      .filter((card) => card.status === "accepted" || card.status === "live")
      .map((card) => {
        const artifacts = this.artifactsByBattle.get(card.battleId);
        return {
          roomId: artifacts?.liveRoom.roomId ?? `battle-${card.battleId}`,
          battleId: card.battleId,
          headline: `${card.challengerName} vs ${card.targetName}`,
          roomRoute: artifacts?.liveRoom.route ?? `/rooms/battle/battle-${card.battleId}`,
          billboardRoute: "/battle-billboard/live",
          isLive: card.status === "live",
        };
      });
  }
}

export const battleBillboardLobbyWallEngine = new BattleBillboardLobbyWallEngine();
