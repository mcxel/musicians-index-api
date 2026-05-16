import type { ChatRole, RoomChatMessage, RoomRuntimeState } from "./RoomChatEngine";

export type BubbleAnchor = "avatar" | "host-zone" | "judge-table" | "reaction-rail" | "sponsor-wall" | "overflow-widget";

export type BubblePlacement = {
  messageId: string;
  anchor: BubbleAnchor;
  x: number;
  y: number;
  zIndex: number;
  ttlMs: number;
  opacity: number;
  priority: number;
};

export type PlacementInput = {
  message: RoomChatMessage;
  state: RoomRuntimeState;
  density: number;
  seed: number;
};

const ROLE_ANCHOR: Record<ChatRole, BubbleAnchor> = {
  performer: "avatar",
  host: "host-zone",
  judge: "judge-table",
  audience: "reaction-rail",
  sponsor: "sponsor-wall",
  system: "reaction-rail",
  moderator: "overflow-widget",
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function stableHash(text: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return hash;
}

export function placeChatBubble(input: PlacementInput): BubblePlacement {
  const { message, state, density, seed } = input;
  const hash = stableHash(message.id, seed);
  const jitterX = ((hash % 19) - 9) / 100;
  const jitterY = ((Math.floor(hash / 19) % 17) - 8) / 130;

  const anchor = ROLE_ANCHOR[message.role] ?? "reaction-rail";

  // Base positions keep center stage clear (x ~ 0.35-0.65, y ~ 0.08-0.56 reserved).
  let x = 0.1;
  let y = 0.75;

  if (anchor === "avatar") {
    x = 0.22;
    y = 0.6;
  } else if (anchor === "host-zone") {
    x = 0.12;
    y = 0.43;
  } else if (anchor === "judge-table") {
    x = 0.82;
    y = 0.42;
  } else if (anchor === "sponsor-wall") {
    x = 0.9;
    y = 0.7;
  } else if (anchor === "reaction-rail") {
    x = 0.5;
    y = 0.9;
  } else {
    x = 0.94;
    y = 0.22;
  }

  const stateBoost = state === "LIVE_SHOW" ? 1.15 : state === "PRE_SHOW" ? 1.05 : 1;
  const ttlMs = Math.floor((4200 - Math.min(2400, density * 45)) / stateBoost);

  return {
    messageId: message.id,
    anchor,
    x: clamp01(x + jitterX),
    y: clamp01(y + jitterY),
    zIndex: anchor === "avatar" || anchor === "host-zone" ? 14 : 12,
    ttlMs: Math.max(1400, ttlMs),
    opacity: clamp01(0.95 - density / 240),
    priority: anchor === "avatar" ? 4 : anchor === "host-zone" ? 3 : anchor === "judge-table" ? 3 : 2,
  };
}

export function filterPlacementsToAvoidStageObstruction(placements: BubblePlacement[]): BubblePlacement[] {
  return placements.filter((p) => {
    // Keep center stage area clear
    const obstructsStage = p.x >= 0.34 && p.x <= 0.66 && p.y >= 0.08 && p.y <= 0.56;
    return !obstructsStage;
  });
}
