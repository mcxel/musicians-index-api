export type LobbyLiveFeedEvent =
  | { type: "heat"; slug: string; value: number; ts: number }
  | { type: "occupancy"; slug: string; value: number; ts: number }
  | { type: "reactionBurst"; slug: string; value: number; ts: number }
  | { type: "tipBurst"; slug: string; value: number; ts: number };

type LobbyLiveFeedListener = (event: LobbyLiveFeedEvent) => void;

const listeners = new Set<LobbyLiveFeedListener>();

function emit(event: LobbyLiveFeedEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeLobbyLiveBillboard(listener: LobbyLiveFeedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitLobbyHeat(slug: string, value: number) {
  emit({ type: "heat", slug, value, ts: Date.now() });
}

export function emitLobbyOccupancy(slug: string, value: number) {
  emit({ type: "occupancy", slug, value, ts: Date.now() });
}

export function emitLobbyReactionBurst(slug: string, value: number) {
  emit({ type: "reactionBurst", slug, value, ts: Date.now() });
}

export function emitLobbyTipBurst(slug: string, value: number) {
  emit({ type: "tipBurst", slug, value, ts: Date.now() });
}
