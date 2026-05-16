import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

type PointsSnapshot = {
  level: number;
  totalXp: number;
  xpToNextLevel?: number;
  totalRewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  currentStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  rankMovement: number | "up" | "down" | "stable";
  nextUnlock: string | null;
};

const FALLBACK_SNAPSHOT: PointsSnapshot = {
  level: 1,
  totalXp: 0,
  xpToNextLevel: 1000,
  totalRewardPoints: 0,
  bonusPoints: 0,
  seasonPoints: 0,
  currentStreak: 0,
  dailyStreak: 0,
  weeklyStreak: 0,
  rankMovement: "stable",
  nextUnlock: "Battle Intro Pack",
};

export async function GET(req: Request) {
  try {
    const apiRes = await proxyToApi(req, "/api/julius/me/points");

    if (apiRes.ok) {
      return apiRes;
    }

    if (apiRes.status === 401 || apiRes.status === 403) {
      return NextResponse.json({ snapshot: FALLBACK_SNAPSHOT, source: "fallback" });
    }

    return apiRes;
  } catch {
    return NextResponse.json({ snapshot: FALLBACK_SNAPSHOT, source: "fallback" });
  }
}
