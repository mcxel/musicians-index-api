"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getRoomPresence } from "@/lib/rooms/RoomPresenceEngine";
import { getRoomPopulation, tickPopulation } from "@/lib/rooms/RoomPopulationEngine";
import { applyIntentToRoom, getIntentSummary, pushIntentEvent } from "@/lib/rooms/CrowdIntentEngine";
import { joinRoom, listRoomMembers } from "@/lib/rooms/RoomJoinEngine";
import { getLobbyQueue } from "@/lib/lobby/LobbyQueueRuntime";
import { getRoomTipTotal, listTipsByRoom, sendLiveTip } from "@/lib/live/LiveTipEngine";
import { runSentinelCheck } from "@/lib/sentinels/ShadowSentinelDiagnosticRegistry";
import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";

export type StageState = "pre-show" | "reveal" | "live";

export type SharedStageRoomData = {
  normalizedRoomId: ChatRoomId;
  roomType: "battle" | "cypher" | "concert" | "game";
  stageState: StageState;
  setStageState: (next: StageState) => void;
  presence: ReturnType<typeof getRoomPresence>;
  population: ReturnType<typeof getRoomPopulation>;
  members: ReturnType<typeof listRoomMembers>;
  queueCount: number;
  tipTotalCents: number;
  tipsCount: number;
  recentTips: { name: string; amount: number }[];
  intentSummary: ReturnType<typeof getIntentSummary>;
  emojiTrail: string[];
  sentinel: { label: string; color: string };
  triggerHype: () => void;
  triggerTip: () => void;
};

const CHAT_ROOM_MAP: Record<string, ChatRoomId> = {
  "monthly-idol": "monthly-idol",
  "monday-night-stage": "monday-night-stage",
  "deal-or-feud": "deal-or-feud",
  "name-that-tune": "name-that-tune",
  "circle-squares": "circle-squares",
  "cypher-arena": "cypher-arena",
  "venue-room": "venue-room",
};

function normalizeRoomId(raw: string): ChatRoomId {
  return CHAT_ROOM_MAP[raw] ?? "venue-room";
}

function detectRoomType(roomId: string): "battle" | "cypher" | "concert" | "game" {
  const id = roomId.toLowerCase();
  if (id.includes("battle") || id.includes("clash")) return "battle";
  if (id.includes("cypher")) return "cypher";
  if (id.includes("game") || id.includes("trivia") || id.includes("show")) return "game";
  return "concert";
}

function getViewerId(roomId: string): string {
  if (typeof window === "undefined") return `viewer-${roomId}`;
  const key = `tmi.stage-seat.viewer.${roomId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `viewer-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export function useSharedStageRoomData(roomId: string): SharedStageRoomData {
  const normalizedRoomId = useMemo(() => normalizeRoomId(roomId), [roomId]);
  const roomType = useMemo(() => detectRoomType(normalizedRoomId), [normalizedRoomId]);
  const viewerIdRef = useRef<string>("guest-viewer");

  const [stageState, setStageState] = useState<StageState>("pre-show");
  const [presence, setPresence] = useState(() => getRoomPresence(normalizedRoomId));
  const [population, setPopulation] = useState(() => getRoomPopulation(normalizedRoomId));
  const [members, setMembers] = useState(() => listRoomMembers(normalizedRoomId));
  const [queueCount, setQueueCount] = useState(() => getLobbyQueue(normalizedRoomId).length);
  const [tipTotalCents, setTipTotalCents] = useState(() => getRoomTipTotal(normalizedRoomId));
  const [tipsCount, setTipsCount] = useState(() => listTipsByRoom(normalizedRoomId, 20).length);
  const [intentSummary, setIntentSummary] = useState(() => getIntentSummary(normalizedRoomId, Date.now()));
  const [emojiTrail, setEmojiTrail] = useState<string[]>([]);
  const [sentinel, setSentinel] = useState<{ label: string; color: string }>({
    label: "🟢 Systems Nominal",
    color: "rgba(0,255,136,0.7)",
  });

  useEffect(() => {
    const viewerId = getViewerId(normalizedRoomId);
    viewerIdRef.current = viewerId;
    joinRoom(normalizedRoomId, viewerId);
  }, [normalizedRoomId]);

  useEffect(() => {
    const id = setInterval(() => {
      setPresence(getRoomPresence(normalizedRoomId));
      setPopulation(getRoomPopulation(normalizedRoomId));
      setMembers(listRoomMembers(normalizedRoomId));
      setQueueCount(getLobbyQueue(normalizedRoomId).length);
      setTipTotalCents(getRoomTipTotal(normalizedRoomId));
      setTipsCount(listTipsByRoom(normalizedRoomId, 20).length);
      setIntentSummary(getIntentSummary(normalizedRoomId, Date.now()));
    }, 2000);

    return () => clearInterval(id);
  }, [normalizedRoomId]);

  useEffect(() => {
    const id = setInterval(() => {
      const tipList = listTipsByRoom(normalizedRoomId, 20);
      const lastTs = tipList.length > 0 ? tipList[tipList.length - 1]?.sentAtMs ?? null : null;
      const result = runSentinelCheck({
        roomId: normalizedRoomId,
        messageCount: 0,
        lastMessageTs: lastTs,
        tipTotalCents: getRoomTipTotal(normalizedRoomId),
        tipsCount: tipList.length,
      });

      if (result.visualAuthority === "dead-link" || result.commerceBridge === "broken") {
        setSentinel({ label: "🔴 Stream Error", color: "rgba(255,51,51,0.8)" });
      } else if (result.chatHealth === "deadlocked" || result.audioSync === "drifting") {
        setSentinel({ label: "🟡 Audio Sync Issue", color: "rgba(255,215,0,0.8)" });
      } else if (result.chatHealth === "stale") {
        setSentinel({ label: "⚠️ Chat Stale", color: "rgba(255,179,71,0.8)" });
      } else {
        setSentinel({ label: "🟢 Systems Nominal", color: "rgba(0,255,136,0.7)" });
      }
    }, 30000);

    return () => clearInterval(id);
  }, [normalizedRoomId]);

  function pushEmoji(symbol: string): void {
    setEmojiTrail((prev) => [...prev.slice(-5), symbol]);
  }

  function triggerHype(): void {
    pushIntentEvent(normalizedRoomId, viewerIdRef.current, "hype", 72, Date.now());
    applyIntentToRoom(normalizedRoomId, "hype", 72);
    tickPopulation(normalizedRoomId);
    pushEmoji("🔥");
    setIntentSummary(getIntentSummary(normalizedRoomId, Date.now()));
    setPopulation(getRoomPopulation(normalizedRoomId));
  }

  function triggerTip(): void {
    sendLiveTip({
      roomId: normalizedRoomId,
      fromFanId: viewerIdRef.current,
      fromDisplayName: "You",
      toPerformerId: `performer-${normalizedRoomId}`,
      toDisplayName: "Live Performer",
      amountCents: 100,
      message: "Keep going",
    });
    pushIntentEvent(normalizedRoomId, viewerIdRef.current, "tip", 80, Date.now());
    applyIntentToRoom(normalizedRoomId, "tip", 80);
    tickPopulation(normalizedRoomId);
    pushEmoji("💸");
    setTipTotalCents(getRoomTipTotal(normalizedRoomId));
    setTipsCount(listTipsByRoom(normalizedRoomId, 20).length);
    setIntentSummary(getIntentSummary(normalizedRoomId, Date.now()));
    setPopulation(getRoomPopulation(normalizedRoomId));
  }

  const recentTips = useMemo(() => {
    return listTipsByRoom(normalizedRoomId, 8).map((tip) => ({
      name: tip.fromDisplayName,
      amount: Math.max(1, Math.floor(tip.amountCents / 100)),
    }));
  }, [normalizedRoomId, tipTotalCents, tipsCount]);

  return {
    normalizedRoomId,
    roomType,
    stageState,
    setStageState,
    presence,
    population,
    members,
    queueCount,
    tipTotalCents,
    tipsCount,
    recentTips,
    intentSummary,
    emojiTrail,
    sentinel,
    triggerHype,
    triggerTip,
  };
}
