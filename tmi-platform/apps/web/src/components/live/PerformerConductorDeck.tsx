"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStageSnapshot,
  subscribeStage,
  startCountdown,
  triggerIntermission,
  resumeFromIntermission,
  closeCurtainAndEnd,
  configureStage,
  type StageSnapshot,
} from "@/lib/live/StageLifecycleEngine";
import { subscribeShoutouts, type ShoutoutState } from "@/lib/live/InteractionBroadcastEngine";
import { predictVibeMode, type VibePrediction } from "@/lib/live/VibePredictor";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

// Inject CSS once
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = `
@keyframes deckPulse { 0%,100%{opacity:.7} 50%{opacity:1} }
@keyframes shoutSlide { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes energyFill { from{width:0%} to{width:var(--w)} }
`;
  document.head.appendChild(s);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopFan { id: string; name: string; avatar?: string; totalTips: number; }
interface RecentTip { id: string; fanName: string; amount: number; message?: string; ts: number; }

const SEED_FANS: TopFan[] = [
  { id: "f1", name: "VibeKing99",   totalTips: 240 },
  { id: "f2", name: "BassDropQueen", totalTips: 185 },
  { id: "f3", name: "TrapStar_ATL",  totalTips: 120 },
  { id: "f4", name: "NightCypher",   totalTips: 95 },
  { id: "f5", name: "GoldFreq",      totalTips: 70 },
];

const VIBE_OPTIONS = [
  { key: "HYPE",    label: "🔥 Hype",    color: "#FF2DAA" },
  { key: "CHILL",   label: "🌊 Chill",   color: "#00FFFF" },
  { key: "BATTLE",  label: "⚔️ Battle",  color: "#FFD700" },
  { key: "STORY",   label: "📖 Story",   color: "#AA2DFF" },
  { key: "ENERGY",  label: "⚡ Energy",  color: "#00FF88" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PerformerConductorDeck() {
  const [snap, setSnap] = useState<StageSnapshot>(getStageSnapshot());
  const [curtainDuration, setCurtainDuration] = useState(4);  // seconds
  const [stageReady, setStageReady] = useState(false);
  const [activeVibe, setActiveVibe] = useState("HYPE");
  const [shoutouts, setShoutouts] = useState<ShoutoutState[]>([]);
  const [recentTips, setRecentTips] = useState<RecentTip[]>([]);
  const [crowdEnergy, setCrowdEnergy] = useState(72);
  const [vibePrediction, setVibePrediction] = useState<VibePrediction | null>(null);
  const [topFans] = useState<TopFan[]>(SEED_FANS);
  const [viewerCount] = useState(1240);
  const [cameraMode, setCameraMode] = useState<"WIDE" | "MID" | "CLOSE">("WIDE");
  const [showReady, setShowReady] = useState(false);
  const energyRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    injectCSS();
    const unsubStage = subscribeStage(setSnap);
    const unsubShout = subscribeShoutouts((s) => {
      setShoutouts((prev) => [s, ...prev.slice(0, 4)]);
      if (s.tip.amountUsd) {
        setRecentTips((prev) => [
          { id: s.id, fanName: s.tip.fanName, amount: s.tip.amountUsd, message: s.tip.message, ts: Date.now() },
          ...prev.slice(0, 9),
        ]);
      }
    });

    // Simulate organic crowd energy drift
    energyRef.current = setInterval(() => {
      setCrowdEnergy((e) => {
        const next = Math.max(20, Math.min(100, e + (Math.random() - 0.42) * 3));
        const entries = WarpEntryLog.getAll();
        setVibePrediction(predictVibeMode(entries, next));
        return next;
      });
    }, 2000);

    return () => {
      unsubStage();
      unsubShout();
      if (energyRef.current) clearInterval(energyRef.current);
    };
  }, []);

  function handleGoLive() {
    if (!stageReady) { setShowReady(true); return; }
    configureStage({ curtainDurationMs: curtainDuration * 1000, countdownSeconds: 10 });
    startCountdown();
  }

  function handleConfirmReady() {
    setStageReady(true);
    setShowReady(false);
    configureStage({ curtainDurationMs: curtainDuration * 1000, countdownSeconds: 10 });
    startCountdown();
  }

  const isLive = snap.state === "CAMERA_LIVE" || snap.state === "INTERMISSION";
  const isPrep = snap.state === "STAGE_PREP";
  const inCountdown = snap.state === "COUNTDOWN";
  const energyColor = crowdEnergy > 70 ? "#FF2DAA" : crowdEnergy > 45 ? "#FFD700" : "#00FFFF";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#050510", color: "#fff",
      fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column",
      zIndex: 200, overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.3em" }}>
            PERFORMER DECK
          </div>
          <StatusPill state={snap.state} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            👥 {viewerCount.toLocaleString()} watching
          </span>
          {isLive && (
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", animation: "deckPulse 1.5s ease-in-out infinite" }} />
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, gap: 0, minHeight: 0 }}>
        {/* LEFT COLUMN — Stage controls */}
        <div style={{
          width: 280, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: 16, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto",
        }}>

          {/* Pre-flight panel */}
          {isPrep && (
            <Panel label="PRE-FLIGHT" color="#FFD700">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                  Curtain Open Duration
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="range" min={2} max={10} step={1} value={curtainDuration}
                    onChange={(e) => setCurtainDuration(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#FFD700" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#FFD700", minWidth: 30 }}>
                    {curtainDuration}s
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  onClick={() => setStageReady((v) => !v)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, cursor: "pointer",
                    background: stageReady ? "#00FF88" : "rgba(255,255,255,0.12)",
                    transition: "background 0.2s", position: "relative",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    left: stageReady ? 18 : 2,
                  }} />
                </div>
                <span style={{ fontSize: 11, color: stageReady ? "#00FF88" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                  {stageReady ? "Stage Ready" : "Not Ready"}
                </span>
              </div>

              <button
                onClick={handleGoLive}
                disabled={inCountdown}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                  background: stageReady ? "linear-gradient(135deg,#FF2DAA,#FF2DAA99)" : "rgba(255,255,255,0.08)",
                  color: stageReady ? "#050510" : "rgba(255,255,255,0.4)", fontWeight: 800,
                  fontSize: 12, cursor: stageReady ? "pointer" : "default",
                  letterSpacing: "0.1em", transition: "all 0.2s",
                }}
              >
                {inCountdown ? `COUNTING DOWN...` : "▶ GO LIVE"}
              </button>
            </Panel>
          )}

          {/* Countdown display */}
          {inCountdown && (
            <Panel label="COUNTDOWN" color="#FF2DAA">
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: "#FF2DAA", lineHeight: 1 }}>
                  {snap.countdownRemaining}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  seconds until curtain opens
                </div>
              </div>
            </Panel>
          )}

          {/* Live controls */}
          {isLive && (
            <>
              <Panel label="VIBE CONTROL" color="#AA2DFF">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {VIBE_OPTIONS.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setActiveVibe(v.key)}
                      style={{
                        padding: "8px 12px", borderRadius: 8, border: `1px solid ${activeVibe === v.key ? v.color + "60" : "rgba(255,255,255,0.08)"}`,
                        background: activeVibe === v.key ? v.color + "18" : "rgba(255,255,255,0.03)",
                        color: activeVibe === v.key ? v.color : "rgba(255,255,255,0.5)",
                        fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel label="CAMERA" color="#00FFFF">
                <div style={{ display: "flex", gap: 6 }}>
                  {(["WIDE", "MID", "CLOSE"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCameraMode(m)}
                      style={{
                        flex: 1, padding: "7px 4px", borderRadius: 7, border: `1px solid ${cameraMode === m ? "#00FFFF60" : "rgba(255,255,255,0.08)"}`,
                        background: cameraMode === m ? "#00FFFF18" : "rgba(255,255,255,0.03)",
                        color: cameraMode === m ? "#00FFFF" : "rgba(255,255,255,0.4)",
                        fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel label="SHOW CONTROLS" color="#FF2DAA">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {snap.state === "CAMERA_LIVE" ? (
                    <button
                      onClick={triggerIntermission}
                      style={{ padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                    >
                      ⏸ Intermission
                    </button>
                  ) : (
                    <button
                      onClick={resumeFromIntermission}
                      style={{ padding: "8px 0", borderRadius: 8, border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.08)", color: "#00FF88", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                    >
                      ▶ Resume Show
                    </button>
                  )}
                  <button
                    onClick={closeCurtainAndEnd}
                    style={{ padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,45,170,0.3)", background: "rgba(255,45,170,0.06)", color: "#FF2DAA", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    ■ End Show
                  </button>
                </div>
              </Panel>
            </>
          )}
        </div>

        {/* CENTER — Crowd Energy + Shoutout queue */}
        <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          {/* Crowd energy bar */}
          <Panel label="CROWD ENERGY" color={energyColor}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: energyColor }}>
                {Math.round(crowdEnergy)}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>/ 100</div>
              <div style={{ fontSize: 11, color: energyColor, marginLeft: "auto", fontWeight: 800 }}>
                {crowdEnergy > 80 ? "🔥 ON FIRE" : crowdEnergy > 60 ? "⚡ HOT" : crowdEnergy > 40 ? "🎵 VIBING" : "🌊 BUILDING"}
              </div>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${crowdEnergy}%`,
                background: `linear-gradient(90deg,${energyColor}80,${energyColor})`,
                borderRadius: 4, transition: "width 1.2s ease",
              }} />
            </div>
            {vibePrediction && (
              <div style={{
                marginTop: 10,
                padding: "8px 12px",
                background: `${vibePrediction.mode === 'HYPE' || vibePrediction.mode === 'PEAK' || vibePrediction.mode === 'LEGENDARY' ? '#FFD700' : '#00FFFF'}14`,
                border: `1px solid ${vibePrediction.mode === 'HYPE' || vibePrediction.mode === 'PEAK' || vibePrediction.mode === 'LEGENDARY' ? '#FFD700' : '#00FFFF'}44`,
                borderRadius: 8,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ fontSize: 16 }}>
                  {vibePrediction.mode === 'LEGENDARY' ? '🔥' : vibePrediction.mode === 'PEAK' ? '⚡' : vibePrediction.mode === 'HYPE' ? '🎯' : vibePrediction.mode === 'WARMING' ? '📈' : '❄️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: vibePrediction.mode === 'HYPE' || vibePrediction.mode === 'PEAK' || vibePrediction.mode === 'LEGENDARY' ? '#FFD700' : '#00FFFF' }}>
                    {vibePrediction.mode} — {vibePrediction.velocityTrend.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    Δ {vibePrediction.predictedEnergyDelta > 0 ? '+' : ''}{vibePrediction.predictedEnergyDelta} · {Math.round(vibePrediction.confidence * 100)}% confidence
                  </div>
                </div>
                {(vibePrediction.mode === 'HYPE' || vibePrediction.mode === 'PEAK' || vibePrediction.mode === 'LEGENDARY') && (
                  <div style={{ fontSize: 9, fontWeight: 900, padding: '4px 10px', background: '#FFD700', color: '#050510', borderRadius: 4, letterSpacing: '0.08em', animation: 'deckPulse 1.2s infinite' }}>
                    ⚡ BURST
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Shoutout queue */}
          <Panel label="SHOUTOUT QUEUE" color="#FFD700">
            {shoutouts.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "12px 0" }}>
                Shoutouts appear here when fans tip
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AnimatePresence>
                  {shoutouts.slice(0, 5).map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ x: 80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        padding: "10px 12px",
                        background: `rgba(255,215,0,0.08)`,
                        border: "1px solid rgba(255,215,0,0.25)",
                        borderRadius: 10, display: "flex", gap: 10, alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 18 }}>💰</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700" }}>
                          {s.tip.fanName}
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 400, marginLeft: 8 }}>
                            ${s.tip.amountUsd}
                          </span>
                        </div>
                        {s.tip.message && (
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                            "{s.tip.message}"
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 4,
                        background: `rgba(255,215,0,0.2)`, color: "#FFD700",
                        letterSpacing: "0.1em",
                      }}>
                        {s.phase.replace("_", " ").toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Panel>

          {/* Recent tips */}
          <Panel label="TIP FEED" color="#00FF88">
            {recentTips.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "8px 0" }}>
                No tips yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentTips.slice(0, 8).map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{t.fanName}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#00FF88" }}>${t.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT COLUMN — Top fans + stats */}
        <div style={{
          width: 220, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.06)",
          padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto",
        }}>
          <Panel label="TOP FANS" color="#AA2DFF">
            {topFans.map((fan, i) => (
              <div key={fan.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 0",
                borderBottom: i < topFans.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, color: "#050510", flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fan.name}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>${fan.totalTips}</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel label="ACTIVE VIBE" color="#AA2DFF">
            <div style={{ textAlign: "center" }}>
              {(() => {
                const v = VIBE_OPTIONS.find((o) => o.key === activeVibe)!;
                return (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{v.label.split(" ")[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: v.color }}>{v.key}</div>
                  </>
                );
              })()}
            </div>
          </Panel>

          <Panel label="CAMERA MODE" color="#00FFFF">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>
                {cameraMode === "WIDE" ? "🎥" : cameraMode === "MID" ? "📹" : "🔍"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#00FFFF" }}>{cameraMode} SHOT</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                {cameraMode === "WIDE" ? "Full audience view" : cameraMode === "MID" ? "Mid-stage coverage" : "Intimate close-up"}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Stage-ready confirmation modal */}
      <AnimatePresence>
        {showReady && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowReady(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 400, padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#0a0a1a", border: "1px solid rgba(255,45,170,0.3)",
                borderRadius: 20, padding: "32px 28px", maxWidth: 380, width: "100%",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.3em", marginBottom: 8 }}>
                CONFIRM GO LIVE
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Are you stage-ready?</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 24 }}>
                Once you confirm, a {curtainDuration}s countdown begins and your curtain opens live to the audience.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowReady(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Not yet
                </button>
                <button
                  onClick={handleConfirmReady}
                  style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FF2DAA,#FF2DAA99)", color: "#050510", fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: "0.06em" }}
                >
                  I&apos;M READY — GO LIVE →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Panel sub-component ───────────────────────────────────────────────────────

function Panel({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${color}18`,
      borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: "0.25em", marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ state }: { state: string }) {
  const config: Record<string, { color: string; label: string }> = {
    STAGE_PREP:    { color: "#FFD700", label: "PREP" },
    COUNTDOWN:     { color: "#FF9500", label: "COUNTDOWN" },
    CURTAIN_PART:  { color: "#AA2DFF", label: "OPENING" },
    LIGHTING_SNAP: { color: "#00FFFF", label: "LIGHTING" },
    CAMERA_LIVE:   { color: "#00FF88", label: "● LIVE" },
    INTERMISSION:  { color: "#FFD700", label: "INTERMISSION" },
    CURTAIN_CLOSE: { color: "#AA2DFF", label: "CLOSING" },
    ENDED:         { color: "rgba(255,255,255,0.3)", label: "ENDED" },
  };
  const c = config[state] ?? { color: "rgba(255,255,255,0.3)", label: state };
  return (
    <div style={{
      fontSize: 8, fontWeight: 800, padding: "3px 9px", borderRadius: 4,
      background: c.color + "18", color: c.color, border: `1px solid ${c.color}40`,
      letterSpacing: "0.1em",
    }}>
      {c.label}
    </div>
  );
}
