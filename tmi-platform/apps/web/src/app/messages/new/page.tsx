"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";

const SUGGESTED = [
  // Early access VIP cohort
  { id: "kreach", name: "Kreach",      role: "ARTIST",   icon: "🎵", color: "#AA2DFF" },
  { id: "kg",     name: "KG",          role: "PRODUCER", icon: "🎹", color: "#FFD700" },
  { id: "savage", name: "Savage Guns", role: "ARTIST",   icon: "🔥", color: "#FF2DAA" },
  { id: "jason",  name: "Jason Smith", role: "PROMOTER", icon: "⭐", color: "#00FF88" },
  // General contacts
  { id: "c1", name: "Wavetek",     role: "ARTIST",  icon: "🎤", color: "#FF2DAA" },
  { id: "c2", name: "Zuri Bloom",  role: "ARTIST",  icon: "🌍", color: "#00FF88" },
  { id: "c3", name: "Neon Vibe",   role: "DJ",      icon: "🎧", color: "#00FFFF" },
  { id: "c4", name: "Krypt",       role: "ARTIST",  icon: "🔒", color: "#AA2DFF" },
  { id: "c5", name: "TMI Support", role: "SUPPORT", icon: "🛡️", color: "#00FFFF" },
  { id: "c6", name: "TMI Booking", role: "SYSTEM",  icon: "📋", color: "#FFD700" },
];

function NewMessageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefilledId   = searchParams?.get("recipientId") ?? "";
  const prefilledName = searchParams?.get("name") ?? "";

  const [query,   setQuery]   = useState(prefilledName);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);

  // If arriving with a recipientId that matches a known contact, navigate directly
  useEffect(() => {
    if (prefilledId && SUGGESTED.some(u => u.id === prefilledId)) {
      router.replace(`/messages/${prefilledId}`);
    }
  }, [prefilledId, router]);

  const filtered = SUGGESTED.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSend(recipientId: string) {
    const decision = enforceAdultTeenContactBlock({
      source: "messages:new",
      channel: "dm",
      actor:  { userId: "local-user", ageClass: "unknown", familyVerified: true, guardianApproved: true },
      target: { userId: recipientId,  ageClass: "unknown", familyMember: true,   guardianLink: true    },
    });

    if (!decision.allowed) { setBlocked(decision.reason); return; }
    setBlocked(null);
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

        {blocked && (
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#fca5a5", padding: "8px 12px", borderRadius: 8, background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.2)" }}>
            ⚠️ {blocked}
          </p>
        )}

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
              <button
                key={user.id}
                onClick={() => handleSend(user.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%", color: "#fff" }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{user.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: user.color }}>{user.role}</div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>→</span>
              </button>
            ))}
            {filtered.length === 0 && query && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "12px 0" }}>No users found for "{query}"</p>
            )}
          </div>
        </div>

        {/* Compose (optional first message) */}
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>MESSAGE (OPTIONAL):</div>
          <textarea
            placeholder="Write your first message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
      </div>
    </main>
  );
}

export default function NewMessagePage() {
  return (
    <Suspense>
      <NewMessageInner />
    </Suspense>
  );
}
