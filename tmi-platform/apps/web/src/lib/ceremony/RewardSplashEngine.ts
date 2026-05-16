/**
 * RewardSplashEngine
 * Generates the reward display data shown during the ceremony payout phase.
 *
 * Handles:
 * - Points payout (winner + participation)
 * - USD prize (if applicable)
 * - Badge/trophy award
 * - Streak bonus calculation
 * - XP grant
 * - Article creation trigger
 * - Replay confirmation
 *
 * Output is consumed by WinnerCeremonyOverlay to render the reward card.
 */

export interface RewardLine {
  label: string;
  value: string;
  color: string;
  icon: string;
  /** If true, this value is animated (counter rolls up) */
  animated: boolean;
}

export interface RewardSplash {
  splashId: string;
  battleId: string;
  winnerUserId: string;
  winnerDisplayName: string;
  /** Total points awarded */
  totalPoints: number;
  /** Breakdown of points */
  pointBreakdown: RewardLine[];
  /** USD prize if any */
  prizeUsd?: number;
  /** Badge name if awarded */
  badgeAwarded?: string;
  /** Replay URL */
  replayRoute: string;
  /** True if article draft was queued */
  articleDraftQueued: boolean;
  /** Article draft ID */
  articleDraftId?: string;
  createdAt: number;
}

let splashSeq = 0;
let articleDraftSeq = 0;

export interface RewardSplashParams {
  battleId: string;
  winnerUserId: string;
  winnerDisplayName: string;
  basePoints?: number;     // default 35
  audienceFavorite?: boolean; // +5
  streakBonus?: number;    // +10 if streak ≥ 3
  crowdVoteBonus?: number; // +3
  upsetBonus?: boolean;    // +15
  prizeUsd?: number;
  badgeAwarded?: string;
  replayRoute?: string;
}

class RewardSplashEngine {
  private splashes = new Map<string, RewardSplash>();
  private articleDrafts: { draftId: string; battleId: string; winnerName: string; createdAt: number }[] = [];

  generate(params: RewardSplashParams): RewardSplash {
    const base = params.basePoints ?? 35;
    const lines: RewardLine[] = [
      {
        label: "WIN BONUS",
        value: `+${base} pts`,
        color: "#FFD700",
        icon: "🏆",
        animated: true,
      },
    ];

    let total = base;

    if (params.audienceFavorite) {
      lines.push({ label: "AUDIENCE FAVORITE", value: "+5 pts", color: "#FF2DAA", icon: "❤️", animated: true });
      total += 5;
    }
    if (params.streakBonus && params.streakBonus > 0) {
      lines.push({ label: "STREAK BONUS", value: `+${params.streakBonus} pts`, color: "#00FFFF", icon: "🔥", animated: true });
      total += params.streakBonus;
    }
    if (params.crowdVoteBonus && params.crowdVoteBonus > 0) {
      lines.push({ label: "CROWD VOTE", value: `+${params.crowdVoteBonus} pts`, color: "#AA2DFF", icon: "🗳️", animated: true });
      total += params.crowdVoteBonus;
    }
    if (params.upsetBonus) {
      lines.push({ label: "UPSET WIN", value: "+15 pts", color: "#FF6B35", icon: "⚡", animated: true });
      total += 15;
    }
    if (params.prizeUsd && params.prizeUsd > 0) {
      lines.push({ label: "CASH PRIZE", value: `$${params.prizeUsd.toFixed(2)}`, color: "#00FF88", icon: "💵", animated: true });
    }
    if (params.badgeAwarded) {
      lines.push({ label: "BADGE EARNED", value: params.badgeAwarded, color: "#FFD700", icon: "🎖️", animated: false });
    }

    // Total line
    lines.push({ label: "TOTAL EARNED", value: `${total} pts`, color: "#FFD700", icon: "✨", animated: true });

    // Queue article draft
    const articleDraftId = `draft-${Date.now()}-${++articleDraftSeq}`;
    this.articleDrafts.push({
      draftId: articleDraftId,
      battleId: params.battleId,
      winnerName: params.winnerDisplayName,
      createdAt: Date.now(),
    });

    const splash: RewardSplash = {
      splashId: `splash-${Date.now()}-${++splashSeq}`,
      battleId: params.battleId,
      winnerUserId: params.winnerUserId,
      winnerDisplayName: params.winnerDisplayName,
      totalPoints: total,
      pointBreakdown: lines,
      prizeUsd: params.prizeUsd,
      badgeAwarded: params.badgeAwarded,
      replayRoute: params.replayRoute ?? `/battles/replay/${params.battleId}`,
      articleDraftQueued: true,
      articleDraftId,
      createdAt: Date.now(),
    };

    this.splashes.set(splash.splashId, splash);
    return splash;
  }

  getSplash(splashId: string): RewardSplash | undefined {
    return this.splashes.get(splashId);
  }

  getSplashForBattle(battleId: string): RewardSplash | undefined {
    return [...this.splashes.values()].find((s) => s.battleId === battleId);
  }

  getArticleDrafts() {
    return [...this.articleDrafts];
  }

  /** Participation points for the loser */
  getParticipationReward(): number {
    return 8;
  }
}

export const rewardSplashEngine = new RewardSplashEngine();
