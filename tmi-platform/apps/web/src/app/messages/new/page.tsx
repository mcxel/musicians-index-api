"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

const SUGGESTED = [
  { id: "c1", name: "Wavetek",     role: "ARTIST",  icon: "🎤", color: "#FF2DAA" },
  { id: "c2", name: "Zuri Bloom",  role: "ARTIST",  icon: "🌍", color: "#00FF88" },
  { id: "c3", name: "Neon Vibe",   role: "DJ",      icon: "🎧", color: "#00FFFF" },
  { id: "c4", name: "Krypt",       role: "ARTIST",  icon: "🔒", color: "#AA2DFF" },
  { id: "c5", name: "TMI Support", role: "SUPPORT", icon: "🛡️", color: "#00FFFF" },
  { id: "c6", name: "TMI Booking", role: "SYSTEM",  icon: "📋", color: "#FFD700" },
];

export default function NewMessagePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [actorAgeClass, setActorAgeClass] = useState<SafetyAgeClass>("unknown");
  const [targetAgeClass, setTargetAgeClass] = useState<SafetyAgeClass>("unknown");
  const [safetyReason, setSafetyReason] = useState<string | null>(null);

  const filtered = SUGGESTED.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSend(recipientId: string) {
    if (!message.trim()) return;

    const decision = enforceAdultTeenContactBlock({
      source: "messages:new",
      channel: "dm",
      actor: {
        userId: "local-user",
        ageClass: actorAgeClass,
        familyVerified: true,
        guardianApproved: true,
      },
      target: {
        userId: recipientId,
        ageClass: targetAgeClass,
        familyMember: true,
        guardianLink: true,
      },
    });

    if (!decision.allowed) {
      setSafetyReason(decision.reason);
      return;
    }

    setSafetyReason(null);
    router.push(`/messages/${recipientId}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/messages" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BACK TO MESSAGES
        </Link>

        <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>New Message</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Start a conversation with an artist, fan, or the TMI team.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <select value={actorAgeClass} onChange={(e) => setActorAgeClass(e.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", color: "#fff", padding: "8px 10px", fontSize: 12 }}>
            <option value="unknown">Sender age: unknown</option>
            <option value="minor">Sender age: minor</option>
            <option value="adult">Sender age: adult</option>
            <option value="test_minor">Sender age: test_minor</option>
            <option value="test_adult">Sender age: test_adult</option>
          </select>
          <select value={targetAgeClass} onChange={(e) => setTargetAgeClass(e.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", color: "#fff", padding: "8px 10px", fontSize: 12 }}>
            <option value="unknown">Target age: unknown</option>
            <option value="minor">Target age: minor</option>
            <option value="adult">Target age: adult</option>
            <option value="test_minor">Target age: test_minor</option>
            <option value="test_adult">Target age: test_adult</option>
          </select>
        </div>
        {safetyReason ? <p style={{ margin: "0 0 14px", fontSize: 11, color: "#fca5a5" }}>Blocked by P0 teen safety: {safetyReason}</p> : null}

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>TO:</div>
          <input
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", fontWeight: 700, marginBottom: 10 }}>
            {query ? "RESULTS" : "SUGGESTED"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(user => (
              <button key={user.id} onClick={() => handleSend(user.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{user.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: user.color }}>{user.role}</div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>MESSAGE:</div>
          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
      </div>
    </main>
  );
}
