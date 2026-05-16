"use client";

import { useState } from "react";

interface TelemetryLog {
  timestamp: number;
  actionType: string;
}

export function useWardenBot(userId: string, constraintThreshold: number = 10) {
  const [clickLog, setClickLog] = useState<TelemetryLog[]>([]);
  const [isQuarantined, setIsQuarantined] = useState(false);

  const registerUserAction = (actionType: string) => {
    if (isQuarantined) return false;

    const now = Date.now();
    const updatedLogs = [...clickLog, { timestamp: now, actionType }].filter(
      (log) => now - log.timestamp < 1000
    );

    setClickLog(updatedLogs);

    // If actions within a single rolling second exceed our safety threshold
    if (updatedLogs.length > constraintThreshold) {
      setIsQuarantined(true);
      console.warn(`[WARDEN BOT ALERT]: Account ${userId} isolated for transaction velocity spamming.`);
      return false;
    }

    return true;
  };

  return {
    registerUserAction,
    isQuarantined,
    resetQuarantine: () => {
      setClickLog([]);
      setIsQuarantined(false);
    }
  };
}