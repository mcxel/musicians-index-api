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
import { MonthlyIdolEngine } from "@/lib/shows/MonthlyIdolEngine";
import { MonthlyIdolStage } from "@/components/shows/MonthlyIdolStage";
import type { MonthlyIdolState, IdolWindow } from "@/lib/shows/MonthlyIdolEngine";

const LIGHTING_MODES: LightingMode[] = ["idle", "pre-show", "performance", "reaction-yay", "reaction-boo", "winner-reveal", "elimination"];

const SAMPLE_CONTESTANTS = [
  { id: 'idol-1', name: 'Serena V.' },
  { id: 'idol-2', name: 'Malik J.' },
  { id: 'idol-3', name: 'Priscilla G.' },
  { id: 'idol-4', name: 'Tobias N.' },
  { id: 'idol-5', name: 'Yara O.' },
];

const SEED_CHAT_MI: Omit<RoomChatMessage, "id" | "timestampMs" | "roomId">[] = [
  { userId: "u-host", displayName: "Julius",     role: "host",      text: "Round 3 is about to start 🎬" },
  { userId: "u-p1",   displayName: "Serena V.",  role: "performer", text: "I came to WIN 👑" },
  { userId: "u-a1",   displayName: "fan_707",    role: "audience",  text: "Serena is goated no debate" },
  { userId: "u-a2",   displayName: "fan_212",    role: "audience",  text: "LET'S GO MALIK 🔥🔥" },
  { userId: "u-j1",   displayName: "Judge_A",    role: "judge",     text: "Strong vocals, pitch perfect" },
  { userId: "u-sys",  displayName: "System",     role: "system",    text: "⏱️ 5 minutes to next window" },
];

export default function MonthlyIdolPage() {
  const [lightingMode, setLightingMode] = useState<LightingMode>("pre-show");
  const [themeKey, setThemeKey] = useState("neon-magenta");
  const themes = getAllThemesForRoom("monthly-idol");

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chatEngine = useMemo(() => new RoomChatEngine("monthly-idol", "LIVE_SHOW"), []);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [overflowOpen, setOverflowOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    SEED_CHAT_MI.forEach(s => {
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
    const e = new MonthlyIdolEngine();
    SAMPLE_CONTESTANTS.forEach((c) => e.addContestant(c.id, c.name));
    return e;
  }, []);

  const [idolState, setIdolState] = useState<MonthlyIdolState>(() => engine.getIdolState());
  const [showStarted, setShowStarted] = useState(false);
  const [newContestantName, setNewContestantName] = useState('');
  const [winnerMsg, setWinnerMsg] = useState<string | null>(null);

  const refresh = useCallback(() => setIdolState(engine.getIdolState()), [engine]);

  const handleStart = useCallback(() => {
    engine.startShow();
    setShowStarted(true);
    setLightingMode("performance");
    refresh();
  }, [engine, refresh]);

  const handleWindowChange = useCallback((window: IdolWindow) => {
    engine.openWindow(window);
    refresh();
  }, [engine, refresh]);

  const handleForfeit = useCallback((id: string) => {
    engine.forfeitContestant(id);
    refresh();
  }, [engine, refresh]);

  const handleCrown = useCallback((id: string) => {
    const result = engine.crownMonthlyIdol(id);
    setWinnerMsg(`MONTHLY IDOL: ${result.winnerName} — ${result.score} pts!`);
    setLightingMode("winner-reveal");
    refresh();
  }, [engine, refresh]);

  const handleAddContestant = useCallback(() => {
    if (!newContestantName.trim()) return;
    const id = `idol-new-${Date.now()}`;
    engine.addContestant(id, newContestantName.trim());
    setNewContestantName('');
    refresh();
  }, [engine, newContestantName, refresh]);

  return (
    <ShowRoomEnvironmentShell
      roomId="monthly-idol"
      lightingMode={lightingMode}
      occupancyPct={0.72}
      showSeating
      showHosts
      showSponsors
    >
      {/* Chat bubble overlay — sits on top of entire shell content */}
      <RoomChatBubbleLayer messages={chatMessages} state="LIVE_SHOW" viewerDistance="mid" seed={9} />

      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link href="/shows" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textDecoration: "none" }}>
            ← SHOWS
          </Link>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800 }}>THE MUSICIAN'S INDEX</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>MONTHLY IDOL</div>
          </div>
        </div>

        {/* Status strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "ALL MONTH",   color: "#00FF88" },
            { label: "NEW WINNER",  color: "#FFD700" },
            { label: "BOO / YAY",   color: "#FF2DAA" },
            { label: "IDOL ROUNDS", color: "#00FFFF" },
          ].map(({ label, color }) => (
            <span key={label} style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "3px 8px" }}>
              {label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 560 }}>
          Monthly Idol runs all month. New winner every 30 days. Idol-style progression with TMI flair —
          two daily windows: morning global &amp; 7 PM night. Any country, any performer. Miss your slot: forfeit or bump.
        </p>

        {/* Lighting mode control */}
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
                  background: lightingMode === mode ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.05)",
                  border: lightingMode === mode ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.12)",
                  color: lightingMode === mode ? "#FF2DAA" : "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Theme selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>ROOM THEME</div>
          <ThemeVariantPreview themes={themes} activeKey={themeKey} onSelect={setThemeKey} />
        </div>

        {/* Room info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "STAGE",            value: "Proscenium" },
            { label: "SEATING",          value: "Theater — 6×12" },
            { label: "HOST SLOTS",       value: "Lead + Co-Host + 2 Judges" },
            { label: "SHOW WINDOWS",     value: "Morning + 7 PM" },
            { label: "SPONSOR SLOTS",    value: "6 Active" },
            { label: "WINNER FLOW",      value: "Hall → Magazine → Billboard" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Winner banner */}
        {winnerMsg && (
          <div style={{ padding: "14px 18px", marginBottom: 18, background: "rgba(255,215,0,0.1)", border: "1px solid #FFD700", borderRadius: 10, fontSize: 14, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", textAlign: "center" }}>
            {winnerMsg}
          </div>
        )}

        {/* Window selector */}
        {showStarted && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>SHOW WINDOW</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(['MORNING_GLOBAL', 'EVENING_7PM'] as IdolWindow[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleWindowChange(w)}
                  style={{
                    padding: "7px 16px",
                    background: idolState.currentWindow === w ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${idolState.currentWindow === w ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 7,
                    color: idolState.currentWindow === w ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  {w === 'MORNING_GLOBAL' ? 'MORNING GLOBAL' : '7 PM EVENING'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start / Stage */}
        {!showStarted ? (
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleStart}
              style={{
                width: "100%",
                padding: "14px 0",
                background: "rgba(255,45,170,0.15)",
                border: "1px solid #FF2DAA",
                borderRadius: 10,
                color: "#FF2DAA",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.2em",
                cursor: "pointer",
              }}
            >
              START MONTHLY IDOL
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {/* Add contestant */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={newContestantName}
                onChange={(e) => setNewContestantName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddContestant()}
                placeholder="New contestant name..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 7,
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleAddContestant}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255,45,170,0.12)",
                  border: "1px solid rgba(255,45,170,0.4)",
                  borderRadius: 7,
                  color: "#FF2DAA",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                }}
              >
                ADD
              </button>
            </div>

            <MonthlyIdolStage
              idolState={idolState}
              onForfeit={handleForfeit}
              onCrownIdol={handleCrown}
            />
          </div>
        )}
        {/* Chat panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px 260px", gap: 14, marginTop: 24 }}>
          <div>
            <CrowdChatOverflowPanel entries={overflowEntries} unreadCount={0} isOpen={overflowOpen} onToggle={() => setOverflowOpen(v => !v)} density={chatMessages.length} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input ref={chatInputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }} placeholder="Say something..." maxLength={240} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }} />
              <button type="button" onClick={handleChatSubmit} style={{ padding: "10px 20px", background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 10, color: "#FF2DAA", fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer" }}>SEND</button>
            </div>
          </div>
          <PerformerFeedbackPanel messages={chatMessages} state="LIVE_SHOW" />
          <ModeratorShield incoming={chatMessages.slice(-20)} historyByUser={historyByUser} />
        </div>
      </div>
    </ShowRoomEnvironmentShell>
  );
}
