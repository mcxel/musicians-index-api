// apps/web/src/lib/realtime/websocket-hooks.ts
// React hooks for all WebSocket connections.
// Uses socket.io-client.

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4001";

// ── BASE HOOK ────────────────────────────────────────
function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${WS_URL}${namespace}`, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [namespace]);

  return { socket: socketRef.current, connected };
}

// ── ROOM HOOK (Platform Law #1 — viewers_asc) ────────
export function useRoom(roomId: string | null) {
  const { socket, connected } = useSocket("/rooms");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [lighting, setLighting] = useState("standard");
  const [djBpm, setDjBpm] = useState<number | null>(null);
  const [hypePercent, setHypePercent] = useState(0);
  const [adBreakActive, setAdBreakActive] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join_room", { roomId });
    socket.on("viewer_count",    (data: any) => setViewerCount(data.count));
    socket.on("chat_message",    (msg: any) => setChatMessages(prev => [...prev.slice(-99), msg]));
    socket.on("lighting_change", (data: any) => setLighting(data.preset));
    socket.on("dj_bpm_update",   (data: any) => setDjBpm(data.bpm));
    socket.on("hype_update",     (data: any) => setHypePercent(data.hypePercent));
    socket.on("ad_break_start",  () => setAdBreakActive(true));
    socket.on("ad_break_end",    () => setAdBreakActive(false));
    return () => {
      socket.emit("leave_room", { roomId });
      ["viewer_count","chat_message","lighting_change","dj_bpm_update","hype_update","ad_break_start","ad_break_end"].forEach(e => socket.off(e));
    };
  }, [socket, roomId]);

  const sendMessage = useCallback((body: string) => {
    if (socket && roomId) socket.emit("send_message", { roomId, body });
  }, [socket, roomId]);

  return { connected, viewerCount, chatMessages, lighting, djBpm, hypePercent, adBreakActive, sendMessage };
}

// ── LOBBY HOOK (discovery-first sort) ────────────────
export function useLobby() {
  const { socket, connected } = useSocket("/rooms");
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("lobby_update", (data: any) => {
      // data.sortedBy === "viewer_count_asc" — Platform Law #1
      setRooms(data.rooms); // always sorted 0 viewers first
    });
    return () => socket.off("lobby_update");
  }, [socket]);

  return { connected, rooms };
}

// ── GAME HOOK ─────────────────────────────────────────
export function useGame(sessionId: string | null) {
  const { socket, connected } = useSocket("/games");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundStatus, setRoundStatus] = useState<string>("lobby");
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("join_game", { sessionId });
    socket.on("score_update",     (d: any) => setScores(d.scores));
    socket.on("round_started",    (d: any) => setRoundStatus("active"));
    socket.on("round_winner",     (d: any) => setRoundWinner(d.winnerId));
    socket.on("session_complete", (d: any) => { setSessionComplete(true); setWinnerId(d.winnerId); });
    socket.on("points_awarded",   (d: any) => setPointsAwarded(d.points));
    return () => {
      ["score_update","round_started","round_winner","session_complete","points_awarded"].forEach(e => socket.off(e));
    };
  }, [socket, sessionId]);

  const vote = useCallback((targetId: string) => {
    if (socket && sessionId) socket.emit("vote", { sessionId, targetId });
  }, [socket, sessionId]);

  return { connected, scores, roundStatus, roundWinner, sessionComplete, winnerId, pointsAwarded, vote };
}

// ── CROWN HOOK (global crown animation) ──────────────
export function useCrown() {
  const { socket, connected } = useSocket("/crown");
  const [crownEvent, setCrownEvent] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("crown_awarded", (data: any) => {
      setCrownEvent(data);
      // animationDurationMs: 3000 — Platform Law
      setTimeout(() => setCrownEvent(null), data.animationDurationMs || 3000);
    });
    return () => socket.off("crown_awarded");
  }, [socket]);

  return { connected, crownEvent };
}

// ── NOTIFICATIONS HOOK ────────────────────────────────
export function useNotifications(userId: string | null) {
  const { socket, connected } = useSocket("/notifications");
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<any | null>(null);

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit("subscribe", { userId });
    socket.on("notification",    (n: any) => { setUnreadCount(c => c + 1); setLatest(n); });
    socket.on("unread_count",    (d: any) => setUnreadCount(d.count));
    return () => { socket.off("notification"); socket.off("unread_count"); };
  }, [socket, userId]);

  return { connected, unreadCount, latest };
}
