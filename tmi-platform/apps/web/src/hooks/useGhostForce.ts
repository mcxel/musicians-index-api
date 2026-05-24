"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { startGhostForceV1 } from "@/lib/bots/BotDripEmitter";

export interface GhostMessage {
  id: string;
  botName: string;
  text: string;
  type: "chat" | "hype" | "tip";
  ts: number;
}

export interface GhostForceState {
  messages: GhostMessage[];
  viewerCount: number;
  hypeLevel: number;
}

function genId(): string {
  return `g${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

// Seed viewer count: random between 12 and 60 so room never looks empty
function seedViewers(): number {
  return 12 + Math.floor(Math.random() * 48);
}

export function useGhostForce(roomId: string, enabled = true): GhostForceState {
  const [messages, setMessages] = useState<GhostMessage[]>([]);
  const [viewerCount, setViewerCount] = useState<number>(seedViewers());
  const [hypeLevel, setHypeLevel] = useState<number>(0);
  const stopRef = useRef<(() => void) | null>(null);

  const addMsg = useCallback((botName: string, text: string, type: GhostMessage["type"]) => {
    setMessages((prev) => [
      { id: genId(), botName, text, type, ts: Date.now() },
      ...prev.slice(0, 49), // keep last 50
    ]);
    // Viewer count drifts slightly with each event
    setViewerCount((v) => Math.max(8, v + (Math.random() > 0.4 ? 1 : -1)));
    if (type === "hype") setHypeLevel((h) => Math.min(100, h + 15));
    if (type === "tip")  setHypeLevel((h) => Math.min(100, h + 25));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    stopRef.current = startGhostForceV1(roomId, {
      onChat: (n, t) => addMsg(n, t, "chat"),
      onHype: (n)    => addMsg(n, "🔥", "hype"),
      onTip:  (n)    => addMsg(n, "💸 tipped the performer", "tip"),
      onDiag: ()     => void 0, // suppress diag in production
    });

    // Slow hype decay — every 30s
    const decay = setInterval(() => {
      setHypeLevel((h) => Math.max(0, h - 5));
    }, 30000);

    return () => {
      stopRef.current?.();
      clearInterval(decay);
    };
  }, [roomId, enabled, addMsg]);

  return { messages, viewerCount, hypeLevel };
}
