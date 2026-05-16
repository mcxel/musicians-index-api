export type HomeFeedKey = "home1" | "home2" | "home3" | "home4" | "home5";

export type Home1Feed = {
  phase: "rotate" | "starburst" | "enter";
  genre: string;
  featuredId: string | null;
  orbitAngle: number;
  orbitSpeed: number;
  timestamp: number;
};

export type Home2Feed = {
  phase: string;
  genre: string;
  layoutState: string;
  timestamp: number;
};

export type Home3Feed = {
  phase: string;
  activeShow: string;
  timestamp: number;
};

export type Home4Feed = {
  phase: string;
  marketplaceState: string;
  timestamp: number;
};

export type Home5Feed = {
  phase: string;
  leaderboardState: string;
  timestamp: number;
};

export type TmiAllFeeds = {
  home1: Home1Feed;
  home2: Home2Feed;
  home3: Home3Feed;
  home4: Home4Feed;
  home5: Home5Feed;
};

type FeedSocketEnvelope = {
  type: "feed:update";
  payload: Partial<TmiAllFeeds>;
};

function getFeedSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_TMI_FEED_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_TMI_FEED_SOCKET_URL;
  }
  if (typeof window === "undefined") return "ws://localhost:8080";
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname;
  return `${proto}://${host}:8080`;
}
const FEED_SOCKET_URL = typeof window !== "undefined" ? getFeedSocketUrl() : "ws://localhost:8080";
const FEED_SOCKET_SYNC_MS = 180;

let socketSyncTimer: number | null = null;
let reconnectTimer: number | null = null;

declare global {
  interface Window {
    __TMI_ALL_FEEDS__?: Partial<TmiAllFeeds>;
    __TMI_FEED_SOCKET__?: WebSocket;
  }
}

function createDefaultFeeds(): TmiAllFeeds {
  const now = Date.now();
  return {
    home1: {
      phase: "rotate",
      genre: "Unknown",
      featuredId: null,
      orbitAngle: 0,
      orbitSpeed: 0.0032,
      timestamp: now,
    },
    home2: {
      phase: "idle",
      genre: "Unknown",
      layoutState: "cover",
      timestamp: now,
    },
    home3: {
      phase: "idle",
      activeShow: "none",
      timestamp: now,
    },
    home4: {
      phase: "idle",
      marketplaceState: "standby",
      timestamp: now,
    },
    home5: {
      phase: "idle",
      leaderboardState: "standby",
      timestamp: now,
    },
  };
}

export function ensureAllFeeds(): Partial<TmiAllFeeds> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!window.__TMI_ALL_FEEDS__) {
    window.__TMI_ALL_FEEDS__ = createDefaultFeeds();
  }

  connectFeedSocket();

  return window.__TMI_ALL_FEEDS__;
}

function applyIncomingFeeds(incoming: Partial<TmiAllFeeds>): void {
  const base = ensureAllFeeds() ?? {};
  const merged = { ...base, ...incoming };
  window.__TMI_ALL_FEEDS__ = merged;
  window.dispatchEvent(new CustomEvent("tmi:all-feeds", { detail: merged }));
}

function sendFeedsSnapshot(feeds: Partial<TmiAllFeeds>): void {
  if (typeof window === "undefined") {
    return;
  }

  const socket = window.__TMI_FEED_SOCKET__;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const envelope: FeedSocketEnvelope = {
    type: "feed:update",
    payload: feeds,
  };
  socket.send(JSON.stringify(envelope));
}

function scheduleSocketSync(): void {
  if (typeof window === "undefined" || socketSyncTimer !== null) {
    return;
  }

  socketSyncTimer = window.setTimeout(() => {
    socketSyncTimer = null;
    sendFeedsSnapshot(window.__TMI_ALL_FEEDS__ ?? {});
  }, FEED_SOCKET_SYNC_MS);
}

function scheduleReconnect(): void {
  if (typeof window === "undefined" || reconnectTimer !== null) {
    return;
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectFeedSocket();
  }, 1500);
}

function connectFeedSocket(): void {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return;
  }

  const existing = window.__TMI_FEED_SOCKET__;
  if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const socket = new WebSocket(FEED_SOCKET_URL);
  window.__TMI_FEED_SOCKET__ = socket;

  socket.onopen = () => {
    sendFeedsSnapshot(window.__TMI_ALL_FEEDS__ ?? {});
  };

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(String(event.data)) as Partial<TmiAllFeeds> | FeedSocketEnvelope;
      const payload =
        typeof parsed === "object" && parsed !== null && "type" in parsed
          ? parsed.type === "feed:update"
            ? parsed.payload
            : null
          : parsed;

      if (payload && typeof payload === "object") {
        applyIncomingFeeds(payload);
      }
    } catch {
      // Ignore invalid payloads and keep local fallback active.
    }
  };

  socket.onerror = () => {
    socket.close();
  };

  socket.onclose = () => {
    if (window.__TMI_FEED_SOCKET__ === socket) {
      window.__TMI_FEED_SOCKET__ = undefined;
    }
    scheduleReconnect();
  };
}

export function publishHomeFeed<T extends HomeFeedKey>(home: T, payload: TmiAllFeeds[T]): void {
  if (typeof window === "undefined") {
    return;
  }

  const allFeeds = ensureAllFeeds();
  if (!allFeeds) {
    return;
  }

  allFeeds[home] = payload;
  window.__TMI_ALL_FEEDS__ = allFeeds;
  window.dispatchEvent(new CustomEvent("tmi:all-feeds", { detail: allFeeds }));
  scheduleSocketSync();
}
