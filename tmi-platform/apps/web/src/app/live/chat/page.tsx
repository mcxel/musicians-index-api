"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";
import {
  FIRST_BATTLE_SCRIPT_EMERGENCY,
  FIRST_BATTLE_SCRIPT_STEPS,
  getBattleScriptStepAtMinute,
  type BattleScriptEmergency,
  type BattleScriptPhase,
} from "@/lib/hosts/FirstBattleScriptEngine";

type ChatMessage = {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: number;
  role: "fan" | "artist" | "host" | "bot";
};

const ROLE_COLOR: Record<string, string> = {
  fan: "#ddd", artist: "#FF2DAA", host: "#FFD700", bot: "#00FF88",
};

// In-memory chat store (client side, resets on reload — real impl uses WebSocket/SSE)
let chatLog: ChatMessage[] = [
  { id: "1", userId: "bot-001", displayName: "TMI Bot", text: "Welcome to the live chat! 🎤", timestamp: Date.now() - 60000, role: "bot" },
  { id: "2", userId: "host-001", displayName: "DJ Marcus", text: "We're going live in 5 minutes. Get ready!", timestamp: Date.now() - 30000, role: "host" },
  { id: "3", userId: "fan-001", displayName: "WaveRider99", text: "Let's GOOO 🔥", timestamp: Date.now() - 10000, role: "fan" },
];

function genId() { return `msg-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`; }

const SCRIPT_MINUTE_MS = 30_000;

export default function LiveChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatLog);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [displayName, setDisplayName] = useState("Fan");
  const [role, setRole] = useState<ChatMessage["role"]>("fan");
  const [text, setText] = useState("");
  const [actorAgeClass, setActorAgeClass] = useState<SafetyAgeClass>("unknown");
  const [targetAgeClass, setTargetAgeClass] = useState<SafetyAgeClass>("unknown");
  const [safetyReason, setSafetyReason] = useState<string | null>(null);
  const [scriptRunning, setScriptRunning] = useState(false);
  const [scriptStartedAt, setScriptStartedAt] = useState<number | null>(null);
  const [scriptMinute, setScriptMinute] = useState(0);
  const [scriptPhase, setScriptPhase] = useState<BattleScriptPhase>("open-room");
  const bottomRef = useRef<HTMLDivElement>(null);
  const firedPhasesRef = useRef(new Set<BattleScriptPhase>());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function pushHostLine(line: string) {
    const hostMsg: ChatMessage = {
      id: genId(),
      userId: "host-script-engine",
      displayName: "Arena Host",
      text: line,
      timestamp: Date.now(),
      role: "host",
    };
    chatLog = [...chatLog, hostMsg];
    setMessages([...chatLog]);
  }

  function runFirstBattleScript() {
    if (scriptRunning) return;
    firedPhasesRef.current = new Set();
    setScriptRunning(true);
    setScriptMinute(0);
    setScriptPhase("open-room");
    setScriptStartedAt(Date.now());
    const opening = FIRST_BATTLE_SCRIPT_STEPS[0]!;
    firedPhasesRef.current.add(opening.id);
    opening.lines.forEach(pushHostLine);
  }

  function stopFirstBattleScript() {
    setScriptRunning(false);
    setScriptStartedAt(null);
  }

  function fireEmergencyCue(kind: BattleScriptEmergency) {
    pushHostLine(FIRST_BATTLE_SCRIPT_EMERGENCY[kind]);
  }

  useEffect(() => {
    if (!scriptRunning || scriptStartedAt === null) return;

    const id = window.setInterval(() => {
      const elapsedMs = Date.now() - scriptStartedAt;
      const nextMinute = Math.floor(elapsedMs / SCRIPT_MINUTE_MS);
      setScriptMinute(nextMinute);

      const step = getBattleScriptStepAtMinute(nextMinute);
      setScriptPhase(step.id);

      if (!firedPhasesRef.current.has(step.id)) {
        firedPhasesRef.current.add(step.id);
        step.lines.forEach(pushHostLine);
      }

      if (nextMinute >= 15) {
        stopFirstBattleScript();
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [scriptRunning, scriptStartedAt]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const decision = enforceAdultTeenContactBlock({
      source: "live:chat",
      channel: "room_chat",
      actor: {
        userId: `user-${Date.now()}`,
        ageClass: actorAgeClass,
        familyVerified: false,
        guardianApproved: false,
      },
      target: {
        userId: `audience-${venueSlug}`,
        ageClass: targetAgeClass,
      },
    });

    if (!decision.allowed) {
      setSafetyReason(decision.reason);
      return;
    }

    setSafetyReason(null);

    const msg: ChatMessage = {
      id: genId(),
      userId: `user-${Date.now()}`,
      displayName,
      text: text.trim(),
      timestamp: Date.now(),
      role,
    };
    chatLog = [...chatLog, msg];
    setMessages([...chatLog]);
    setText("");
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column" }}>
      <section style={{ padding: "40px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: 0 }}>Live Chat</h1>
          <select value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "6px 12px", fontSize: 13, marginLeft: "auto" }}>
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={runFirstBattleScript}
            disabled={scriptRunning}
            style={{
              border: "1px solid rgba(255,45,170,0.45)",
              background: scriptRunning ? "rgba(255,45,170,0.2)" : "rgba(255,45,170,0.12)",
              color: "#FF2DAA",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              cursor: scriptRunning ? "not-allowed" : "pointer",
            }}
          >
            Run First Battle Script
          </button>
          <button
            type="button"
            onClick={stopFirstBattleScript}
            disabled={!scriptRunning}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#ddd",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: !scriptRunning ? "not-allowed" : "pointer",
            }}
          >
            Stop Script
          </button>
          <span style={{ fontSize: 11, color: "#999" }}>
            {scriptRunning ? `Live Ops: minute ${scriptMinute} (${scriptPhase})` : "Live Ops: idle"}
          </span>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.keys(FIRST_BATTLE_SCRIPT_EMERGENCY) as BattleScriptEmergency[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => fireEmergencyCue(kind)}
              style={{
                border: "1px solid rgba(255,215,0,0.35)",
                background: "rgba(255,215,0,0.1)",
                color: "#FFD700",
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              Trigger {kind.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", maxWidth: 820, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: ROLE_COLOR[msg.role] + "22", border: `1px solid ${ROLE_COLOR[msg.role]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: ROLE_COLOR[msg.role], flexShrink: 0 }}>
              {msg.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ROLE_COLOR[msg.role] }}>{msg.displayName}</span>
                <span style={{ fontSize: 10, color: "#555" }}>{msg.role}</span>
                <span style={{ fontSize: 10, color: "#555", marginLeft: "auto" }}>{formatTime(msg.timestamp)}</span>
              </div>
              <div style={{ fontSize: 14, color: "#ddd", lineHeight: 1.5 }}>{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px", flexShrink: 0, background: "#080818" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name"
              style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "7px 12px", fontSize: 13, width: 140 }} />
            <select value={role} onChange={(e) => setRole(e.target.value as ChatMessage["role"])}
              style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "7px 12px", fontSize: 13 }}>
              <option value="fan">fan</option>
              <option value="artist">artist</option>
              <option value="host">host</option>
              <option value="bot">bot</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <select value={actorAgeClass} onChange={(e) => setActorAgeClass(e.target.value as SafetyAgeClass)} style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "7px 12px", fontSize: 13 }}>
              <option value="unknown">Sender age: unknown</option>
              <option value="minor">Sender age: minor</option>
              <option value="adult">Sender age: adult</option>
              <option value="test_minor">Sender age: test_minor</option>
              <option value="test_adult">Sender age: test_adult</option>
            </select>
            <select value={targetAgeClass} onChange={(e) => setTargetAgeClass(e.target.value as SafetyAgeClass)} style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "7px 12px", fontSize: 13 }}>
              <option value="unknown">Room age class: unknown</option>
              <option value="minor">Room age class: minor</option>
              <option value="adult">Room age class: adult</option>
              <option value="test_minor">Room age class: test_minor</option>
              <option value="test_adult">Room age class: test_adult</option>
            </select>
          </div>
          {safetyReason ? <p style={{ margin: "0 0 10px", fontSize: 11, color: "#fca5a5" }}>Blocked by P0 teen safety: {safetyReason}</p> : null}
          <form onSubmit={sendMessage} style={{ display: "flex", gap: 10 }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
              style={{ flex: 1, background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "10px 14px", fontSize: 14 }} />
            <button type="submit" disabled={!text.trim()}
              style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
