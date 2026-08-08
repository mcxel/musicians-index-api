"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoomBubbleChatEngine, type FloatingBubble } from "@/lib/chat/RoomBubbleChatEngine";
import type { RoomChatMessage } from "@/lib/chat/RoomChatEngine";

function seatToPosition(seatId: string | null, userId: string): { x: number; y: number } {
  if (seatId) {
    const row = parseInt(seatId.replace(/\D/g, ""), 10) || 0;
    const colHash = seatId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      x: 0.12 + ((colHash % 76) / 100),
      y: 0.28 + Math.min(0.42, (row % 12) * 0.035),
    };
  }
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) % 997;
  return { x: 0.15 + (h % 70) / 100, y: 0.35 + ((h >> 3) % 40) / 100 };
}

export function audienceMessageToRoomChat(input: {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: number;
  seatId?: string | null;
  avatarUrl?: string;
}): RoomChatMessage {
  return {
    id: input.id,
    roomId: "venue-room",
    userId: input.userId,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    role: "audience",
    text: input.text,
    timestampMs: input.createdAt,
  };
}

export function useVenueSpeechBubbles(
  messages: { id: string; userId: string; displayName: string; text: string; createdAt: number }[],
  seatByUser: Record<string, string | null>,
) {
  const engineRef = useRef<RoomBubbleChatEngine | null>(null);
  if (!engineRef.current) engineRef.current = new RoomBubbleChatEngine(24);
  const seenRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);

  useEffect(() => {
    const engine = engineRef.current!;
    const now = Date.now();

    if (!initializedRef.current) {
      for (const m of messages) seenRef.current.add(m.id);
      initializedRef.current = true;
      return;
    }

    for (const m of messages) {
      if (seenRef.current.has(m.id)) continue;
      seenRef.current.add(m.id);
      const roomMsg = audienceMessageToRoomChat({
        ...m,
        seatId: seatByUser[m.userId] ?? null,
      });
      const pos = seatToPosition(seatByUser[m.userId] ?? null, m.userId);
      engine.createBubble(roomMsg, pos, 4200, now);
    }
    setBubbles(engine.getActiveBubbles(now));
  }, [messages, seatByUser]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;
      setBubbles(engine.getActiveBubbles(Date.now()));
    }, 120);
    return () => window.clearInterval(tick);
  }, []);

  const seatMap = useMemo(() => seatByUser, [seatByUser]);
  return { bubbles, seatMap };
}
