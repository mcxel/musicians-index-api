"use client";

import { useEffect, useRef, useState } from "react";

export type QueueState = {
  status: string;
  memberCount: number;
  roundIndex: number;
};

const INITIAL: QueueState = { status: "PRESHOW", memberCount: 0, roundIndex: 0 };

export function usePerformanceQueue(roomId: string, pollMs = 5000): QueueState {
  const [state, setState] = useState<QueueState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!roomId) return;

    function poll() {
      fetch(`/api/rooms/${encodeURIComponent(roomId)}`, { cache: "no-store", credentials: "include" })
        .then(r => r.json())
        .then((d: unknown) => {
          const data = d as {
            status?: string;
            members?: unknown[];
            sessions?: { status?: string }[];
          };
          const sessionStatuses = Array.isArray(data?.sessions) ? data.sessions : [];
          const activeRound = sessionStatuses.findIndex(s => s.status === "ACTIVE");
          setState({
            status:      data?.status ?? "PRESHOW",
            memberCount: Array.isArray(data?.members) ? data.members.length : 0,
            roundIndex:  activeRound >= 0 ? activeRound : 0,
          });
        })
        .catch(() => {});
    }

    poll();
    timerRef.current = setInterval(poll, pollMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId, pollMs]);

  return state;
}
