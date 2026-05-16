export type TmiNeutralMonitorMode = "neutral" | "active-performer" | "active-audience" | "watching-only";

export type TmiNeutralMonitorState = {
  mode: TmiNeutralMonitorMode;
  reason: string;
  updatedAt: number;
};

export function createNeutralMonitorState(reason = "Awaiting active feed"): TmiNeutralMonitorState {
  return {
    mode: "neutral",
    reason,
    updatedAt: Date.now(),
  };
}

export function activatePerformerMonitor(reason = "Performer is live"): TmiNeutralMonitorState {
  return {
    mode: "active-performer",
    reason,
    updatedAt: Date.now(),
  };
}

export function activateAudienceMonitor(reason = "Audience monitor active"): TmiNeutralMonitorState {
  return {
    mode: "active-audience",
    reason,
    updatedAt: Date.now(),
  };
}
