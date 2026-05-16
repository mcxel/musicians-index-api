"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
        status: bot.role === "SENTINEL" ? "ACTIVE" : "ACTIVE",
        lastHeartbeatMs: now - Math.floor(Math.random() * 4000),
        taskCount: Math.floor(Math.random() * 12),
      });
    }
  }

  return records;
}

export default function BotActivationProvider({ children }: { children: React.ReactNode }) {
  const [activeBots, setActiveBots] = useState<ActiveBotRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const bots = buildActiveBots();
    setActiveBots(bots);
    setIsReady(true);

    heartbeatRef.current = setInterval(() => {
      setActiveBots((prev) =>
        prev.map((r) => ({
          ...r,
          lastHeartbeatMs: Date.now(),
          taskCount: Math.max(0, r.taskCount + Math.floor((Math.random() - 0.3) * 3)),
          status: Math.random() > 0.97 ? "ALERT" : r.bot.role === "SENTINEL" ? "ACTIVE" : (Math.random() > 0.15 ? "ACTIVE" : "IDLE"),
        }))
      );
    }, 8000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
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
