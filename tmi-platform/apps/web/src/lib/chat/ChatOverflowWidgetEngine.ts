import type { RoomChatMessage, RoomRuntimeState } from "./RoomChatEngine";

export type OverflowWindow = {
  enabled: boolean;
  reason: "density" | "state" | "manual" | "off";
  messages: RoomChatMessage[];
  groupedByRole: Record<string, RoomChatMessage[]>;
  unreadCount: number;
};

export type OverflowConfig = {
  densityThreshold: number;
  maxFeedMessages: number;
};

const DEFAULT_OVERFLOW: OverflowConfig = {
  densityThreshold: 18,
  maxFeedMessages: 40,
};

export function shouldEnableOverflow(state: RoomRuntimeState, density: number): boolean {
  if (state === "LIVE_SHOW") {
    return density >= 12;
  }
  return density >= 18;
}

export function buildOverflowWindow(
  messages: RoomChatMessage[],
  density: number,
  state: RoomRuntimeState,
  unreadCount: number,
  config?: Partial<OverflowConfig>,
): OverflowWindow {
  const rules = { ...DEFAULT_OVERFLOW, ...(config ?? {}) };
  const enabled = shouldEnableOverflow(state, density) || density >= rules.densityThreshold;
  const tail = messages.slice(Math.max(0, messages.length - rules.maxFeedMessages));

  const groupedByRole = tail.reduce<Record<string, RoomChatMessage[]>>((acc, msg) => {
    const key = msg.role;
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return {
    enabled,
    reason: enabled ? (density >= rules.densityThreshold ? "density" : "state") : "off",
    messages: tail,
    groupedByRole,
    unreadCount,
  };
}
