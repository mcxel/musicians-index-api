"use client";

import { useCallback, useEffect, useState } from "react";

type EnergyLabel = "COLD" | "WARMING" | "HOT" | "ON FIRE" | "LEGENDARY";

function labelFor(score: number): EnergyLabel {
  if (score >= 80) return "LEGENDARY";
  if (score >= 60) return "ON FIRE";
  if (score >= 40) return "HOT";
  if (score >= 20) return "WARMING";
  return "COLD";
}

export interface RoomEnergyHook {
  energyScore: number;
  energyLabel: EnergyLabel;
  bumpEnergy: (amount: number) => void;
}

export function useRoomEnergy(seed = 22): RoomEnergyHook {
  const [score, setScore] = useState(seed);

  const bumpEnergy = useCallback((amount: number) => {
    setScore((s) => Math.min(100, Math.max(0, s + amount)));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setScore((s) => Math.max(5, s - 2));
    }, 45_000);
    return () => clearInterval(id);
  }, []);

  return { energyScore: score, energyLabel: labelFor(score), bumpEnergy };
}
