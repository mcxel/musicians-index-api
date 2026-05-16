import type { MagazineSceneId } from "@/engines/magazine/MagazineRuntimeEngine";
import {
  getRevenuePulse,
  initRevenuePulse,
  recordRevenue,
  type RevenueStream,
} from "@/lib/performer/RevenuePulseEngine";

export const MAGAZINE_BRIDGE_ROOM_ID = "performer-hub-live";
export const MAGAZINE_BRIDGE_PERFORMER_ID = "nova-cipher";

export interface MagazineBridgeSnapshot {
  activeSceneId: MagazineSceneId;
  previousSceneId: MagazineSceneId | null;
  transitionCount: number;
  occupancySignal: number;
  revenueDeltaCents: number;
  sessionRevenueCents: number;
  enteredAtMs: number;
}

type SceneSignal = {
  occupancy: number;
  stream: RevenueStream;
  amountCents: number;
  note: string;
};

const SCENE_SIGNALS: Record<MagazineSceneId, SceneSignal> = {
  "home-1": {
    occupancy: 210,
    stream: "sponsor",
    amountCents: 650,
    note: "Cover spotlight sponsor inventory",
  },
  "home-1-2": {
    occupancy: 255,
    stream: "merch",
    amountCents: 320,
    note: "Spread ad strip conversion",
  },
  "home-2": {
    occupancy: 290,
    stream: "ticket",
    amountCents: 900,
    note: "Dashboard ticket upsell",
  },
  "home-3": {
    occupancy: 340,
    stream: "tip",
    amountCents: 480,
    note: "Live world micro-tip activity",
  },
  "home-4": {
    occupancy: 300,
    stream: "subscription",
    amountCents: 760,
    note: "Social hub follow-to-sub funnel",
  },
  "home-5": {
    occupancy: 370,
    stream: "battle_prize",
    amountCents: 1200,
    note: "Arena challenge prize pool lift",
  },
};

const listeners = new Set<(snapshot: MagazineBridgeSnapshot) => void>();
const SNAPSHOT_KEY = "tmi_mag_performer_bridge_v1";

const DEFAULT_SNAPSHOT: MagazineBridgeSnapshot = {
  activeSceneId: "home-1",
  previousSceneId: null,
  transitionCount: 0,
  occupancySignal: SCENE_SIGNALS["home-1"].occupancy,
  revenueDeltaCents: 0,
  sessionRevenueCents: 0,
  enteredAtMs: Date.now(),
};

function readPersistedSnapshot(): MagazineBridgeSnapshot {
  if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
  const raw = window.localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return DEFAULT_SNAPSHOT;
  try {
    const parsed = JSON.parse(raw) as MagazineBridgeSnapshot;
    if (!parsed || typeof parsed !== "object") return DEFAULT_SNAPSHOT;
    return {
      activeSceneId: parsed.activeSceneId,
      previousSceneId: parsed.previousSceneId,
      transitionCount: parsed.transitionCount,
      occupancySignal: parsed.occupancySignal,
      revenueDeltaCents: parsed.revenueDeltaCents,
      sessionRevenueCents: parsed.sessionRevenueCents,
      enteredAtMs: parsed.enteredAtMs,
    };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

let snapshot: MagazineBridgeSnapshot = readPersistedSnapshot();

function ensureRevenuePulse() {
  if (!getRevenuePulse(MAGAZINE_BRIDGE_ROOM_ID)) {
    initRevenuePulse(MAGAZINE_BRIDGE_ROOM_ID, MAGAZINE_BRIDGE_PERFORMER_ID);
  }
}

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  }
  for (const listener of listeners) listener(snapshot);
}

export function getMagazineBridgeSnapshot(): MagazineBridgeSnapshot {
  return snapshot;
}

export function subscribeToMagazineBridge(
  listener: (snapshot: MagazineBridgeSnapshot) => void,
): () => void {
  listeners.add(listener);
  listener(snapshot);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== SNAPSHOT_KEY || !event.newValue) return;
    try {
      snapshot = JSON.parse(event.newValue) as MagazineBridgeSnapshot;
      listener(snapshot);
    } catch {
      // ignore malformed cross-tab payloads
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function ingestMagazineSceneEnter(sceneId: MagazineSceneId): MagazineBridgeSnapshot {
  ensureRevenuePulse();

  const signal = SCENE_SIGNALS[sceneId];
  const previous = snapshot.activeSceneId;
  const isTransition = previous !== sceneId;

  if (isTransition) {
    recordRevenue(MAGAZINE_BRIDGE_ROOM_ID, {
      stream: signal.stream,
      amountCents: signal.amountCents,
      fromUserId: "magazine-runtime",
      fromDisplayName: "Magazine Runtime",
      note: signal.note,
    });
  }

  const pulse = getRevenuePulse(MAGAZINE_BRIDGE_ROOM_ID);
  const nextSessionRevenueCents = isTransition
    ? snapshot.sessionRevenueCents + signal.amountCents
    : snapshot.sessionRevenueCents;

  snapshot = {
    activeSceneId: sceneId,
    previousSceneId: isTransition ? previous : snapshot.previousSceneId,
    transitionCount: isTransition ? snapshot.transitionCount + 1 : snapshot.transitionCount,
    occupancySignal: signal.occupancy,
    revenueDeltaCents: isTransition ? signal.amountCents : 0,
    sessionRevenueCents: Math.max(nextSessionRevenueCents, pulse?.sessionTotalCents ?? 0),
    enteredAtMs: Date.now(),
  };

  emit();
  return snapshot;
}
