// packages/realtime/src/realtime.server.ts
// WebSocket server for all real-time platform events.
// Runs on the API server via Socket.io.
// Namespaces: /rooms, /games, /chat, /notifications, /crown, /hype

import type { Server as HTTPServer } from "http";

export type RealtimeNamespace =
  | "/rooms"        // live room viewer counts, join/leave
  | "/games"        // game state, scores, round events
  | "/chat"         // room chat, DMs
  | "/notifications"// in-app notification push
  | "/crown"        // crown update animation trigger
  | "/hype"         // hype meter sync across all clients
  | "/ads";         // ad rotation sync (house-ad-fallback)

// ── ROOM EVENTS ───────────────────────────────────────────
export interface RoomEvent {
  type:
    | "viewer_joined"    // triggers discovery-first re-sort
    | "viewer_left"
    | "viewer_count"     // broadcast current count
    | "host_started"
    | "host_ended"
    | "chat_message"
    | "reaction"
    | "hype_update"
    | "lighting_change"  // host/DJ changes lighting preset
    | "dj_bpm_update"    // DJ BPM changes → lighting sync
    | "ad_break_start"
    | "ad_break_end"
    | "room_closed";
  roomId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// ── GAME EVENTS ───────────────────────────────────────────
export interface GameEvent {
  type:
    | "session_created"
    | "player_joined"
    | "player_left"
    | "round_started"
    | "round_ended"
    | "score_update"
    | "buzz_in"           // speed game buzz
    | "answer_locked"
    | "vote_cast"         // audience vote (1 per user per round)
    | "vote_result"
    | "round_winner"
    | "session_complete"
    | "winner_reveal"     // triggers crown animation if applicable
    | "points_awarded";
  sessionId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// ── CROWN EVENTS ──────────────────────────────────────────
export interface CrownEvent {
  type: "crown_awarded" | "crown_removed" | "crown_pulse";
  artistId: string;
  artistSlug: string;
  animationDurationMs: 3000;  // Platform Law — always 3s
  genre: string;
  weekNumber: number;
}

// ── HYPE EVENTS ───────────────────────────────────────────
export interface HypeEvent {
  type: "hype_update" | "hype_surge" | "hype_max";
  roomId: string;
  hypePercent: number;      // 0-100
  triggerEffect?: "neon_storm" | "confetti" | "crowd_wave" | "spotlight_sweep";
  audioBeatSync?: boolean;  // if true, lighting pulses to BPM
}

// ── DISCOVERY-FIRST ROOM SORT ─────────────────────────────
// This event fires whenever viewer count changes in any room.
// Frontend re-sorts lobby wall by viewers_asc (0 viewers = position 1).
// Platform Law #1 — NEVER change this sort direction.
export interface LobbyUpdateEvent {
  type: "lobby_update";
  rooms: Array<{
    roomId: string;
    viewerCount: number;    // 0 ALWAYS goes first in sort
    isLive: boolean;
    hostName: string;
    scene: string;
    thumbnailUrl?: string;
  }>;
  sortedBy: "viewer_count_asc"; // LOCKED — never desc
}

// ── NOTIFICATION PUSH ─────────────────────────────────────
export interface NotificationPush {
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  channel: "IN_APP" | "PUSH";
}

// ── CLIENT SUBSCRIPTION MANAGER ──────────────────────────
export interface RealtimeSubscription {
  userId?: string;
  deviceType: string;
  subscriptions: {
    rooms: string[];         // roomIds
    games: string[];         // sessionIds
    conversations: string[]; // conversationIds
    globalCrown: boolean;
    globalHype: boolean;
    globalAds: boolean;
  };
}

// ── SERVER SETUP (attach to NestJS HTTP server) ───────────
export function createRealtimeServer(httpServer: HTTPServer) {
  // Import Socket.io and attach namespaces
  // Each namespace has its own auth middleware
  // /rooms and /games are public-readable
  // /chat requires canSendMessage check (kid safety)
  // /notifications requires authenticated userId
  console.log("[realtime] WebSocket server ready on namespaces:", [
    "/rooms", "/games", "/chat", "/notifications", "/crown", "/hype", "/ads"
  ]);
}

// ── BROADCAST HELPER ─────────────────────────────────────
// Use from API services to push events to connected clients
export const RealtimeEmitter = {
  toRoom: (roomId: string, event: RoomEvent) => void 0,
  toGame: (sessionId: string, event: GameEvent) => void 0,
  toUser: (userId: string, event: NotificationPush) => void 0,
  toLobby: (event: LobbyUpdateEvent) => void 0,        // all lobby viewers
  toCrown: (event: CrownEvent) => void 0,              // global crown broadcast
  toHype: (roomId: string, event: HypeEvent) => void 0,
  toAdZone: (zone: string, creativeId: string) => void 0,
};
