import { prisma } from "@/lib/prisma";
import { getLevelForXP } from "@/lib/xp/xpEngine";
import { matchHistoryEngine } from "./MatchHistoryEngine";

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  slug: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  tier: string;
  avatarUrl: string | null;
  skillRating: number;
  wins: number;
  losses: number;
  streak: number;
  genre: string;
}

export class LeaderboardService {
  /**
   * Fetches the top users by XP (Platform Rankings)
   */
  static async getXPLeaderboard(limit = 25): Promise<LeaderboardUser[]> {
    try {
      const stats = await prisma.userStats.findMany({
        where: {
          xp: { gt: 0 },
          user: {
            isQA: false,
          },
        },
        orderBy: { xp: "desc" },
        take: limit,
        include: {
          user: {
            include: {
              artistProfile: {
                select: { stageName: true, slug: true, genres: true },
              },
            },
          },
        },
      });

      // Gather ratings and match stats for each user in parallel
      const resolved = await Promise.all(
        stats.map(async (row, idx) => {
          const user = row.user;
          const artistProfile = user.artistProfile;
          const lvl = getLevelForXP(row.xp);

          const [rating, matchStats] = await Promise.all([
            prisma.competitorRating.findUnique({ where: { userId: row.userId } }),
            matchHistoryEngine.getPlayerStats(row.userId),
          ]);

          return {
            rank: idx + 1,
            userId: row.userId,
            name: artistProfile?.stageName ?? user.displayName ?? user.name ?? "Anonymous",
            slug: artistProfile?.slug ?? null,
            xp: row.xp,
            level: lvl.level,
            levelTitle: lvl.title,
            tier: user.tier ?? "FREE",
            avatarUrl: user.image ?? null,
            skillRating: rating?.skillRating ?? 1200,
            wins: matchStats.wins,
            losses: matchStats.losses,
            streak: matchStats.winStreak,
            genre: artistProfile?.genres?.[0] ?? "General",
          };
        })
      );

      return resolved;
    } catch (error) {
      console.error("[LeaderboardService.getXPLeaderboard] Error:", error);
      return [];
    }
  }

  /**
   * Fetches the top users by Elo skill rating (Crown / Competitive Rankings)
   */
  static async getEloLeaderboard(limit = 25): Promise<LeaderboardUser[]> {
    try {
      const ratings = await prisma.competitorRating.findMany({
        orderBy: { skillRating: "desc" },
        take: limit * 2, // pull extra to buffer QA exclusions
      });

      const userIds = ratings.map((r) => r.userId);

      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          isQA: false,
        },
        include: {
          artistProfile: {
            select: { stageName: true, slug: true, genres: true },
          },
          userStats: {
            select: { xp: true },
          },
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      // Filter and map ratings matching non-QA active users
      const validRatings = ratings
        .filter((r) => userMap.has(r.userId))
        .slice(0, limit);

      const resolved = await Promise.all(
        validRatings.map(async (r, idx) => {
          const user = userMap.get(r.userId)!;
          const artistProfile = user.artistProfile;
          const xp = user.userStats?.xp ?? 0;
          const lvl = getLevelForXP(xp);
          const matchStats = await matchHistoryEngine.getPlayerStats(r.userId);

          return {
            rank: idx + 1,
            userId: r.userId,
            name: artistProfile?.stageName ?? user.displayName ?? user.name ?? "Anonymous",
            slug: artistProfile?.slug ?? null,
            xp,
            level: lvl.level,
            levelTitle: lvl.title,
            tier: user.tier ?? "FREE",
            avatarUrl: user.image ?? null,
            skillRating: r.skillRating,
            wins: matchStats.wins,
            losses: matchStats.losses,
            streak: matchStats.winStreak,
            genre: artistProfile?.genres?.[0] ?? "General",
          };
        })
      );

      return resolved;
    } catch (error) {
      console.error("[LeaderboardService.getEloLeaderboard] Error:", error);
      return [];
    }
  }

  /**
   * Fetches the top users by Battle Wins (Power rankings)
   */
  static async getBattleWinsLeaderboard(limit = 10): Promise<LeaderboardUser[]> {
    try {
      // Group by winnerId to rank performers by total wins
      const winsGroup = await prisma.matchHistory.groupBy({
        by: ["winnerId"],
        where: { winnerId: { not: null } },
        _count: { winnerId: true },
        orderBy: { _count: { winnerId: "desc" } },
        take: limit * 2,
      });

      const winnerIds = winsGroup.map((g) => g.winnerId!).filter(Boolean);

      const users = await prisma.user.findMany({
        where: {
          id: { in: winnerIds },
          isQA: false,
        },
        include: {
          artistProfile: {
            select: { stageName: true, slug: true, genres: true },
          },
          userStats: { select: { xp: true } },
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      // Keep only valid entries belonging to active non-QA users
      const validWins = winsGroup
        .filter((g) => g.winnerId && userMap.has(g.winnerId))
        .slice(0, limit);

      const resolved = await Promise.all(
        validWins.map(async (g, idx) => {
          const userId = g.winnerId!;
          const user = userMap.get(userId)!;
          const artistProfile = user.artistProfile;
          const xp = user.userStats?.xp ?? 0;
          const lvl = getLevelForXP(xp);

          const [rating, matchStats] = await Promise.all([
            prisma.competitorRating.findUnique({ where: { userId } }),
            matchHistoryEngine.getPlayerStats(userId),
          ]);

          return {
            rank: idx + 1,
            userId,
            name: artistProfile?.stageName ?? user.displayName ?? user.name ?? "Anonymous",
            slug: artistProfile?.slug ?? null,
            xp,
            level: lvl.level,
            levelTitle: lvl.title,
            tier: user.tier ?? "FREE",
            avatarUrl: user.image ?? null,
            skillRating: rating?.skillRating ?? 1200,
            wins: matchStats.wins,
            losses: matchStats.losses,
            streak: matchStats.winStreak,
            genre: artistProfile?.genres?.[0] ?? "General",
          };
        })
      );

      return resolved;
    } catch (error) {
      console.error("[LeaderboardService.getBattleWinsLeaderboard] Error:", error);
      return [];
    }
  }
}
