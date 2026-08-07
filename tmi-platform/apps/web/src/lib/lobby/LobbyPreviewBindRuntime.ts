/**
 * LobbyPreviewBindRuntime — one receive-only Daily preview into the SAME room.
 *
 * Contract (Continuous Live Lobby Wall):
 * - At most ONE Daily call object for wall previews (Daily singleton + no N-client storm)
 * - Receive-only: camera/mic off; audio gated by LobbyPreviewRuntime focus
 * - Unsubscribed / invisible tiles never hold a bind
 * - Missing Daily session → honest composed / ready feed (never fake LIVE face)
 */

import type { DailyCall } from "@daily-co/daily-js";

export type LobbyPreviewBindState = {
  roomId: string | null;
  mediaStream: MediaStream | null;
  status: "idle" | "connecting" | "live" | "unavailable";
  reason: string | null;
};

type Listener = (state: LobbyPreviewBindState) => void;

let call: DailyCall | null = null;
let bindGeneration = 0;
let state: LobbyPreviewBindState = {
  roomId: null,
  mediaStream: null,
  status: "idle",
  reason: null,
};
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l(state);
}

function setState(next: Partial<LobbyPreviewBindState>): void {
  state = { ...state, ...next };
  emit();
}

function pickRemoteStream(c: DailyCall): MediaStream | null {
  const participants = c.participants();
  const tracks: MediaStreamTrack[] = [];
  for (const p of Object.values(participants)) {
    if (!p || p.local) continue;
    const v =
      p.tracks?.video?.persistentTrack ??
      p.tracks?.video?.track ??
      null;
    if (v && v.readyState === "live") tracks.push(v);
  }
  if (tracks.length === 0) return null;
  return new MediaStream(tracks.slice(0, 1));
}

async function destroyCall(): Promise<void> {
  const c = call;
  call = null;
  if (!c) return;
  try {
    await c.leave();
  } catch {
    /* ignore */
  }
  try {
    c.destroy();
  } catch {
    /* ignore */
  }
}

/**
 * Bind wall preview to roomId (receive-only). Pass null to release.
 * Only the focused / priority tile should call this with a roomId.
 */
export async function bindLobbyPreviewRoom(roomId: string | null): Promise<void> {
  const gen = ++bindGeneration;

  if (!roomId) {
    await destroyCall();
    if (gen !== bindGeneration) return;
    setState({ roomId: null, mediaStream: null, status: "idle", reason: null });
    return;
  }

  if (state.roomId === roomId && (state.status === "live" || state.status === "connecting") && call) {
    return;
  }

  await destroyCall();
  if (gen !== bindGeneration) return;

  setState({ roomId, mediaStream: null, status: "connecting", reason: null });

  try {
    const res = await fetch("/api/live/lobby-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        roomId,
        userId: `wall-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36)}`,
      }),
    });
    const data = (await res.json()) as {
      available?: boolean;
      roomUrl?: string;
      token?: string;
      reason?: string;
    };

    if (gen !== bindGeneration) return;

    if (!res.ok || !data.available || !data.roomUrl || !data.token) {
      setState({
        roomId,
        mediaStream: null,
        status: "unavailable",
        reason: data.reason ?? "No live preview session",
      });
      return;
    }

    const DailyIframe = (await import("@daily-co/daily-js")).default;
    const existing = DailyIframe.getCallInstance?.();
    if (existing && existing !== call) {
      try {
        await existing.leave();
      } catch {
        /* ignore */
      }
      try {
        existing.destroy();
      } catch {
        /* ignore */
      }
    }

    if (gen !== bindGeneration) return;

    const next = DailyIframe.createCallObject({
      videoSource: false,
      audioSource: false,
      subscribeToTracksAutomatically: true,
    });
    call = next;

    const refresh = () => {
      if (gen !== bindGeneration || call !== next) return;
      const stream = pickRemoteStream(next);
      setState({
        roomId,
        mediaStream: stream,
        status: stream ? "live" : "connecting",
        reason: stream ? null : "Waiting for room publisher track",
      });
    };

    next.on("participant-joined", refresh);
    next.on("participant-updated", refresh);
    next.on("participant-left", refresh);
    next.on("track-started", refresh);
    next.on("track-stopped", refresh);
    next.on("left-meeting", () => {
      if (gen !== bindGeneration) return;
      setState({ roomId, mediaStream: null, status: "unavailable", reason: "Left preview session" });
    });

    await next.join({
      url: data.roomUrl,
      token: data.token,
      startVideoOff: true,
      startAudioOff: true,
    });

    if (gen !== bindGeneration) {
      await next.leave().catch(() => {});
      next.destroy();
      return;
    }

    refresh();
  } catch (err) {
    if (gen !== bindGeneration) return;
    await destroyCall();
    setState({
      roomId,
      mediaStream: null,
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Preview bind failed",
    });
  }
}

export function getLobbyPreviewBindState(): LobbyPreviewBindState {
  return state;
}

export function subscribeLobbyPreviewBind(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}
