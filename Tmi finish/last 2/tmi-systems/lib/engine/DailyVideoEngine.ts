/**
 * DailyVideoEngine.ts
 * Complete Daily.co integration engine for The Musician's Index.
 *
 * SETUP: Add to Vercel Environment Variables:
 *   DAILY_API_KEY = your key from dashboard.daily.co → Developers → API Keys
 *   DAILY_DOMAIN  = themusiciansindex  (your subdomain prefix)
 *
 * Covers:
 *  - Room creation (battle, cypher, stage, backstage, venue)
 *  - Room token generation (host vs participant)
 *  - Room listing and cleanup
 *  - Participant count tracking
 *  - Recording management
 *  - Bandwidth / quality profiles per room type
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type RoomType =
  | "battle"       // head-to-head, max 2 performers + audience
  | "cypher"       // open rotation, up to 16 performers
  | "stage"        // main performance, 1 headliner + large audience
  | "backstage"    // performer-only prep room
  | "venue"        // broadcast-only for large events (100–500)
  | "chat"         // small group video chat (2–8 people)
  | "admin";       // overseer monitoring room

export type TokenRole = "host" | "participant" | "viewer";

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  config: DailyRoomConfig;
  privacy: "public" | "private";
}

export interface DailyRoomConfig {
  max_participants?: number;
  enable_recording?: "local" | "cloud" | "raw-tracks";
  enable_chat?: boolean;
  enable_screenshare?: boolean;
  start_video_off?: boolean;
  start_audio_off?: boolean;
  exp?: number;                  // Unix timestamp expiry
  eject_after_elapsed?: number;  // seconds
  lang?: string;
  geo?: string;
}

export interface DailyToken {
  token: string;
  roomName: string;
  userId: string;
  role: TokenRole;
  expiresAt: number;
}

export interface CreateRoomRequest {
  type: RoomType;
  roomId?: string;              // custom ID; auto-generated if omitted
  expiryMinutes?: number;       // default 120
  enableRecording?: boolean;
}

export interface CreateTokenRequest {
  roomName: string;
  userId: string;
  userName: string;
  role: TokenRole;
  expiryMinutes?: number;
}

/* ─── Room config presets by type ─────────────────────────────────────────── */
const ROOM_PRESETS: Record<RoomType, DailyRoomConfig> = {
  battle: {
    max_participants: 50,        // 2 performers + 48 audience
    enable_recording: "cloud",
    enable_chat: true,
    enable_screenshare: false,
    start_video_off: false,
    start_audio_off: false,
  },
  cypher: {
    max_participants: 80,        // 16 performers + 64 audience
    enable_recording: "cloud",
    enable_chat: true,
    enable_screenshare: false,
    start_video_off: false,
    start_audio_off: false,
  },
  stage: {
    max_participants: 200,
    enable_recording: "cloud",
    enable_chat: true,
    enable_screenshare: true,
    start_video_off: false,
    start_audio_off: false,
  },
  backstage: {
    max_participants: 10,
    enable_recording: "local",
    enable_chat: true,
    enable_screenshare: false,
    start_video_off: false,
    start_audio_off: false,
  },
  venue: {
    max_participants: 500,
    enable_recording: "cloud",
    enable_chat: true,
    enable_screenshare: true,
    start_video_off: false,
    start_audio_off: false,
  },
  chat: {
    max_participants: 8,
    enable_recording: "local",
    enable_chat: true,
    enable_screenshare: true,
    start_video_off: false,
    start_audio_off: false,
  },
  admin: {
    max_participants: 20,
    enable_recording: "cloud",
    enable_chat: true,
    enable_screenshare: true,
    start_video_off: true,
    start_audio_off: true,
  },
};

/* ─── DailyVideoEngine (server-side only — uses secret API key) ──────────── */
export class DailyVideoEngine {
  private apiKey: string;
  private baseUrl = "https://api.daily.co/v1";
  private domain: string;

  constructor(apiKey?: string, domain?: string) {
    this.apiKey = apiKey ?? process.env.DAILY_API_KEY ?? "";
    this.domain = domain ?? process.env.DAILY_DOMAIN ?? "themusiciansindex";

    if (!this.apiKey) {
      console.warn(
        "[DailyVideoEngine] DAILY_API_KEY not set. Add it to your Vercel environment variables."
      );
    }
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /* ─── Room management ── */

  /** Create a new Daily room */
  async createRoom(req: CreateRoomRequest): Promise<DailyRoom> {
    const preset = ROOM_PRESETS[req.type];
    const expirySeconds = (req.expiryMinutes ?? 120) * 60;
    const roomName = req.roomId ?? `${req.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const config: DailyRoomConfig = {
      ...preset,
      exp: Math.floor(Date.now() / 1000) + expirySeconds,
      eject_after_elapsed: expirySeconds,
      enable_recording: req.enableRecording ? preset.enable_recording : undefined,
    };

    const resp = await fetch(`${this.baseUrl}/rooms`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        name: roomName,
        privacy: "public",
        properties: config,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`[DailyVideoEngine] createRoom failed: ${resp.status} ${err}`);
    }

    const data = await resp.json();
    return {
      id: data.id,
      name: data.name,
      url: data.url,
      createdAt: data.created_at,
      config,
      privacy: data.privacy,
    };
  }

  /** Get an existing room by name */
  async getRoom(roomName: string): Promise<DailyRoom | null> {
    const resp = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      headers: this.headers,
    });
    if (resp.status === 404) return null;
    if (!resp.ok) throw new Error(`[DailyVideoEngine] getRoom failed: ${resp.status}`);
    const data = await resp.json();
    return {
      id: data.id,
      name: data.name,
      url: data.url,
      createdAt: data.created_at,
      config: data.config ?? {},
      privacy: data.privacy,
    };
  }

  /** Get or create a room — idempotent, safe to call repeatedly */
  async getOrCreateRoom(req: CreateRoomRequest): Promise<DailyRoom> {
    if (req.roomId) {
      const existing = await this.getRoom(req.roomId);
      if (existing) return existing;
    }
    return this.createRoom(req);
  }

  /** Delete a room */
  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      method: "DELETE",
      headers: this.headers,
    });
  }

  /** List all rooms */
  async listRooms(): Promise<DailyRoom[]> {
    const resp = await fetch(`${this.baseUrl}/rooms`, { headers: this.headers });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      createdAt: r.created_at,
      config: r.config ?? {},
      privacy: r.privacy,
    }));
  }

  /* ─── Token generation ── */

  /** Create a meeting token for a user joining a room */
  async createToken(req: CreateTokenRequest): Promise<DailyToken> {
    const expirySeconds = (req.expiryMinutes ?? 60) * 60;
    const exp = Math.floor(Date.now() / 1000) + expirySeconds;

    const isHost = req.role === "host";

    const resp = await fetch(`${this.baseUrl}/meeting-tokens`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        properties: {
          room_name: req.roomName,
          user_id: req.userId,
          user_name: req.userName,
          is_owner: isHost,
          enable_recording: isHost ? "cloud" : undefined,
          start_video_off: req.role === "viewer",
          start_audio_off: req.role === "viewer",
          exp,
        },
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`[DailyVideoEngine] createToken failed: ${resp.status} ${err}`);
    }

    const data = await resp.json();
    return {
      token: data.token,
      roomName: req.roomName,
      userId: req.userId,
      role: req.role,
      expiresAt: exp * 1000,
    };
  }

  /* ─── Presence ── */

  /** Get current participant count in a room */
  async getPresence(roomName: string): Promise<number> {
    const resp = await fetch(`${this.baseUrl}/presence`, {
      headers: this.headers,
    });
    if (!resp.ok) return 0;
    const data = await resp.json();
    const rooms = data.data ?? [];
    const room = rooms.find((r: any) => r.id === roomName);
    return room?.participants ?? 0;
  }

  /** Get presence for all rooms */
  async getAllPresence(): Promise<Record<string, number>> {
    const resp = await fetch(`${this.baseUrl}/presence`, {
      headers: this.headers,
    });
    if (!resp.ok) return {};
    const data = await resp.json();
    const result: Record<string, number> = {};
    for (const room of data.data ?? []) {
      result[room.id] = room.participants ?? 0;
    }
    return result;
  }

  /* ─── Recordings ── */

  /** List recordings for a room */
  async listRecordings(roomName: string): Promise<any[]> {
    const resp = await fetch(
      `${this.baseUrl}/recordings?room_name=${roomName}`,
      { headers: this.headers }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.data ?? [];
  }

  /* ─── Room URL builder (client-safe) ── */

  /** Build the full Daily room URL from a room name */
  buildRoomUrl(roomName: string): string {
    return `https://${this.domain}.daily.co/${roomName}`;
  }
}

/* ─── Singleton ──────────────────────────────────────────────────────────── */
let _engine: DailyVideoEngine | null = null;

export function getDailyEngine(): DailyVideoEngine {
  if (!_engine) _engine = new DailyVideoEngine();
  return _engine;
}

/* ─────────────────────────────────────────────────────────────────────────
   NEXT.JS API ROUTE HANDLERS
   Drop these into apps/web/src/app/api/video/rooms/route.ts
   ───────────────────────────────────────────────────────────────────────── */

/**
 * POST /api/video/rooms
 * Body: { type, roomId?, expiryMinutes?, userId, userName, role }
 * Returns: { room, token }
 */
export async function handleCreateRoom(reqBody: {
  type: RoomType;
  roomId?: string;
  expiryMinutes?: number;
  userId: string;
  userName: string;
  role: TokenRole;
}) {
  const engine = getDailyEngine();

  const room = await engine.getOrCreateRoom({
    type: reqBody.type,
    roomId: reqBody.roomId,
    expiryMinutes: reqBody.expiryMinutes,
    enableRecording: true,
  });

  const token = await engine.createToken({
    roomName: room.name,
    userId: reqBody.userId,
    userName: reqBody.userName,
    role: reqBody.role,
    expiryMinutes: reqBody.expiryMinutes ?? 120,
  });

  return { room, token };
}

/**
 * GET /api/video/rooms?roomName=xxx
 * Returns: { room, presenceCount }
 */
export async function handleGetRoom(roomName: string) {
  const engine = getDailyEngine();
  const [room, presenceCount] = await Promise.all([
    engine.getRoom(roomName),
    engine.getPresence(roomName),
  ]);
  return { room, presenceCount };
}
