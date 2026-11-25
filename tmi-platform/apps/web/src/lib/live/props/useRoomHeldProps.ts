"use client";

/**
 * Client side of room held props.
 * - Listens to the HUD's existing `tmi:prop:toggle` event (VenueHudPerimeterActionDock) and
 *   sends ACTIVATE/STOP to /api/live/prop-events — one tap, verified session server-side.
 * - Shows the actor's own lighter immediately (local prediction), rolled back if refused.
 * - Polls the shared ordered log so every viewer folds the same events into the same state.
 *   Latency for OTHER viewers is bounded by POLL_MS (honest polling, not push).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HeldPropRenderState } from "@/components/3d/HeldPropMount";
import { MAX_ACTION_DURATION_MS, roomActionPolicy, type MomentKind } from "./RoomActionCatalog";
import { foldActorActions, foldOpenMoments, foldStageEffects, tallyMoment, type RoomActionEvent } from "./RoomActionState";
import {
  HELD_PROP_POLICIES,
  foldActiveHeldProps,
  placeholderPropsEnabled,
  type RoomPropEvent,
} from "./RoomPropEventModel";

const POLL_MS = 1000;
const TICK_MS = 250;
/** Keep a just-ended prop mounted briefly so the arm lowers smoothly instead of popping. */
const LOWER_GRACE_MS = 1500;

export type RoomHeldPropsStatus = "idle" | "ok" | "migration-not-applied" | "unavailable";

function newEventId(): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `pe_${rnd.slice(0, 28)}`;
}

/** Key under which the viewer's own held prop is always available (seat ids may be guest ids). */
export const SELF_HELD_PROP_KEY = "__self__";

export function useRoomHeldProps(roomId: string | null | undefined) {
  const [events, setEvents] = useState<RoomPropEvent[]>([]);
  const [status, setStatus] = useState<RoomHeldPropsStatus>("idle");
  const [tick, setTick] = useState(0);
  const latestSeq = useRef(0);
  const clockOffset = useRef(0); // serverNow - localNow
  const pending = useRef(new Map<string, RoomPropEvent>()); // optimistic self events by eventId
  const lastEnded = useRef(new Map<string, HeldPropRenderState>());
  /** Verified actor id, learned from the server's own response (never assumed client-side). */
  const selfActorId = useRef<string | null>(null);

  const merge = useCallback((incoming: RoomPropEvent[]) => {
    if (!incoming.length) return;
    setEvents((prev) => {
      const byId = new Map(prev.map((e) => [e.eventId, e] as const));
      for (const e of incoming) {
        byId.set(e.eventId, e);
        pending.current.delete(e.eventId);
        latestSeq.current = Math.max(latestSeq.current, e.seq);
      }
      // Keep long-running moments/participation for their whole life (same window as the server).
      const horizon = Date.now() + clockOffset.current - (MAX_ACTION_DURATION_MS + 60_000);
      return [...byId.values()].filter((e) => e.startAtMs >= horizon).sort((a, b) => a.seq - b.seq);
    });
  }, []);

  // Poll the shared log.
  useEffect(() => {
    if (!roomId) return;
    let stopped = false;
    latestSeq.current = 0;
    setEvents([]);
    const poll = async () => {
      try {
        const sent = Date.now();
        const res = await fetch(
          `/api/live/prop-events?roomId=${encodeURIComponent(roomId)}&afterSeq=${latestSeq.current}`,
          { credentials: "include", cache: "no-store" },
        );
        if (res.status === 503) return setStatus("migration-not-applied");
        if (!res.ok) return setStatus("unavailable");
        const body = (await res.json()) as { events: RoomPropEvent[]; serverNowMs: number };
        clockOffset.current = body.serverNowMs - (sent + Date.now()) / 2;
        setStatus("ok");
        if (!stopped) merge(body.events);
      } catch {
        setStatus("unavailable");
      }
    };
    void poll();
    const t = setInterval(() => void poll(), POLL_MS);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [roomId, merge]);

  // Warm the prop models once per room so the first tap shows the model immediately
  // (measured: lazy first load attached the lighter ~6.9s after the tap on a busy page).
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    void import("@/components/3d/AvatarLobbyCanvas").then(({ loadFoundryGlbBundle }) => {
      if (cancelled) return;
      for (const p of Object.values(HELD_PROP_POLICIES)) {
        if (p.placeholder && !placeholderPropsEnabled()) continue;
        void loadFoundryGlbBundle(p.glbUrl).catch(() => undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Re-evaluate expiry without new events.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const send = useCallback(
    async (propId: string, action: "ACTIVATE" | "STOP", targetId?: string | null) => {
      if (!roomId) return;
      const policy = roomActionPolicy(propId);
      if (!policy) return; // not a synced room action — the HUD keeps its local behaviour
      const eventId = newEventId();
      const serverNow = Date.now() + clockOffset.current;
      // Local prediction (actor sees it instantly).
      pending.current.set(eventId, {
        roomId,
        seq: Number.MAX_SAFE_INTEGER - pending.current.size,
        eventId,
        actorId: selfActorId.current ?? SELF_HELD_PROP_KEY,
        propId,
        assetId: policy.assetId ?? "",
        action,
        startAtMs: serverNow,
        durationMs: action === "ACTIVATE" ? policy.durationMs : 0,
        seed: 0,
      });
      setTick((n) => n + 1);
      try {
        const res = await fetch("/api/live/prop-events", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, propId, action, eventId, targetId: targetId ?? null }),
        });
        const body = (await res.json().catch(() => ({}))) as { event?: RoomPropEvent; error?: string };
        if (res.ok && body.event) {
          selfActorId.current = body.event.actorId;
          merge([body.event]);
        } else {
          pending.current.delete(eventId); // rolled back
          window.dispatchEvent(
            new CustomEvent("tmi:prop:refused", { detail: { roomId, propId, action, code: body.error ?? `HTTP_${res.status}` } }),
          );
        }
      } catch {
        pending.current.delete(eventId);
        window.dispatchEvent(new CustomEvent("tmi:prop:refused", { detail: { roomId, propId, action, code: "NETWORK" } }));
      }
      setTick((n) => n + 1);
    },
    [roomId, merge],
  );

  // One-tap from the existing HUD props tray.
  useEffect(() => {
    if (!roomId) return;
    const onToggle = (e: Event) => {
      const d = (e as CustomEvent<{ roomId?: string; propId?: string; active?: boolean }>).detail;
      if (!d?.propId || (d.roomId && d.roomId !== roomId)) return;
      void send(d.propId, d.active === false ? "STOP" : "ACTIVATE");
    };
    // Generic room actions (emotes, crowd moments, participation, spotlight picks).
    const onAction = (e: Event) => {
      const d = (e as CustomEvent<{ roomId?: string; actionId?: string; active?: boolean; targetId?: string | null }>).detail;
      if (!d?.actionId || (d.roomId && d.roomId !== roomId)) return;
      void send(d.actionId, d.active === false ? "STOP" : "ACTIVATE", d.targetId ?? null);
    };
    window.addEventListener("tmi:prop:toggle", onToggle);
    window.addEventListener("tmi:room-action", onAction);
    return () => {
      window.removeEventListener("tmi:prop:toggle", onToggle);
      window.removeEventListener("tmi:room-action", onAction);
    };
  }, [roomId, send]);

  const heldByUserId = useMemo(() => {
    const serverNow = Date.now() + clockOffset.current;
    const active = foldActiveHeldProps([...events, ...pending.current.values()], serverNow);
    const out = new Map<string, HeldPropRenderState>();
    for (const [actorId, a] of active) {
      const s: HeldPropRenderState = {
        propId: a.propId,
        eventId: a.eventId,
        seed: a.seed,
        endsAtLocalMs: a.endsAtMs - clockOffset.current,
      };
      out.set(actorId, s);
      lastEnded.current.set(actorId, s);
    }
    // Brief grace so the arm lowers instead of the prop vanishing mid-pose.
    for (const [actorId, s] of lastEnded.current) {
      if (out.has(actorId)) continue;
      // Put away early (STOP): the real end is now, not the original window end.
      const ended = s.endsAtLocalMs > Date.now() ? { ...s, endsAtLocalMs: Date.now() } : s;
      if (ended !== s) lastEnded.current.set(actorId, ended);
      if (Date.now() - ended.endsAtLocalMs < LOWER_GRACE_MS) out.set(actorId, ended);
      else lastEnded.current.delete(actorId);
    }
    const self = selfActorId.current;
    if (self && out.has(self)) out.set(SELF_HELD_PROP_KEY, out.get(self)!);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, tick]);

  /** Everything else the renderer/HUD needs, folded from the same ordered log. */
  const roomState = useMemo(() => {
    const serverNow = Date.now() + clockOffset.current;
    const all = [...events, ...pending.current.values()] as RoomActionEvent[];
    const actions = foldActorActions(all, serverNow);
    const self = selfActorId.current;
    if (self && actions.has(self)) actions.set(SELF_HELD_PROP_KEY, actions.get(self)!);
    const moments = foldOpenMoments(all, serverNow);
    const tallies = new Map<MomentKind, ReturnType<typeof tallyMoment>>();
    for (const k of moments.keys()) tallies.set(k, tallyMoment(all, k, serverNow));
    return { actionsByUserId: actions, stageEffects: foldStageEffects(all, serverNow), openMoments: moments, tallies, clockOffsetMs: clockOffset.current };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, tick]);

  return { heldByUserId, status, send, ...roomState };
}
