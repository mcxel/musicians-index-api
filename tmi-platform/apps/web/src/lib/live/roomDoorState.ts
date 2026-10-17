export type CanonicalRoomDoorState = "CLOSED" | "OPEN" | "LIVE";

export interface CanonicalRoomDoorEvidence {
  persistedRoomStatus?: string | null;
  persistedRoomSessionActive?: boolean;
  activeLiveSessionStage?: string | null;
  runtimeRoomStatus?: string | null;
  permanentAnchor?: boolean;
}

/** Resolve existing room/session evidence into the single Lobby/page door state. */
export function resolveCanonicalRoomDoorState(
  evidence: CanonicalRoomDoorEvidence,
): CanonicalRoomDoorState {
  const persisted = String(evidence.persistedRoomStatus ?? "").trim().toUpperCase();
  const runtime = String(evidence.runtimeRoomStatus ?? "").trim().toLowerCase();

  const liveStage = String(evidence.activeLiveSessionStage ?? "").trim().toLowerCase().replace(/_/g, "-");
  if (liveStage === "live" || liveStage === "intermission") return "LIVE";
  if (liveStage === "pre-show") return "OPEN";

  if (evidence.persistedRoomSessionActive) return "LIVE";
  if (["CLOSED", "POSTSHOW", "ARCHIVED", "ENDED"].includes(persisted)) return "CLOSED";

  if (persisted === "LIVE") return "CLOSED";

  if (persisted === "OPEN" || persisted === "PRESHOW" || persisted === "PRE-SHOW") return "OPEN";
  if (["closed", "archived"].includes(runtime)) return "CLOSED";
  if (["open", "scheduled", "paused"].includes(runtime)) return "OPEN";
  if (runtime === "live") return "OPEN";

  if (evidence.permanentAnchor) return "OPEN";
  return "CLOSED";
}