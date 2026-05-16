"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { RoomChatBubbleLayer } from "@/components/chat/RoomChatBubbleLayer";
import { PerformerFeedbackPanel } from "@/components/chat/PerformerFeedbackPanel";
import { CrowdChatOverflowPanel } from "@/components/chat/CrowdChatOverflowPanel";
import { ModeratorShield } from "@/components/chat/ModeratorShield";
import { RoomChatEngine } from "@/lib/chat/RoomChatEngine";
import type { RoomChatMessage } from "@/lib/chat/RoomChatEngine";
import type { OverflowRailEntry } from "@/lib/chat/ChatOverflowRailEngine";
import { ShowRoomEnvironmentShell } from "@/components/environments/ShowRoomEnvironmentShell";
import { ThemeVariantPreview } from "@/components/environments/ThemeVariantPreview";
import { getAllThemesForRoom } from "@/lib/environments/RoomThemeRotationEngine";
import type { LightingMode } from "@/lib/environments/LightingSceneEngine";
import { MondayNightStageEngine } from "@/lib/shows/MondayNightStageEngine";
import { BeboHookPanel } from "@/components/shows/BeboHookPanel";
import { MondayNightStagePanel } from "@/components/shows/MondayNightStagePanel";
import type { MondayNightStageState } from "@/lib/shows/MondayNightStageEngine";

const LIGHTING_MODES: LightingMode[] = ["idle", "pre-show", "performance", "reaction-yay", "reaction-boo", "winner-reveal", "elimination"];

const SAMPLE_CONTESTANTS = [
  { id: 'mns-1', name: 'Roxanne P.' },
  { id: 'mns-2', name: 'Jermaine K.' },
  { id: 'mns-3', name: 'Tasha M.' },
  { id: 'mns-4', name: 'Carlos D.' },
];

const SEED_CHAT_MNS: Omit<RoomChatMessage, "id" | "timestampMs" | "roomId">[] = [
  { userId: "u-kira",  displayName: "Kira",       role: "host",      text: "MONDAY NIGHT STAGE is LIVE 🔥" },
  { userId: "u-bebo",  displayName: "Bebo",        role: "host",      text: "Get ready — Bebo's watching 👀" },
  { userId: "u-p1",    displayName: "Roxanne P.",  role: "performer", text: "My time to shine ⭐" },
  { userId: "u-a1",    displayName: "fan_808",     role: "audience",  text: "YAY ROXANNE 👏👏👏" },
  { userId: "u-a2",    displayName: "fan_404",     role: "audience",  text: "BOO the hook is coming lmao" },
  { userId: "u-j1",    displayName: "Judge_2",     role: "judge",     text: "Stage presence: 8.5 / 10" },
  { userId: "u-sys",   displayName: "System",      role: "system",    text: "🎭 Bebo hook threshold: 70% boo" },
];

export default function MondayNightStagePage() {
  const [lightingMode, setLightingMode] = useState<LightingMode>("pre-show");
  const themes = getAllThemesForRoom("monday-night-stage");
  const [themeKey, setThemeKey] = useState(themes[0]?.key ?? "gold-showtime");

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chatEngine = useMemo(() => new RoomChatEngine("monday-night-stage", "LIVE_SHOW"), []);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [overflowOpen, setOverflowOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    SEED_CHAT_MNS.forEach(s => {
      try { chatEngine.pushMessage(s); } catch { /* safety */ }
    });
    setChatMessages(chatEngine.getMessages());
  }, [chatEngine]);

  const overflowEntries = useMemo<OverflowRailEntry[]>(() =>
    chatMessages.map(m => ({ id: m.id, message: m, role: m.role, displayName: m.displayName, text: m.text, timestamp: m.timestampMs, isNew: false })),
    [chatMessages]);

  const historyByUser = useMemo(() =>
    chatMessages.reduce<Record<string, RoomChatMessage[]>>((acc, m) => { acc[m.userId] = [...(acc[m.userId] ?? []), m]; return acc; }, {}),
    [chatMessages]);

  const handleChatSubmit = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    try { chatEngine.pushMessage({ userId: "viewer-local", displayName: "You", role: "audience", text }); setChatMessages(chatEngine.getMessages()); } catch { /* */ }
    setChatInput(""); chatInputRef.current?.focus();
  }, [chatEngine, chatInput]);

  const engine = useMemo(() => {
    const e = new MondayNightStageEngine();
    SAMPLE_CONTESTANTS.forEach((c) => e.show.addContestant(c.id, c.name));
    return e;
  }, []);

  const [stageState, setStageState] = useState<MondayNightStageState>(() => engine.getFullState());
  const [showStarted, setShowStarted] = useState(false);

  const refresh = useCallback(() => setStageState(engine.getFullState()), [engine]);

  const handleStart = useCallback(() => {
    engine.startShow();
    setShowStarted(true);
    setLightingMode("performance");
    refresh();
  }, [engine, refresh]);

  const handlePresentContestant = useCallback((id: string) => {
    engine.presentContestant(id);
    refresh();
  }, [engine, refresh]);

  const handleProcessVote = useCallback(() => {
    engine.processCrowdVote();
    refresh();
  }, [engine, refresh]);

  const handleCrowdVote = useCallback((type: 'yay' | 'boo') => {
    engine.show.recordCrowdVote(type);
    refresh();
  }, [engine, refresh]);

  const handleHook = useCallback((id: string) => {
    const state = engine.show.getState();
    const total = state.crowdYayCount + state.crowdBooCount;
    const booPercent = total > 0 ? state.crowdBooCount / total : 0.9;
    engine.bebo.hookPerformer(id, booPercent);
    engine.show.eliminateContestant(id);
    refresh();
  }, [engine, refresh]);

  const handleReturn = useCallback((id: string) => {
    const state = engine.show.getState();
    const total = state.crowdYayCount + state.crowdBooCount;
    const yayPercent = total > 0 ? state.crowdYayCount / total : 0.8;
    engine.bebo.returnPerformer(id, yayPercent);
    refresh();
  }, [engine, refresh]);

  return (
    <ShowRoomEnvironmentShell
      roomId="monday-night-stage"
      lightingMode={lightingMode}
      occupancyPct={0.85}
      showSeating
      showHosts
      showSponsors
    >
      <RoomChatBubbleLayer messages={chatMessages} state="LIVE_SHOW" viewerDistance="mid" seed={11} />

      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link href="/shows" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textDecoration: "none" }}>
            ← SHOWS
          </Link>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800 }}>THE MUSICIAN'S INDEX</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>MONDAY NIGHT STAGE</div>
          </div>
        </div>

        {/* Status strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "KIRA HOSTS",        color: "#00FFFF" },
            { label: "BEBO CO-HOST",      color: "#FFD700" },
            { label: "BEBO HOOK/CANE",    color: "#FF2DAA" },
            { label: "BOO = HOOK",        color: "#FF4444" },
            { label: "YAY = RECOVER",     color: "#00FF88" },
          ].map(({ label, color }) => (
            <span key={label} style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "3px 8px" }}>
              {label}
            </span>
          ))}
        </div>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 560 }}>
          Kira walks around, talks to contestants, introduces acts. Bebo has 3D/motion host behavior.
          If the crowd boos, Bebo hooks the performance panel away. If crowd yays recover, Bebo brings it back.
        </p>

        {/* Lighting mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>LIGHTING MODE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LIGHTING_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLightingMode(mode)}
                style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                  padding: "4px 10px", borderRadius: 5, cursor: "pointer",
                  background: lightingMode === mode ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                  border: lightingMode === mode ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.12)",
                  color: lightingMode === mode ? "#FFD700" : "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>ROOM THEME</div>
          <ThemeVariantPreview themes={themes} activeKey={themeKey} onSelect={setThemeKey} />
        </div>

        {/* Room info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "STAGE",         value: "Proscenium Bleachers" },
            { label: "SEATING",       value: "Bleachers — 5×14" },
            { label: "BEBO MECHANIC", value: "Hook / Cane" },
            { label: "KIRA PATH",     value: "Full Walkthrough" },
            { label: "SPONSOR SLOTS", value: "6 Active" },
            { label: "ELIMINATION",   value: "Panel Pull Animation" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Show runtime controls */}
        {!showStarted ? (
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleStart}
              style={{
                width: "100%",
                padding: "14px 0",
                background: "rgba(255,215,0,0.15)",
                border: "1px solid #FFD700",
                borderRadius: 10,
                color: "#FFD700",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.2em",
                cursor: "pointer",
              }}
            >
              START MONDAY NIGHT STAGE
            </button>
          </div>
        ) : null}

        {/* Live show panel */}
        {showStarted && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
              SHOW RUNTIME — LIVE
            </div>
            <MondayNightStagePanel
              stageState={stageState}
              onPresentContestant={handlePresentContestant}
              onProcessVote={handleProcessVote}
              onCrowdVote={handleCrowdVote}
              onHook={handleHook}
              onReturn={handleReturn}
            />
          </div>
        )}

        {/* Standalone Bebo panel (always visible for demo) */}
        {!showStarted && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
              BEBO HOOK PANEL PREVIEW
            </div>
            <BeboHookPanel
              beboState={stageState.bebo}
              onHook={handleHook}
              onReturn={handleReturn}
              activeContestantId={undefined}
            />
          </div>
        )}
        {/* Chat panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px 260px", gap: 14, marginTop: 24 }}>
          <div>
            <CrowdChatOverflowPanel entries={overflowEntries} unreadCount={0} isOpen={overflowOpen} onToggle={() => setOverflowOpen(v => !v)} density={chatMessages.length} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input ref={chatInputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }} placeholder="Say something..." maxLength={240} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }} />
              <button type="button" onClick={handleChatSubmit} style={{ padding: "10px 20px", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 10, color: "#FFD700", fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer" }}>SEND</button>
            </div>
          </div>
          <PerformerFeedbackPanel messages={chatMessages} state="LIVE_SHOW" />
          <ModeratorShield incoming={chatMessages.slice(-20)} historyByUser={historyByUser} />
        </div>
      </div>
    </ShowRoomEnvironmentShell>
  );
}
