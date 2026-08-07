"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SENTINEL_BOTS,
  getSurfaceBots,
  type SurfaceKey,
  type BotDef,
  type BotStatus,
} from "@/lib/botRegistry";

const ALL_SURFACES: SurfaceKey[] = [
  "home1", "home2", "home3", "home4", "home5",
  "rooms", "cypher", "monday-stage", "checkout", "admin",
];

export interface ActiveBotRecord {
  bot: BotDef;
  surface: SurfaceKey;
  status: BotStatus;
  lastHeartbeatMs: number;
  taskCount: number;
}

interface BotActivationContextValue {
  activeBots: ActiveBotRecord[];
  totalActive: number;
  totalSentinel: number;
  totalFunctional: number;
  surfaces: SurfaceKey[];
  getBotsForSurface: (surface: SurfaceKey) => ActiveBotRecord[];
  isReady: boolean;
}

const BotActivationContext = createContext<BotActivationContextValue>({
  activeBots: [],
  totalActive: 0,
  totalSentinel: 0,
  totalFunctional: 0,
  surfaces: [],
  getBotsForSurface: () => [],
  isReady: false,
});

export function useBotActivation() {
  return useContext(BotActivationContext);
}

function buildActiveBots(): ActiveBotRecord[] {
  const seen = new Set<string>();
  const records: ActiveBotRecord[] = [];
  const now = Date.now();

  for (const surface of ALL_SURFACES) {
    const bots = getSurfaceBots(surface);
    for (const bot of bots) {
      const key = `${bot.id}-${surface}`;
      if (seen.has(key)) continue;
      seen.add(key);
      records.push({
        bot,
        surface,
        status: "ACTIVE",
        // Rule 20: static activation snapshot — no fake heartbeat/task pulses.
        lastHeartbeatMs: now,
        taskCount: 0,
      });
    }
  }

  return records;
}

export default function BotActivationProvider({ children }: { children: React.ReactNode }) {
  const [activeBots, setActiveBots] = useState<ActiveBotRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setActiveBots(buildActiveBots());
    setIsReady(true);
  }, []);

  function getBotsForSurface(surface: SurfaceKey): ActiveBotRecord[] {
    return activeBots.filter((r) => r.surface === surface);
  }

  const sentinelBots = activeBots.filter((r) => r.bot.role === "SENTINEL");
  const functionalBots = activeBots.filter((r) => r.bot.role !== "SENTINEL");
  const activeCount = activeBots.filter((r) => r.status === "ACTIVE").length;

  return (
    <BotActivationContext.Provider
      value={{
        activeBots,
        totalActive: activeCount,
        totalSentinel: sentinelBots.length,
        totalFunctional: functionalBots.length,
        surfaces: ALL_SURFACES,
        getBotsForSurface,
        isReady,
      }}
    >
      {children}
    </BotActivationContext.Provider>
  );
}
