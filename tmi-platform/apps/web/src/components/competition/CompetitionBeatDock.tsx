"use client";

/**
 * CompetitionBeatDock — glass edge capsule for battle / gauntlet / cypher.
 * Attach Beat Locker or registry beat · style modes · mutual veto/swap · refuse penalty.
 * Challenges do NOT use this — they use ChallengeContentPicker.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listBeats, type BeatLockerRecord } from "@/lib/beats/BeatLockerClient";
import {
  styleLabel,
  type CompetitionBeatLane,
  type CompetitionBeatRoomState,
} from "@/lib/competition/CompetitionBeatRoomEngine";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

type RegistryBeat = {
  beatId: string;
  title: string;
  genre?: string;
  bpm?: number;
  audioUrl?: string | null;
  producerName?: string | null;
  source: "competition-registry";
};

type Props = {
  roomId: string;
  lane: CompetitionBeatLane;
  performerId?: string | null;
  performerIds?: string[];
  dock?: "left" | "right";
  /** Host/performer controls; audience sees read-only status. */
  canControl?: boolean;
};

export default function CompetitionBeatDock({
  roomId,
  lane,
  performerId,
  performerIds = [],
  dock = "left",
  canControl = true,
}: Props) {
  const [state, setState] = useState<CompetitionBeatRoomState | null>(null);
  const [locker, setLocker] = useState<BeatLockerRecord[]>([]);
  const [registry, setRegistry] = useState<RegistryBeat[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [vetoLeft, setVetoLeft] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/competition-beat?lane=${lane}`,
        { cache: "no-store" },
      );
      if (!r.ok) return;
      const data = (await r.json()) as {
        ok?: boolean;
        state?: CompetitionBeatRoomState;
        registryBeats?: RegistryBeat[];
      };
      if (data.state) setState(data.state);
      if (data.registryBeats) setRegistry(data.registryBeats);
    } catch {
      /* keep */
    }
  }, [roomId, lane]);

  useEffect(() => {
    void fetch(`/api/rooms/${encodeURIComponent(roomId)}/competition-beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "init",
        lane,
        performerIds,
      }),
    }).then(() => refresh());

    void listBeats({ mine: true }).then((res) => {
      if (res.ok) setLocker(res.beats);
    });

    const id = setInterval(() => void refresh(), 3_000);
    return () => clearInterval(id);
  }, [roomId, lane, performerIds.join("|"), refresh]);

  useEffect(() => {
    if (!state?.veto.open) {
      setVetoLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, state.veto.windowMs - (Date.now() - state.veto.openedAt));
      setVetoLeft(left);
      if (left <= 0) void refresh();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [state?.veto.open, state?.veto.openedAt, state?.veto.windowMs, refresh]);

  async function post(body: Record<string, unknown>) {
    setMsg(null);
    try {
      const r = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/competition-beat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, lane }),
      });
      const data = (await r.json()) as {
        ok?: boolean;
        error?: string;
        bothAgreed?: boolean;
        swapped?: boolean;
        state?: CompetitionBeatRoomState;
        penalty?: { points: number };
      };
      if (data.state) setState(data.state);
      if (!data.ok) setMsg(data.error ?? "Failed");
      else if (data.swapped) setMsg("Beat cleared — both agreed to swap. Attach a new beat.");
      else if (data.bothAgreed === false) setMsg("Swap requested — waiting for other performer");
      else if (data.penalty) setMsg(`Refuse penalty −${data.penalty.points} pts recorded`);
      else void refresh();
    } catch {
      setMsg("Unable to reach beat session");
    }
  }

  const edge = dock === "right" ? { right: 0 } : { left: 0 };
  const slide = dock === "right" ? 70 : -70;

  const nowBeat =
    state?.style === "attached"
      ? state.attached
        ? state.attached.title
        : "No beat attached"
      : styleLabel(state?.style ?? "acapella");

  return (
    <div
      data-competition-beat-dock
      data-lane={lane}
      style={{
        position: "fixed",
        top: "18%",
        bottom: "14%",
        zIndex: 45,
        pointerEvents: "none",
        ...edge,
      }}
    >
      <AnimatePresence mode="wait">
        {collapsed ? (
          <motion.button
            key="tab"
            type="button"
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slide }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setCollapsed(false)}
            style={{
              ...edgeTab,
              pointerEvents: "auto",
              [dock === "right" ? "borderTopLeftRadius" : "borderTopRightRadius"]: 12,
              [dock === "right" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 12,
            }}
          >
            <span style={{ writingMode: "vertical-rl", transform: dock === "right" ? "rotate(180deg)" : undefined }}>
              BEAT · {lane.toUpperCase()}
            </span>
          </motion.button>
        ) : (
          <motion.aside
            key="dock"
            initial={{ opacity: 0, x: slide, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: slide, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            style={{
              ...capsule,
              pointerEvents: "auto",
              [dock === "right" ? "marginRight" : "marginLeft"]: 10,
            }}
          >
            <div aria-hidden style={sheen} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, position: "relative" }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.18em",
                    background: `linear-gradient(90deg, ${GOLD}, ${CYAN}, ${FUCHSIA})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  COMPETITION BEAT · {lane.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 4, fontWeight: 700 }}>
                  {nowBeat}
                  {state?.attached?.audioUrl ? "" : state?.style === "attached" && state.attached ? " · no preview url" : ""}
                </div>
              </div>
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(true)} style={iconBtn}>
                COLLAPSE
              </motion.button>
            </div>

            {canControl && (
              <>
                <div style={{ fontSize: 8, fontWeight: 800, color: `${GOLD}bb`, letterSpacing: "0.1em", marginBottom: 6 }}>
                  STYLE MODE
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {(state?.allowedStyles ?? []).map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => void post({ action: "set-style", style: s })}
                      style={{
                        ...chip,
                        borderColor: state?.style === s ? CYAN : "rgba(255,255,255,0.14)",
                        color: state?.style === s ? CYAN : "rgba(255,255,255,0.7)",
                        background: state?.style === s ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
                      }}
                    >
                      {s.replace("_", " ")}
                    </motion.button>
                  ))}
                </div>

                {state?.style === "attached" && (
                  <>
                    <div style={{ fontSize: 8, fontWeight: 800, color: `${FUCHSIA}bb`, letterSpacing: "0.1em", marginBottom: 6 }}>
                      BEAT LOCKER {locker.length ? "" : "· empty"}
                    </div>
                    <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {locker.length === 0 ? (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                          No locker beats. Submit via Beat Locker, or pick registry.
                        </div>
                      ) : (
                        locker.slice(0, 12).map((b) => (
                          <motion.button
                            key={b.id}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              void post({
                                action: "attach",
                                beat: {
                                  beatId: b.id,
                                  title: b.title,
                                  genre: b.genre,
                                  bpm: b.bpm,
                                  audioUrl: b.previewUrl ?? null,
                                  producerName: b.producerName ?? null,
                                  source: "beat-locker",
                                },
                              })
                            }
                            style={listBtn}
                          >
                            {b.title}
                            <span style={{ opacity: 0.5, marginLeft: 6 }}>{b.bpm}bpm</span>
                          </motion.button>
                        ))
                      )}
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: `${CYAN}bb`, letterSpacing: "0.1em", marginBottom: 6 }}>
                      COMPETITION REGISTRY
                    </div>
                    <div style={{ maxHeight: 80, overflowY: "auto", marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {registry.slice(0, 8).map((b) => (
                        <motion.button
                          key={b.beatId}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            void post({
                              action: "attach",
                              beat: {
                                beatId: b.beatId,
                                title: b.title,
                                genre: b.genre,
                                bpm: b.bpm,
                                audioUrl: b.audioUrl ?? null,
                                producerName: b.producerName ?? null,
                                source: "competition-registry",
                              },
                            })
                          }
                          style={listBtn}
                        >
                          {b.title}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => void post({ action: "open-veto" })}
                    style={ghost(GOLD)}
                  >
                    OPEN VETO
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={!performerId || !state?.veto.open || vetoLeft <= 0}
                    whileTap={{ scale: 0.94 }}
                    onClick={() =>
                      void post({ action: "request-swap", performerId })
                    }
                    style={ghost(CYAN)}
                  >
                    REQUEST SWAP
                    {state?.veto.open && vetoLeft > 0
                      ? ` · ${Math.ceil(vetoLeft / 1000)}s`
                      : ""}
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={!performerId}
                    whileTap={{ scale: 0.94 }}
                    onClick={() =>
                      void post({ action: "refuse", performerId, reason: "refuse_perform" })
                    }
                    style={ghost(FUCHSIA)}
                  >
                    REFUSE (−pts)
                  </motion.button>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  Both must agree to swap · refuse/no-rap = honest −{25} pts · swaps{" "}
                  {state?.veto.swapCount ?? 0}/{state?.veto.maxSwaps ?? 2}
                </div>
              </>
            )}

            {(state?.penalties?.length ?? 0) > 0 && (
              <div style={{ marginTop: 8, fontSize: 9, color: FUCHSIA, fontWeight: 700 }}>
                Penalties:{" "}
                {state!.penalties.map((p) => `${p.performerId.slice(0, 6)} −${p.points}`).join(" · ")}
              </div>
            )}
            {msg && (
              <p style={{ margin: "8px 0 0", fontSize: 10, fontWeight: 700, color: CYAN }}>{msg}</p>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

const capsule: CSSProperties = {
  position: "relative",
  width: "min(300px, calc(100vw - 24px))",
  maxHeight: "100%",
  overflow: "auto",
  padding: 12,
  borderRadius: 16,
  border: "1px solid rgba(0,255,255,0.32)",
  background:
    "linear-gradient(155deg, rgba(12,8,28,0.55) 0%, rgba(5,5,16,0.42) 50%, rgba(40,10,48,0.5) 100%)",
  boxShadow:
    "0 14px 40px rgba(0,0,0,0.55), 0 0 28px rgba(255,45,170,0.12), inset 0 1px 0 rgba(255,255,255,0.14)",
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
};

const sheen: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "linear-gradient(125deg, rgba(255,255,255,0.1) 0%, transparent 42%)",
};

const edgeTab: CSSProperties = {
  border: `1px solid ${GOLD}66`,
  background: "linear-gradient(180deg, rgba(255,215,0,0.16), rgba(5,5,16,0.65))",
  color: GOLD,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.14em",
  padding: "14px 8px",
  cursor: "pointer",
  backdropFilter: "blur(16px)",
};

const iconBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.65)",
  fontSize: 8,
  fontWeight: 800,
  borderRadius: 8,
  padding: "4px 8px",
  cursor: "pointer",
};

const chip: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 9,
  fontWeight: 800,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const listBtn: CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

function ghost(color: string): CSSProperties {
  return {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };
}
