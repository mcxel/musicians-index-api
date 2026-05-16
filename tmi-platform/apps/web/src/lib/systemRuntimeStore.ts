"use client";

export type RuntimeHealth = "LIVE" | "IDLE" | "ERROR";

export type RuntimeNode = {
  id: string;
  label: string;
  kind: "lobby" | "show" | "battle" | "article" | "leaderboard" | "billboard";
  route: string;
  status: RuntimeHealth;
  users: number;
  event: string;
  preview: string;
  updatedAt: number;
};

export type RuntimeEvent = {
  id: string;
  kind: string;
  message: string;
  createdAt: number;
};

export type RuntimeState = {
  rooms: RuntimeNode[];
  shows: RuntimeNode[];
  lobbies: RuntimeNode[];
  users: number;
  events: RuntimeEvent[];
  botStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
  globalState: "LIVE" | "DEGRADED" | "OFFLINE";
};

const BASE_NODES: RuntimeNode[] = [
  {
    id: "cypher-12",
    label: "Cypher Arena #12",
    kind: "battle",
    route: "/games/battle",
    status: "LIVE",
    users: 38,
    event: "Round 2 active",
    preview: "Arena camera: battle floor",
    updatedAt: Date.now(),
  },
  {
    id: "dirty-dozens",
    label: "Dirty Dozens Show",
    kind: "show",
    route: "/shows/monthly-idol",
    status: "LIVE",
    users: 22,
    event: "2 contestants live",
    preview: "Stage camera: host + contestants",
    updatedAt: Date.now(),
  },
  {
    id: "home-1-rotation",
    label: "Homepage 1 Rotation",
    kind: "billboard",
    route: "/home/1",
    status: "LIVE",
    users: 128,
    event: "Hip-Hop artist spotlight",
    preview: "Cover page orbit preview",
    updatedAt: Date.now(),
  },
  {
    id: "daily-lobby",
    label: "Daily Lobby",
    kind: "lobby",
    route: "/lobbies",
    status: "IDLE",
    users: 14,
    event: "Warmup queue",
    preview: "Lobby room preview",
    updatedAt: Date.now(),
  },
  {
    id: "headline-article",
    label: "Headline Article",
    kind: "article",
    route: "/articles",
    status: "LIVE",
    users: 9,
    event: "Feature read spike",
    preview: "Article module preview",
    updatedAt: Date.now(),
  },
  {
    id: "leaderboard-core",
    label: "Leaderboard Core",
    kind: "leaderboard",
    route: "/admin/leaderboards",
    status: "LIVE",
    users: 31,
    event: "Weekly rank recalc",
    preview: "Top 10 rank panel preview",
    updatedAt: Date.now(),
  },
];

let state: RuntimeState = {
  rooms: BASE_NODES,
  shows: BASE_NODES.filter((n) => n.kind === "show"),
  lobbies: BASE_NODES.filter((n) => n.kind === "lobby"),
  users: BASE_NODES.reduce((sum, n) => sum + n.users, 0),
  events: [
    { id: "evt-1", kind: "system", message: "Runtime store booted", createdAt: Date.now() },
  ],
  botStatus: "ONLINE",
  globalState: "LIVE",
};

const listeners = new Set<() => void>();
let started = false;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function statusRoll(): RuntimeHealth {
  const r = Math.random();
  if (r < 0.74) return "LIVE";
  if (r < 0.92) return "IDLE";
  return "ERROR";
}

function eventFor(kind: RuntimeNode["kind"]): string {
  if (kind === "battle") return "Round tick advanced";
  if (kind === "show") return "Host transition active";
  if (kind === "billboard") return "Creative rotation tick";
  if (kind === "lobby") return "Matchmaking queue sync";
  if (kind === "article") return "Editorial pulse update";
  return "Ranking window recomputed";
}

function tickRuntime() {
  const now = Date.now();
  const rooms = state.rooms.map((node) => {
    const nextUsers = Math.max(0, node.users + Math.floor(Math.random() * 9) - 4);
    return {
      ...node,
      users: nextUsers,
      status: statusRoll(),
      event: eventFor(node.kind),
      updatedAt: now,
    };
  });

  const errorCount = rooms.filter((r) => r.status === "ERROR").length;
  const idleCount = rooms.filter((r) => r.status === "IDLE").length;

  state = {
    ...state,
    rooms,
    shows: rooms.filter((r) => r.kind === "show"),
    lobbies: rooms.filter((r) => r.kind === "lobby"),
    users: rooms.reduce((sum, r) => sum + r.users, 0),
    botStatus: errorCount > 1 ? "DEGRADED" : "ONLINE",
    globalState: errorCount > 1 ? "DEGRADED" : idleCount > 2 ? "DEGRADED" : "LIVE",
    events: [
      {
        id: `evt-${now}`,
        kind: "tick",
        message: `Runtime tick ${new Date(now).toLocaleTimeString()}`,
        createdAt: now,
      },
      ...state.events,
    ].slice(0, 12),
  };

  emit();
}

export function startRuntimeStore() {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;
  window.setInterval(tickRuntime, 3000);
}

export function getRuntimeState(): RuntimeState {
  return state;
}

export function subscribeRuntime(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
