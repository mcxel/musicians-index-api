"use client";

import { useEffect, useMemo, useState } from "react";
import JuliusPointsHUD from "@/components/julius/JuliusPointsHUD";

type RankMovement = "up" | "down" | "stable";

type SnapshotPayload = {
  level: number;
  totalXp: number;
  xpToNextLevel?: number;
  totalRewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  currentStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  rankMovement: number | RankMovement;
  nextUnlock: string | null;
};

type SnapshotResponse = {
  snapshot?: SnapshotPayload;
};

const FALLBACK_SNAPSHOT: SnapshotPayload = {
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

function toRankMovement(value: number | RankMovement | undefined): RankMovement {
  if (value === "up" || value === "down" || value === "stable") return value;
  if (typeof value === "number") {
    if (value > 0) return "up";
    if (value < 0) return "down";
  }
  return "stable";
}

export default function JuliusHudDock({
  surface,
  compact = false,
}: {
  surface: string;
  compact?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<SnapshotPayload>(FALLBACK_SNAPSHOT);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const res = await fetch("/api/julius/snapshot", { cache: "no-store", credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as SnapshotResponse;
        if (data.snapshot) {
          setSnapshot({ ...FALLBACK_SNAPSHOT, ...data.snapshot });
        }
      } catch {
        // Keep fallback snapshot for unauthenticated or offline rendering.
      }
    };

    void fetchSnapshot();
  }, []);

  const wrapperStyle = useMemo(
    () => ({
      position: "fixed" as const,
      zIndex: 45,
      right: compact ? 12 : 16,
      bottom: compact ? 12 : 16,
      transform: compact ? "scale(0.88)" : "none",
      transformOrigin: "bottom right",
      pointerEvents: "none" as const,
    }),
    [compact],
  );

  return (
    <aside aria-label={`Julius HUD ${surface}`} style={wrapperStyle}>
      <div style={{ pointerEvents: "auto" }}>
        <JuliusPointsHUD
          level={snapshot.level}
          currentXp={snapshot.totalXp}
          xpToNextLevel={snapshot.xpToNextLevel ?? 1000}
          rewardPoints={snapshot.totalRewardPoints}
          bonusPoints={snapshot.bonusPoints}
          seasonPoints={snapshot.seasonPoints}
          currentStreak={snapshot.currentStreak}
          dailyStreak={snapshot.dailyStreak}
          weeklyStreak={snapshot.weeklyStreak}
          rankMovement={toRankMovement(snapshot.rankMovement)}
          nextUnlock={snapshot.nextUnlock ?? "Mystery Drop"}
        />
      </div>
    </aside>
  );
}
