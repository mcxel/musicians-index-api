"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";

const SYSTEM_CONTACTS = [
  { id: "tmi-support", name: "TMI Support",   role: "SUPPORT", icon: "🛡️", color: "#00FFFF" },
  { id: "tmi-booking", name: "TMI Booking",   role: "SYSTEM",  icon: "📋", color: "#FFD700" },
  { id: "tmi-admin",   name: "TMI Admin",     role: "ADMIN",   icon: "👑", color: "#FF2DAA" },
];

function NewMessageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefilledId   = searchParams?.get("recipientId") ?? "";
  const prefilledName = searchParams?.get("name") ?? "";

  const [query,   setQuery]   = useState(prefilledName);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    prefilledId ? { id: prefilledId, name: prefilledName } : null
  );

  const filtered = [
    ...SYSTEM_CONTACTS.filter(u => u.name.toLowerCase().includes(query.toLowerCase())),
  ];

  async function handleSend(recipientId: string, recipientName: string) {
    const decision = enforceAdultTeenContactBlock({
      source: "messages:new",
      channel: "dm",
      actor:  { userId: "local-user", ageClass: "unknown", familyVerified: true, guardianApproved: true },
      target: { userId: recipientId,  ageClass: "unknown", familyMember: true,   guardianLink: true    },
    });

    if (!decision.allowed) { setBlocked(decision.reason); return; }
    setBlocked(null);

    if (!message.trim()) {
      // No body — just navigate to thread (or create empty thread)
      setSelected({ id: recipientId, name: recipientName });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId, recipientName, body: message.trim(), kind: "fan-fan" }),
      });
      if (res.ok) {
        const data = await res.json() as { threadId?: string };
        router.push(`/messages/${data.threadId ?? recipientId}`);
      } else {
        router.push(`/messages/${recipientId}`);
      }
    } catch {
      router.push(`/messages/${recipientId}`);
    } finally {
      setSending(false);
    }
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
            {selected ? "SELECTED" : query ? "RESULTS" : "TMI CONTACTS"}
          </div>

          {selected ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 700 }}>SELECTED</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelected({ id: user.id, name: user.name })}
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
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "12px 0" }}>No contacts found for "{query}"</p>
              )}
            </div>
          )}
        </div>

        {/* Compose */}
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>MESSAGE:</div>
          <textarea
            placeholder="Write your first message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          <button
            disabled={!selected || sending}
            onClick={() => selected && void handleSend(selected.id, selected.name)}
            style={{
              marginTop: 12, width: "100%", padding: "13px 0", fontSize: 11, fontWeight: 900,
              letterSpacing: "0.12em", borderRadius: 10, border: "none",
              background: selected && !sending ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : "rgba(255,255,255,0.06)",
              color: selected && !sending ? "#fff" : "rgba(255,255,255,0.25)",
              cursor: selected && !sending ? "pointer" : "not-allowed",
            }}
          >
            {sending ? "SENDING…" : selected ? `SEND TO ${selected.name.toUpperCase()}` : "SELECT A CONTACT FIRST"}
          </button>
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
