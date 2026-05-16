/**
 * LiveIdentitySurfaceEngine
 * Manages the dual-state identity surface for every performer:
 *   State A — Static Identity Lock (always visible: profile image, badge, rank, streak, genre)
 *   State B — Live Motion Feed (active when camera / stream enabled)
 *
 * Supports: webcam, phone camera, OBS, RTMP, DSLR, USB camera
 */

export type FeedSource =
  | "webcam"
  | "phone"
  | "obs"
  | "rtmp"
  | "dslr"
  | "usb"
  | "streamyard"
  | "restream";

export type LiveStatus =
  | "LIVE"
  | "MUTED"
  | "DISCONNECTED"
  | "RECONNECTING"
  | "OFFLINE";

export type RoomContext =
  | "battle"
  | "cypher"
  | "dirty-dozens"
  | "contest"
  | "karaoke"
  | "interview"
  | "concert"
  | "sponsor"
  | "meet-and-greet"
  | "beat-battle";

export interface StaticIdentity {
  userId: string;
  displayName: string;
  profileImageUrl: string;
  motionPortraitUrl?: string;
  genre: string;
  rank?: number;
  tier: string;
  streak?: number;
  crownState: "none" | "holder" | "challenger" | "finalist";
  badge?: string;
}

export interface LiveFeedState {
  userId: string;
  source: FeedSource;
  status: LiveStatus;
  streamUrl?: string;      // RTMP / WebRTC endpoint
  lastFrameUrl?: string;   // Snapshot of last known live frame
  connectedAt?: number;
  droppedAt?: number;
  reconnectAttempts: number;
}

export interface IdentitySurfaceRecord {
  identity: StaticIdentity;
  feed: LiveFeedState | null;
  roomContext: RoomContext;
  billboardSlot: "left" | "center" | "right" | "queue" | "solo";
}

const FALLBACK_CHAIN: Array<keyof LiveFeedState | "profileImage"> = [
  "streamUrl",
  "lastFrameUrl",
  "profileImage",
];

class LiveIdentitySurfaceEngine {
  private surfaces = new Map<string, IdentitySurfaceRecord>();

  /** Register a performer identity on a surface */
  registerSurface(
    identity: StaticIdentity,
    roomContext: RoomContext,
    billboardSlot: IdentitySurfaceRecord["billboardSlot"] = "solo"
  ): IdentitySurfaceRecord {
    const record: IdentitySurfaceRecord = {
      identity,
      feed: null,
      roomContext,
      billboardSlot,
    };
    this.surfaces.set(identity.userId, record);
    return record;
  }

  /** Activate a live feed for this performer */
  activateFeed(
    userId: string,
    source: FeedSource,
    streamUrl?: string
  ): { ok: boolean; status: LiveStatus } {
    const record = this.surfaces.get(userId);
    if (!record) return { ok: false, status: "OFFLINE" };

    record.feed = {
      userId,
      source,
      status: "LIVE",
      streamUrl,
      connectedAt: Date.now(),
      reconnectAttempts: 0,
    };
    return { ok: true, status: "LIVE" };
  }

  /** Mark feed as muted */
  muteFeed(userId: string): void {
    const feed = this.surfaces.get(userId)?.feed;
    if (feed) feed.status = "MUTED";
  }

  /** Handle feed disconnection — triggers fallback chain */
  reportDisconnect(userId: string): LiveStatus {
    const record = this.surfaces.get(userId);
    if (!record?.feed) return "OFFLINE";
    record.feed.status = "DISCONNECTED";
    record.feed.droppedAt = Date.now();
    return "DISCONNECTED";
  }

  /** Mark as reconnecting */
  startReconnect(userId: string): void {
    const feed = this.surfaces.get(userId)?.feed;
    if (feed) {
      feed.status = "RECONNECTING";
      feed.reconnectAttempts += 1;
    }
  }

  /** Resolve what to display — respects the fallback chain */
  resolveDisplayUrl(userId: string): {
    type: "live" | "last-frame" | "motion-portrait" | "profile-image" | "empty";
    url: string;
    status: LiveStatus;
  } {
    const record = this.surfaces.get(userId);
    if (!record) return { type: "empty", url: "", status: "OFFLINE" };

    const { feed, identity } = record;
    const status: LiveStatus = feed?.status ?? "OFFLINE";

    if (feed?.status === "LIVE" && feed.streamUrl) {
      return { type: "live", url: feed.streamUrl, status: "LIVE" };
    }
    if (feed?.lastFrameUrl) {
      return { type: "last-frame", url: feed.lastFrameUrl, status };
    }
    if (identity.motionPortraitUrl) {
      return { type: "motion-portrait", url: identity.motionPortraitUrl, status };
    }
    return { type: "profile-image", url: identity.profileImageUrl, status };
  }

  /** Get billboard layout for a battle room (left / center / right) */
  getBattleBillboardLayout(battleId: string): {
    left: IdentitySurfaceRecord | null;
    center: IdentitySurfaceRecord | null;
    right: IdentitySurfaceRecord | null;
    queue: IdentitySurfaceRecord[];
  } {
    const all = [...this.surfaces.values()].filter(
      (r) => r.roomContext === "battle"
    );
    return {
      left:   all.find((r) => r.billboardSlot === "left")   ?? null,
      center: all.find((r) => r.billboardSlot === "center") ?? null,
      right:  all.find((r) => r.billboardSlot === "right")  ?? null,
      queue:  all.filter((r) => r.billboardSlot === "queue"),
    };
  }

  getSurface(userId: string): IdentitySurfaceRecord | undefined {
    return this.surfaces.get(userId);
  }

  getAllSurfaces(): IdentitySurfaceRecord[] {
    return [...this.surfaces.values()];
  }

  removeSurface(userId: string): void {
    this.surfaces.delete(userId);
  }
}

export const liveIdentitySurfaceEngine = new LiveIdentitySurfaceEngine();
