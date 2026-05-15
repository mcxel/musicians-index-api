"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import ShareButton from "@/components/rooms/ShareButton";
import { RecordRalphEngine, type RalphAnimState } from "@/lib/dj/RecordRalphEngine";
import { activatePhase1Bots } from "@/lib/bots/Phase1BotActivator";
import {
  createSeatingMesh,
  autoAssignSeat,
  getFanSeat,
  seatToAvatarPosition,
  type SeatingMeshState,
  type MeshSeat,
} from "@/lib/seats/SeatingMeshEngine";
import { useSeatSession } from "@/lib/seats/useSeatSession";
import {
  getOpenerLineAt,
  OPENER_DURATION_SECONDS,
} from "@/lib/dj/WorldDancePartyOpener";

const DANCE_FLOOR_COLORS = [
  "#FF2DAA", "#00FFFF", "#AA2DFF", "#FFD700", "#FF9500", "#00FF88",
];
const DJ_TRACKS = [
  { title: "Crown Up — Remix", artist: "DJ Sentinel", bpm: 142, genre: "Trap" },
  { title: "Neon Kingdom", artist: "LaserFlow", bpm: 128, genre: "EDM" },
  { title: "Midnight Cypher", artist: "Julius ft. Crew", bpm: 95, genre: "Hip-Hop" },
  { title: "World Dance Anthem", artist: "TMI House Band", bpm: 138, genre: "Dance" },
];

const RALPH_ANIM_LABEL: Record<RalphAnimState, string> = {
  "idle-groove":  "🎧 Idle Groove",
  "mixing":       "🎛 Mixing",
  "scratching":   "⚡ Scratching",
  "ignition":     "🔥 IGNITION",
  "drop-pose":    "💥 DROP",
  "crowd-scan":   "👀 Reading Room",
};
const RALPH_ANIM_COLOR: Record<RalphAnimState, string> = {
  "idle-groove":  "#888",
  "mixing":       "#00FFFF",
  "scratching":   "#FFD700",
  "ignition":     "#FF2DAA",
  "drop-pose":    "#FF9500",
  "crowd-scan":   "#AA2DFF",
};

const FAN_ID = "guest-fan";
const ROOM_ID = "world-dance-party";
const SEAT_ROWS = 4;
const SEAT_COLS = 8;

interface ChatLine { id: string; name: string; text: string; isSystem: boolean; }

export default function WorldDancePartyPage() {
  const searchParams = useSearchParams();
  const refToken = searchParams?.get("ref") ?? null;
  const sessionStartRef2 = useRef<number>(Date.now());

  const [bpm, setBpm] = useState(142);
  const [isLive, setIsLive] = useState(true);
  const [activeColor, setActiveColor] = useState(0);
  const [dancers, setDancers] = useState(2847);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  const trackInteraction = useCallback(() => {
    setInteractionCount((n) => n + 1);
  }, []);

  // ── Referral arrival tracking (runs once if ?ref=TOKEN in URL) ────────────
  useEffect(() => {
    if (!refToken) return;
    const invitedId = (() => {
      const key = "tmi-session-id";
      let id = sessionStorage.getItem(key);
      if (!id) { id = Math.random().toString(36).slice(2, 14); sessionStorage.setItem(key, id); }
      return id;
    })();

    fetch("/api/referral/qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refToken, invitedId, phase: "arrive" }),
    }).catch(() => {});

    // Qualify after 30s if user has interacted at least once
    const qualifyTimer = setTimeout(() => {
      const staySeconds = Math.floor((Date.now() - sessionStartRef2.current) / 1000);
      fetch("/api/referral/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refToken, invitedId, phase: "qualify", staySeconds, actionCount: 1 }),
      }).catch(() => {});
    }, 31_000);

    return () => clearTimeout(qualifyTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refToken]);

  // ── Record Ralph ──────────────────────────────────────────────────────────
  const ralphRef = useRef(new RecordRalphEngine(["TMI Gold Pass", "Berntout Records"]));
  const [ralphAnim, setRalphAnim] = useState<RalphAnimState>("idle-groove");

  // ── Chat feed ─────────────────────────────────────────────────────────────
  const [chatLines, setChatLines] = useState<ChatLine[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const addChat = (name: string, text: string, isSystem = false) => {
    setChatLines(prev => [
      ...prev.slice(-29),
      { id: `${Date.now()}-${Math.random()}`, name, text, isSystem },
    ]);
  };

  // ── Seating ───────────────────────────────────────────────────────────────
  const { seatId: persistedSeatId, claim: persistClaim } = useSeatSession(ROOM_ID, FAN_ID);
  const [mesh, setMesh] = useState<SeatingMeshState>(() =>
    createSeatingMesh(ROOM_ID, "wdp-session-001", SEAT_ROWS, SEAT_COLS),
  );
  useEffect(() => {
    setMesh(prev => {
      const result = autoAssignSeat(prev, FAN_ID, null);
      if (result) { persistClaim(result.seat.seatId); return result.state; }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fanSeat: MeshSeat | null = useMemo(() => getFanSeat(mesh, FAN_ID), [mesh]);
  const avatarPos = useMemo(
    () => (fanSeat ? seatToAvatarPosition(fanSeat, SEAT_COLS) : null),
    [fanSeat],
  );

  // ── Phase 1 bot activation ────────────────────────────────────────────────
  useEffect(() => {
    const stop = activatePhase1Bots(ROOM_ID, FAN_ID, {
      onWelcome: (text) => addChat("TMI", text, true),
      onBotChat: (name, text) => addChat(name, text),
      onBotHype: (name) => addChat(name, "🔥", false),
      onBotTip:  (name) => addChat(name, "💸 had to tip — worth it fr", false),
      onDiag:    (msg) => console.log(msg),
    });
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Ralph session opener — 1s tick ───────────────────────────────────────
  const sessionStartRef = useRef<number>(Date.now());
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (elapsed > OPENER_DURATION_SECONDS) { clearInterval(tick); return; }

      const line = getOpenerLineAt(elapsed);
      if (!line) return;

      if (line.animState) setRalphAnim(line.animState);
      addChat(
        line.speaker === "ralph" ? "Record Ralph" : line.speaker === "system" ? "TMI" : line.speaker,
        line.text,
        line.speaker !== "ralph",
      );
    }, 1000);
    return () => clearInterval(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Color + Ralph tick ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColor(c => (c + 1) % DANCE_FLOOR_COLORS.length);
      setDancers(d => d + Math.floor(Math.random() * 5) - 2);
      // Simulate crowd heat rising with dance activity
      const heat = 40 + Math.random() * 45;
      const audioHigh = Math.random() > 0.65;
      const anim = ralphRef.current.tickCrowdSignal(heat, audioHigh);
      setRalphAnim(anim);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatLines]);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, overflow: "hidden" }}>

          {/* BPM-reactive header glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 60 / bpm * 2, ease: "easeInOut" }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, height: "100vh",
              background: `radial-gradient(ellipse at 50% 30%, ${DANCE_FLOOR_COLORS[activeColor]}15 0%, transparent 60%)`,
              pointerEvents: "none", zIndex: 0,
            }}
          />

          {/* Top HUD */}
          <div style={{ position: "relative", zIndex: 1, padding: "28px 32px 0", borderBottom: "1px solid rgba(255,45,170,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FF2DAA", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800 }}>LIVE ROOM</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  WORLD DANCE PARTY
                </h1>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#FF2DAA" }}>{dancers.toLocaleString()}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>DANCERS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#00FFFF" }}>{bpm}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>BPM</div>
                </div>
                {fanSeat && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#00FF88" }}>
                      R{fanSeat.row + 1}·S{fanSeat.col + 1}
                    </div>
                    <div style={{ fontSize: 7, letterSpacing: 2, color: "#555" }}>SEAT</div>
                  </div>
                )}
                {isLive && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{
                      background: "#FF2DAA", borderRadius: 20, padding: "4px 12px",
                      fontSize: 9, fontWeight: 900, letterSpacing: 3, color: "#fff",
                    }}
                  >LIVE</motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, padding: "24px 32px" }}>

            {/* Dance floor / Main stage */}
            <div>
              {/* DJ Stream area */}
              <div style={{
                background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)",
                borderRadius: 16, padding: 24, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800 }}>🎧 DJ STREAM</div>
                  {/* Record Ralph host badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: "#888" }}>Record Ralph</div>
                    <motion.div
                      key={ralphAnim}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 800, letterSpacing: 1,
                        background: `${RALPH_ANIM_COLOR[ralphAnim]}22`,
                        border: `1px solid ${RALPH_ANIM_COLOR[ralphAnim]}66`,
                        color: RALPH_ANIM_COLOR[ralphAnim],
                      }}
                    >
                      {RALPH_ANIM_LABEL[ralphAnim]}
                    </motion.div>
                  </div>
                </div>
                <div style={{ background: "#0a0a1a", borderRadius: 10, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60 / bpm * 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 100, height: 100, borderRadius: "50%",
                      background: `conic-gradient(${DANCE_FLOOR_COLORS[activeColor]}, #0a0a1a, ${DANCE_FLOOR_COLORS[(activeColor + 2) % 6]})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#050510" }} />
                  </motion.div>
                </div>

                {/* Track list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DJ_TRACKS.map((track, i) => (
                    <div key={track.title} onClick={() => setCurrentTrack(i)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: 8, cursor: "pointer",
                      background: currentTrack === i ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${currentTrack === i ? "rgba(255,45,170,0.3)" : "rgba(255,255,255,0.05)"}`,
                    }}>
                      {currentTrack === i && (
                        <motion.div animate={{ scaleY: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.5 }}
                          style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3].map(b => (
                            <div key={b} style={{ width: 2, height: 14, background: "#FF2DAA", borderRadius: 1 }} />
                          ))}
                        </motion.div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: currentTrack === i ? "#fff" : "#aaa" }}>{track.title}</div>
                        <div style={{ fontSize: 10, color: "#666" }}>{track.artist}</div>
                      </div>
                      <div style={{ fontSize: 9, color: "#FF2DAA" }}>{track.bpm} BPM</div>
                      <div style={{ fontSize: 9, color: "#888" }}>{track.genre}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dance cam + voting */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{
                  background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)",
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>🎥 DANCE CAM</div>
                  <div style={{ background: "#0a0a1a", borderRadius: 8, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💃</div>
                      <div style={{ fontSize: 10, color: "#666" }}>Dance cams loading…</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)",
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>🏆 VOTE BEST DANCER</div>
                  {["CrownQueen44", "SmooveStyles", "NeonKing_X", "MidnightMover"].map(dancer => (
                    <div key={dancer} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(170,45,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>👤</div>
                      <div style={{ flex: 1, fontSize: 11, color: "#ccc" }}>{dancer}</div>
                      <motion.button whileTap={{ scale: 0.93 }} onClick={trackInteraction} style={{
                        padding: "4px 12px", borderRadius: 20,
                        background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.3)",
                        color: "#AA2DFF", fontSize: 9, fontWeight: 700, cursor: "pointer",
                      }}>VOTE</motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel — Tip + Light controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Tip dancer */}
              <div style={{
                background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>💰 TIP A DANCER</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[1, 5, 10, 25, 50, 100].map(amt => (
                    <motion.button key={amt} whileTap={{ scale: 0.94 }} onClick={() => { setTipAmount(amt); trackInteraction(); }} style={{
                      padding: "8px 0", borderRadius: 8, cursor: "pointer",
                      background: tipAmount === amt ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.06)",
                      border: `1px solid ${tipAmount === amt ? "#FFD700" : "rgba(255,215,0,0.15)"}`,
                      color: tipAmount === amt ? "#FFD700" : "#aaa",
                      fontSize: 13, fontWeight: 700,
                    }}>${amt}</motion.button>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} disabled={!tipAmount} style={{
                  width: "100%", padding: "11px 0", borderRadius: 8, cursor: tipAmount ? "pointer" : "default",
                  background: tipAmount ? "linear-gradient(135deg, #FFD700, #FF9500)" : "rgba(255,255,255,0.05)",
                  border: "none", color: tipAmount ? "#050510" : "#444",
                  fontWeight: 900, fontSize: 11, letterSpacing: 2,
                }}>
                  {tipAmount ? `TIP $${tipAmount}` : "SELECT AMOUNT"}
                </motion.button>
              </div>

              {/* Lighting mood */}
              <div style={{
                background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 14 }}>💡 ROOM LIGHTS</div>
                {[
                  { label: "DANCE MODE", icon: "🕺", color: "#FF2DAA" },
                  { label: "STROBE (SAFE)", icon: "⚡", color: "#00FFFF" },
                  { label: "CROWD WASH", icon: "🌊", color: "#AA2DFF" },
                  { label: "BEAM SWEEP", icon: "🔦", color: "#FFD700" },
                ].map(mode => (
                  <motion.button key={mode.label} whileTap={{ scale: 0.96 }} onClick={trackInteraction} style={{
                    display: "block", width: "100%", padding: "10px 14px", borderRadius: 8,
                    marginBottom: 6, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: mode.color, fontSize: 10, fontWeight: 700, letterSpacing: 2,
                    cursor: "pointer", textAlign: "left",
                  }}>
                    {mode.icon} {mode.label}
                  </motion.button>
                ))}
              </div>

              {/* Live chat feed */}
              <div style={{
                background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.12)",
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FF88", fontWeight: 800, marginBottom: 10 }}>
                  💬 LIVE CHAT
                </div>
                <div ref={chatRef} style={{
                  height: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6,
                }}>
                  {chatLines.length === 0 && (
                    <div style={{ fontSize: 10, color: "#444" }}>Chat is warming up…</div>
                  )}
                  {chatLines.map(line => (
                    <div key={line.id} style={{ fontSize: 11 }}>
                      <span style={{ fontWeight: 700, color: line.isSystem ? "#00FF88" : "#FF2DAA" }}>
                        {line.name}
                      </span>
                      <span style={{ color: "#aaa", marginLeft: 6 }}>{line.text}</span>
                    </div>
                  ))}
                </div>
                {avatarPos && (
                  <div style={{ fontSize: 8, color: "#444", marginTop: 8, fontFamily: "monospace" }}>
                    pos x:{avatarPos.x.toFixed(1)} z:{avatarPos.z.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Share / referral */}
              <ShareButton
                fanId={FAN_ID}
                roomId={ROOM_ID}
                sessionStartMs={sessionStartRef2.current}
                interactionCount={interactionCount}
                onReferralQualified={(total, milestone) => {
                  if (milestone) {
                    addChat("Record Ralph", "5 people answered the call. That's not a coincidence — that's energy.", false);
                  } else {
                    addChat("Record Ralph", "Someone just brought energy in here… I see you 👀", false);
                  }
                  setRalphAnim("crowd-scan");
                }}
              />

              {/* Quick nav */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 14 }}>OTHER ROOMS</div>
                {[
                  { label: "Cypher Arena", href: "/rooms/cypher" },
                  { label: "Monday Stage", href: "/rooms/monday-stage" },
                  { label: "Dirty Dozens", href: "/rooms/dirty-dozens" },
                  { label: "Monthly Idol", href: "/rooms/monthly-idol" },
                ].map(r => (
                  <Link key={r.label} href={r.href} style={{
                    display: "block", padding: "8px 0",
                    color: "#888", fontSize: 11, textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>→ {r.label}</Link>
                ))}
              </div>
            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
