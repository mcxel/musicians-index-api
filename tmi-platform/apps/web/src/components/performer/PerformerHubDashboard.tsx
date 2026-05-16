"use client";

import { useEffect, useState, useCallback } from "react";
import {
  initStageControl, switchCamera, setLightingScene, setVoiceFx,
  toggleAICoHost, startMeetGreetTimer, tickMeetGreetTimer, setMicHot,
  subscribeToStageControl, queueIntro,
  type StageControlState, type CameraAngle, type LightingScene,
} from "@/lib/performer/PerformerStageControlEngine";
import {
  initConcertReadiness, updateCheck, subscribeToConcertReadiness,
  type ConcertReadinessState, type ReadinessCheck,
} from "@/lib/performer/ConcertReadinessEngine";
import {
  initStreamHealth, startStream, stopStream, subscribeToStreamHealth,
  type StreamHealthState,
} from "@/lib/performer/StreamHealthEngine";
import {
  initRevenuePulse, recordRevenue, subscribeToRevenuePulse,
  type RevenuePulseState,
} from "@/lib/performer/RevenuePulseEngine";
import {
  initPerformanceFlow, transitionPhase, advanceSetlist, subscribeToPerformanceFlow,
  type PerformanceFlowState, type FlowPhase,
} from "@/lib/performer/PerformanceFlowEngine";
import {
  initCrowdIntensity, ingestSignal, subscribeToCrowdIntensity,
  type CrowdIntensityState,
} from "@/lib/performer/CrowdIntensityAnalyzer";
import {
  initBookingEngine, acceptRequest, declineRequest, subscribeToBookings,
  type BookingResponseState, type BookingRequest,
} from "@/lib/performer/BookingResponseEngine";
import {
  getMagazineBridgeSnapshot,
  subscribeToMagazineBridge,
  type MagazineBridgeSnapshot,
} from "@/lib/performer/MagazinePerformerAnalyticsBridge";

const ROOM_ID = "performer-hub-live";

interface PerformerHubDashboardProps {
  performerId: string;
  displayName: string;
}

const CAMERAS: CameraAngle[] = ["wide", "center", "close", "profile", "overhead", "audience", "pit"];
const LIGHTING: LightingScene[] = ["neutral", "warm", "cool", "dramatic", "blackout", "strobe", "rainbow", "spotlight"];
const VOICE_FX = ["none", "reverb", "chorus", "pitch_up", "pitch_down", "robot", "echo"];

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function IntensityBar({ value, max = 100, color = "#06b6d4" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "#1a1a2e", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: ok ? "#22c55e" : "#ef4444", marginRight: 6, flexShrink: 0,
    }} />
  );
}

export default function PerformerHubDashboard({ performerId, displayName }: PerformerHubDashboardProps) {
  const [stage, setStage] = useState<StageControlState | null>(null);
  const [readiness, setReadiness] = useState<ConcertReadinessState | null>(null);
  const [stream, setStream] = useState<StreamHealthState | null>(null);
  const [revenue, setRevenue] = useState<RevenuePulseState | null>(null);
  const [flow, setFlow] = useState<PerformanceFlowState | null>(null);
  const [crowd, setCrowd] = useState<CrowdIntensityState | null>(null);
  const [bookings, setBookings] = useState<BookingResponseState | null>(null);
  const [magBridge, setMagBridge] = useState<MagazineBridgeSnapshot>(() => getMagazineBridgeSnapshot());
  const [meetGreetInput, setMeetGreetInput] = useState("10");

  useEffect(() => {
    initStageControl(ROOM_ID, performerId);
    initConcertReadiness(ROOM_ID, performerId);
    initStreamHealth(ROOM_ID, performerId);
    initRevenuePulse(ROOM_ID, performerId);
    initPerformanceFlow(ROOM_ID, performerId, [
      { id: "s1", title: "Opening Track", estimatedDurationMs: 240_000, energyTarget: 70, notes: null },
      { id: "s2", title: "Second Set",    estimatedDurationMs: 200_000, energyTarget: 85, notes: null },
      { id: "s3", title: "Closer",        estimatedDurationMs: 180_000, energyTarget: 100, notes: null },
    ]);
    initCrowdIntensity(ROOM_ID);
    initBookingEngine(performerId);

    const unsubs = [
      subscribeToStageControl(ROOM_ID, setStage),
      subscribeToConcertReadiness(ROOM_ID, setReadiness),
      subscribeToStreamHealth(ROOM_ID, setStream),
      subscribeToRevenuePulse(ROOM_ID, setRevenue),
      subscribeToPerformanceFlow(ROOM_ID, setFlow),
      subscribeToCrowdIntensity(ROOM_ID, setCrowd),
      subscribeToBookings(performerId, setBookings),
      subscribeToMagazineBridge(setMagBridge),
    ];

    // Simulated crowd signal ingestion
    const crowdInterval = setInterval(() => {
      if (Math.random() > 0.6) ingestSignal(ROOM_ID, "chat");
      if (Math.random() > 0.8) ingestSignal(ROOM_ID, "reaction");
      if (Math.random() > 0.95) ingestSignal(ROOM_ID, "tip");
    }, 1000);

    // Meet & greet timer tick
    const timerInterval = setInterval(() => {
      tickMeetGreetTimer(ROOM_ID, 1000);
    }, 1000);

    return () => {
      unsubs.forEach(u => u?.());
      clearInterval(crowdInterval);
      clearInterval(timerInterval);
    };
  }, [performerId]);

  const handleCameraSwitch = useCallback((cam: CameraAngle) => switchCamera(ROOM_ID, cam), []);
  const handleLighting = useCallback((scene: LightingScene) => setLightingScene(ROOM_ID, scene), []);
  const handleVoiceFx = useCallback((fx: string) => setVoiceFx(ROOM_ID, fx === "none" ? null : fx), []);
  const handleMicToggle = useCallback(() => setMicHot(ROOM_ID, !stage?.micHot), [stage]);
  const handleAICoHost = useCallback(() => toggleAICoHost(ROOM_ID, !stage?.aiCoHostActive), [stage]);
  const handleGoLive = useCallback(() => { startStream(ROOM_ID); transitionPhase(ROOM_ID, "intro_cinematic"); }, []);
  const handleEndShow = useCallback(() => { stopStream(ROOM_ID); transitionPhase(ROOM_ID, "complete"); }, []);
  const handleQueueIntro = useCallback(() => queueIntro(ROOM_ID), []);
  const handleNextSong = useCallback(() => advanceSetlist(ROOM_ID), []);
  const handlePhase = useCallback((phase: FlowPhase) => transitionPhase(ROOM_ID, phase), []);
  const handleCheckPass = useCallback((check: ReadinessCheck) => updateCheck(ROOM_ID, check, "pass"), []);
  const handleStartMeetGreet = useCallback(() => startMeetGreetTimer(ROOM_ID, parseInt(meetGreetInput) * 60_000), [meetGreetInput]);
  const handleSimulateTip = useCallback(() => {
    recordRevenue(ROOM_ID, { stream: "tip", amountCents: Math.round(Math.random() * 1000 + 100), fromUserId: "sim_user", fromDisplayName: "Sim Fan", note: null });
    ingestSignal(ROOM_ID, "tip");
  }, []);

  const card = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );

  const pill = (label: string, active: boolean, onClick: () => void, activeColor = "#06b6d4") => (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
      background: active ? activeColor : "#1e1e3a", color: active ? "#0f0f1a" : "#94a3b8", transition: "all 0.2s",
    }}>{label}</button>
  );

  const streamQ = stream?.current.quality ?? "offline";
  const qColor = { excellent: "#22c55e", good: "#84cc16", degraded: "#f59e0b", poor: "#ef4444", offline: "#6b7280" }[streamQ];
  const sessionRevenueDisplay = Math.max(revenue?.sessionTotalCents ?? 0, magBridge.sessionRevenueCents);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#e2e8f0", minHeight: "100vh", background: "#07071a", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0ff" }}>{displayName}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Performer Control Room</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!stream?.isLive ? (
            <button onClick={handleGoLive} style={{ background: "#06b6d4", color: "#0f0f1a", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Go Live
            </button>
          ) : (
            <button onClick={handleEndShow} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              End Show
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Stage Readiness */}
        {card("Stage Readiness", (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: readiness?.overallReady ? "#22c55e" : "#f59e0b" }}>
                {readiness?.readinessScore ?? 0}%
              </span>
              <span style={{ fontSize: 11, color: readiness?.overallReady ? "#22c55e" : "#f59e0b", alignSelf: "center" }}>
                {readiness?.overallReady ? "READY TO LAUNCH" : `${readiness?.criticalBlockers.length ?? 0} BLOCKERS`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {readiness?.items.slice(0, 6).map(item => (
                <div key={item.check} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <StatusDot ok={item.status === "pass"} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.check.replace(/_/g, " ")}</span>
                    {item.critical && <span style={{ fontSize: 9, color: "#f59e0b", marginLeft: 4 }}>CRITICAL</span>}
                  </div>
                  {item.status === "pending" && (
                    <button onClick={() => handleCheckPass(item.check)} style={{ fontSize: 10, padding: "2px 8px", background: "#1e1e3a", border: "1px solid #334155", borderRadius: 4, color: "#94a3b8", cursor: "pointer" }}>
                      Check
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Stream Health */}
        {card("Stream Health", (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: qColor, textTransform: "uppercase" }}>{streamQ}</span>
              {stream?.alertActive && <span style={{ fontSize: 10, color: "#ef4444" }}>{stream.alertReason}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Bitrate", `${stream?.current.bitrateKbps ?? 0} kbps`],
                ["Latency", `${stream?.current.latencyMs ?? 0} ms`],
                ["Dropped", `${stream?.current.droppedFramesPct.toFixed(1) ?? "0.0"}%`],
                ["Viewers", `${stream?.current.viewerCount ?? 0}`],
                ["CPU", `${stream?.current.cpuUsagePct ?? 0}%`],
                ["FPS", `${stream?.current.encoderFps ?? 0}`],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "#1a1a2e", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Revenue Pulse */}
        {card("Revenue Pulse", (
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>
              ${ (sessionRevenueDisplay / 100).toFixed(2) }
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>session earnings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["tip", "ticket", "merch", "sponsor"] as const).map(s => (
                <div key={s} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>{s}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>
                    ${((revenue?.byStream[s] ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Top Tipper: {revenue?.topTipperName ?? "—"} (${((revenue?.topTipAmountCents ?? 0) / 100).toFixed(2)})</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Unique Tippers: {revenue?.uniqueTippers.size ?? 0}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Scene Occupancy: {magBridge.occupancySignal} · {magBridge.activeSceneId}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Last Scene Delta: ${((magBridge.revenueDeltaCents ?? 0) / 100).toFixed(2)} · transitions {magBridge.transitionCount}
              </div>
            </div>
            <button onClick={handleSimulateTip} style={{ marginTop: 10, fontSize: 10, padding: "4px 10px", background: "#1e1e3a", border: "1px solid #334155", borderRadius: 4, color: "#94a3b8", cursor: "pointer" }}>
              Simulate Tip
            </button>
          </div>
        ))}

        {/* Camera Control */}
        {card("Camera Switching", (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CAMERAS.map(cam => pill(cam, stage?.activeCamera === cam, () => handleCameraSwitch(cam)))}
            </div>
          </div>
        ))}

        {/* Lighting Control */}
        {card("Stage Lighting", (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LIGHTING.map(scene => pill(scene, stage?.lightingScene === scene, () => handleLighting(scene), "#f59e0b"))}
            </div>
          </div>
        ))}

        {/* Mic + AI + Voice FX */}
        {card("Audio + AI Controls", (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleMicToggle} style={{
                flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none",
                background: stage?.micHot ? "#22c55e" : "#ef4444", color: "#fff",
              }}>
                {stage?.micHot ? "MIC HOT" : "MIC OFF"}
              </button>
              <button onClick={handleAICoHost} style={{
                flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none",
                background: stage?.aiCoHostActive ? "#a78bfa" : "#1e1e3a", color: stage?.aiCoHostActive ? "#0f0f1a" : "#94a3b8",
              }}>
                {stage?.aiCoHostActive ? "AI CO-HOST ON" : "AI CO-HOST"}
              </button>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Voice FX</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {VOICE_FX.map(fx => pill(fx, (stage?.voiceFxActive ?? "none") === fx, () => handleVoiceFx(fx), "#ec4899"))}
              </div>
            </div>
          </div>
        ))}

        {/* Performance Flow */}
        {card("Performance Flow", (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4" }}>{flow?.phase.replace(/_/g, " ").toUpperCase()}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {flow?.setlist[flow.currentSetlistIndex]?.title ?? "—"}
                  {" "}({flow?.currentSetlistIndex ?? 0 + 1}/{flow?.setlist.length ?? 0})
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{msToTime(flow?.performanceDurationMs ?? 0)}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>runtime</div>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Energy</div>
              <IntensityBar value={flow?.currentEnergyLevel ?? 0} color="#f59e0b" />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={handleQueueIntro} style={{ fontSize: 11, padding: "4px 10px", background: "#1e1e3a", border: "1px solid #334155", borderRadius: 4, color: "#94a3b8", cursor: "pointer" }}>
                Queue Intro
              </button>
              <button onClick={handleNextSong} style={{ fontSize: 11, padding: "4px 10px", background: "#1e1e3a", border: "1px solid #334155", borderRadius: 4, color: "#94a3b8", cursor: "pointer" }}>
                Next Song
              </button>
              {(["climax", "encore_tease", "encore", "outro"] as FlowPhase[]).map(p => (
                <button key={p} onClick={() => handlePhase(p)} style={{ fontSize: 11, padding: "4px 10px", background: "#1e1e3a", border: "1px solid #334155", borderRadius: 4, color: "#94a3b8", cursor: "pointer" }}>
                  {p.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Crowd Intensity */}
        {card("Crowd Intensity", (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: crowd?.zone === "explosive" ? "#f59e0b" : crowd?.zone === "hot" ? "#ef4444" : crowd?.zone === "warm" ? "#06b6d4" : "#64748b" }}>
                {crowd?.intensityScore ?? 0}
              </span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase", fontSize: 12 }}>{crowd?.zone ?? "cold"}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Encore pressure: {crowd?.encorePressure ?? 0}</div>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <IntensityBar value={crowd?.intensityScore ?? 0} color="#ec4899" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div><span style={{ fontSize: 10, color: "#64748b" }}>Chat/min: </span><span style={{ fontSize: 12, fontWeight: 600 }}>{crowd?.chatVelocity ?? 0}</span></div>
              <div><span style={{ fontSize: 10, color: "#64748b" }}>React/min: </span><span style={{ fontSize: 12, fontWeight: 600 }}>{crowd?.reactionRate ?? 0}</span></div>
              <div><span style={{ fontSize: 10, color: "#64748b" }}>Trend: </span><span style={{ fontSize: 12, fontWeight: 600 }}>{crowd?.viewerTrend ?? "stable"}</span></div>
              <div><span style={{ fontSize: 10, color: "#64748b" }}>Peak: </span><span style={{ fontSize: 12, fontWeight: 600 }}>{crowd?.peakIntensity ?? 0}</span></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Audience Heatmap</div>
              <div style={{ display: "flex", gap: 4 }}>
                {crowd?.heatmap.map(cell => (
                  <div key={cell.zone} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: 4, borderRadius: 2, background: `rgba(236,72,153,${cell.intensity / 100})`, marginBottom: 2 }} />
                    <div style={{ fontSize: 8, color: "#475569" }}>{cell.zone.replace(/_/g, " ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Meet & Greet Timer */}
        {card("Meet & Greet Timer", (
          <div>
            {stage?.meetGreetTimerMs !== null && stage?.meetGreetTimerMs !== undefined ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: stage.meetGreetTimerMs < 60_000 ? "#ef4444" : "#a78bfa" }}>
                  {msToTime(stage.meetGreetTimerMs)}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>remaining</div>
                <IntensityBar value={100 - (stage.meetGreetTimerMs / (parseInt(meetGreetInput) * 60_000)) * 100} color="#a78bfa" />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={meetGreetInput}
                  onChange={e => setMeetGreetInput(e.target.value)}
                  type="number"
                  min={1}
                  style={{ width: 60, padding: "6px 8px", background: "#1a1a2e", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", fontSize: 14 }}
                />
                <span style={{ fontSize: 12, color: "#64748b" }}>minutes</span>
                <button onClick={handleStartMeetGreet} style={{ padding: "6px 14px", background: "#a78bfa", color: "#0f0f1a", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Start
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Booking Requests */}
        {card("Booking & Battle Invites", (
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              {bookings?.pendingCount ?? 0} pending · {bookings?.acceptedCount ?? 0} accepted
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(bookings?.requests ?? []).filter((r: BookingRequest) => r.status === "pending").slice(0, 4).map((r: BookingRequest) => (
                <div key={r.id} style={{ background: "#1a1a2e", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{r.fromDisplayName}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{r.type.replace(/_/g, " ")} · {r.venueName ?? "No venue"}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{r.proposedFeesCents ? `$${(r.proposedFeesCents / 100).toFixed(0)}` : "Fee TBD"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => acceptRequest(performerId, r.id)} style={{ fontSize: 10, padding: "3px 8px", background: "#22c55e", color: "#0f0f1a", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Accept</button>
                      <button onClick={() => declineRequest(performerId, r.id)} style={{ fontSize: 10, padding: "3px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Decline</button>
                    </div>
                  </div>
                </div>
              ))}
              {(bookings?.pendingCount ?? 0) === 0 && (
                <div style={{ textAlign: "center", color: "#475569", fontSize: 12, padding: 16 }}>No pending requests</div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
