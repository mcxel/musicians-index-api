import { buildEventWindow } from "@/lib/live/EventWindowEngine";
import { buildGenreRotationPlan } from "@/lib/live/GenreRotationEngine";
import { LIVE_EVENT_REGISTRY, type LiveEventWindow } from "@/lib/live/LiveEventRegistry";
import { buildNextRoomQueue, resolveRoomRestartLabel, type RoomQueueEntry } from "@/lib/live/RoomResetEngine";
import { getGenreHistory } from "@/lib/live/EventHistoryEngine";

export type LiveCycleSnapshot = {
  generatedAt: Date;
  windows: Record<string, LiveEventWindow>;
  roomQueue: RoomQueueEntry[];
  genre: {
    current: string;
    next: string;
    after: string;
  };
  restartLabel: string;
  hypeStats: Array<{ label: string; value: string }>;
};

function toWindowMap(list: LiveEventWindow[]): Record<string, LiveEventWindow> {
  const out: Record<string, LiveEventWindow> = {};
  for (const item of list) out[item.id] = item;
  return out;
}

export function buildLiveCycleSnapshot(now: Date = new Date()): LiveCycleSnapshot {
  const genreHistory = getGenreHistory();

  const windows = LIVE_EVENT_REGISTRY.map((template) =>
    buildEventWindow({
      now,
      template,
      genreHistory,
      activityByGenre: {
        "Hip-Hop": 1.25,
        "R&B": 1.15,
        Rock: 1.05,
        Country: 0.85,
        Pop: 1.1,
        Metal: 0.9,
        Jazz: 0.8,
        Soul: 0.95,
        Electronic: 1.2,
      },
    }),
  );

  const mainCypher = windows.find((w) => w.id === "main-cypher") ?? windows[0];
  const rotation = buildGenreRotationPlan({
    genrePool: mainCypher?.genrePool ?? ["Hip-Hop", "R&B", "Rock"],
    history: genreHistory,
    currentGenre: mainCypher?.activeGenre,
    activity: {
      "Hip-Hop": 1.25,
      "R&B": 1.15,
      Rock: 1.05,
      Country: 0.85,
      Pop: 1.1,
      Metal: 0.9,
      Jazz: 0.8,
      Soul: 0.95,
      Electronic: 1.2,
    },
  });

  const roomQueue = buildNextRoomQueue({ now, baseTitle: "Main Cypher" });
  const restartAt = new Date(now.getTime() + 12 * 60 * 1000 + 11 * 1000);

  return {
    generatedAt: now,
    windows: toWindowMap(windows),
    roomQueue,
    genre: {
      current: rotation.currentGenre,
      next: rotation.nextGenre,
      after: rotation.afterGenre,
    },
    restartLabel: resolveRoomRestartLabel(now, restartAt),
    hypeStats: [
      { label: "Rooms Live", value: "28" },
      { label: "Votes / Min", value: "1.8k" },
      { label: "Crowd Noise", value: "92%" },
      { label: "Queue Fill", value: `${Math.min(99, 72 + roomQueue.length * 4)}%` },
    ],
  };
}
