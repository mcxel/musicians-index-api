"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

type Msg = { id: string; from: string; text: string; mine: boolean; ts: number };

const CONTACTS: Record<string, { name: string; role: string; icon: string; color: string; online: boolean }> = {
  c1: { name: "Wavetek",     role: "ARTIST",  icon: "🎤", color: "#FF2DAA", online: true  },
  c2: { name: "TMI Support", role: "SUPPORT", icon: "🛡️", color: "#00FFFF", online: true  },
  c3: { name: "Zuri Bloom",  role: "ARTIST",  icon: "🌍", color: "#00FF88", online: false },
  c4: { name: "Neon Vibe",   role: "DJ",      icon: "🎧", color: "#00FFFF", online: true  },
  c5: { name: "Krypt",       role: "ARTIST",  icon: "🔒", color: "#AA2DFF", online: false },
  c6: { name: "TMI Booking", role: "SYSTEM",  icon: "📋", color: "#FFD700", online: true  },
};

const SEED: Record<string, Msg[]> = {
  c1: [
    { id: "s1", from: "Wavetek",     text: "Yo, you coming to the cypher tonight?",          mine: false, ts: Date.now() - 120000   },
    { id: "s2", from: "You",         text: "For sure, what time does it start?",              mine: true,  ts: Date.now() - 115000   },
    { id: "s3", from: "Wavetek",     text: "9pm. Hit the link in bio for the room code.",    mine: false, ts: Date.now() - 110000   },
  ],
  c2: [
    { id: "s1", from: "TMI Support", text: "Your payout has been processed successfully.",   mine: false, ts: Date.now() - 3600000  },
    { id: "s2", from: "You",         text: "Thanks! How long until it clears?",              mine: true,  ts: Date.now() - 3580000  },
    { id: "s3", from: "TMI Support", text: "Typically 2–3 business days via Stripe.",        mine: false, ts: Date.now() - 3570000  },
  ],
  c3: [{ id: "s1", from: "Zuri Bloom",  text: "Loved your set last night, let's collab!",   mine: false, ts: Date.now() - 10800000 }],
  c4: [{ id: "s1", from: "Neon Vibe",   text: "I'll send you the stems tonight",             mine: false, ts: Date.now() - 86400000 }],
  c5: [{ id: "s1", from: "Krypt",       text: "Beat's in the folder, check it out",          mine: false, ts: Date.now() - 172800000}],
  c6: [
    { id: "s1", from: "TMI Booking", text: "Venue request from venue1 — review now",        mine: false, ts: Date.now() - 259200000},
    { id: "s2", from: "You",         text: "Reviewing it now, thanks.",                      mine: true,  ts: Date.now() - 259000000},
    { id: "s3", from: "TMI Booking", text: "Confirmed. Contract draft is in your dashboard.",mine: false, ts: Date.now() - 258000000},
  ],
};

const AUTO_REPLIES: Record<string, string[]> = {
  c1: ["fire 🔥", "say less", "bet, see you there 🎤", "you know how we do 💯"],
  c2: ["Got it! Anything else we can help with?", "Happy to help. Let us know.", "We'll follow up shortly."],
  c3: ["Yes! Let's set something up 🌍", "DM me your schedule", "When are you free this week?"],
  c4: ["👌", "sending tonight for real", "check the folder in an hour"],
  c5: ["🔒", "it's in there bro", "check the drop folder"],
  c6: ["Noted. Dashboard is updated.", "Booking confirmed.", "Any other questions on this?"],
};

function normalizeMessages(data: unknown, fallback: Msg[]): Msg[] {
  if (!Array.isArray(data) || data.length === 0) return fallback;
  return (data as Record<string, unknown>[]).map((m, i) => ({
    id:   String(m.id ?? `m-${i}`),
    from: String(m.senderName ?? m.from ?? "Unknown"),
    text: String(m.content ?? m.text ?? ""),
    mine: Boolean(m.isMine ?? m.mine ?? false),
    ts:   typeof m.createdAt === "string" ? new Date(m.createdAt).getTime() : (Number(m.ts) || Date.now()),
  }));
}

function fmt(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

export default function MessageThreadPage({ params }: { params: { threadId: string } }) {
  const { threadId } = params;
  const contact = CONTACTS[threadId] ?? { name: threadId, role: "USER", icon: "💬", color: "#00FFFF", online: false };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [ready,    setReady]    = useState(false);
  const [apiMode,  setApiMode]  = useState(false);
  const [actorAgeClass, setActorAgeClass] = useState<SafetyAgeClass>("unknown");
  const [targetAgeClass, setTargetAgeClass] = useState<SafetyAgeClass>("unknown");
  const [safetyReason, setSafetyReason] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load thread — try API first, fall back to seed
  useEffect(() => {
    let active = true;

    fetch(`/api/messages/conversations/${threadId}`, { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const normalized = normalizeMessages(d, SEED[threadId] ?? []);
        setMessages(normalized);
        setApiMode(Array.isArray(d) && d.length > 0);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setMessages(SEED[threadId] ?? []);
        setReady(true);
      });

    // Mark thread as read
    fetch(`/api/messages/conversations/${threadId}`, { method: "POST", credentials: "include" }).catch(() => {});

    return () => { active = false; };
  }, [threadId]);

  useEffect(() => {
    if (ready) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, ready]);

  const sendViaApi = useCallback(async (text: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toUserId: threadId, content: text }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [threadId]);

  function send() {
    const text = input.trim();
    if (!text) return;

    const decision = enforceAdultTeenContactBlock({
      source: "messages:thread",
      channel: "dm",
      actor: {
        userId: "local-user",
        ageClass: actorAgeClass,
        familyVerified: true,
        guardianApproved: true,
      },
      target: {
        userId: threadId,
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

    const outgoing: Msg = { id: `u${Date.now()}`, from: "You", text, mine: true, ts: Date.now() };
    setMessages(prev => [...prev, outgoing]);
    setInput("");

    // Send via API (optimistic — message already shown)
    if (apiMode) {
      void sendViaApi(text);
    }

    // Simulate reply for known seed contacts
    const replies = AUTO_REPLIES[threadId];
    if (replies && contact.online) {
      setTyping(true);
      setTimeout(() => {
        const reply = replies[Math.floor(Math.random() * replies.length)];
        setMessages(prev => [
          ...prev,
          { id: `r${Date.now()}`, from: contact.name, text: reply, mine: false, ts: Date.now() },
        ]);
        setTyping(false);
      }, 1400 + Math.random() * 1200);
    }
  }

  return (
    <main style={{ height: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", paddingTop: 56 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0, background: "rgba(5,5,16,0.97)" }}>
        <Link href="/messages" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          ← INBOX
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 38, height: 38, background: `${contact.color}15`, border: `2px solid ${contact.color}40`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {contact.icon}
            </div>
            {contact.online && (
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, background: "#00FF88", borderRadius: "50%", border: "2px solid #050510" }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{contact.name}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: contact.online ? "#00FF88" : "rgba(255,255,255,0.3)" }}>
              {contact.online ? "● ONLINE" : "○ OFFLINE"} · {contact.role}
            </div>
          </div>
        </div>
        {!apiMode && ready && (
          <span style={{ fontSize: 8, color: "#FFD700", letterSpacing: "0.1em", fontWeight: 700 }}>PREVIEW</span>
        )}
        <Link
          href={`/video/rooms/new?inviteId=${threadId}&name=${encodeURIComponent(contact.name)}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)",
            fontSize: 16, textDecoration: "none", flexShrink: 0,
          }}
          title="Start video call"
        >
          🎥
        </Link>
      </div>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 10, maxWidth: 760, width: "100%", margin: "0 auto" }}>
        {!ready && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                <div style={{ width: "55%", height: 42, borderRadius: 12, background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        )}

        {ready && messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.mine ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "10px 14px",
              borderRadius: msg.mine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
              background: msg.mine ? "rgba(255,45,170,0.13)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${msg.mine ? "rgba(255,45,170,0.35)" : "rgba(255,255,255,0.08)"}`,
            }}>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: msg.mine ? "right" : "left" }}>
                {fmt(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 2px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: contact.color, opacity: 0.8 }} />
                ))}
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{contact.name} is typing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,16,0.97)", flexShrink: 0, maxWidth: 760, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
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
        {safetyReason ? <div style={{ marginBottom: 8, fontSize: 11, color: "#fca5a5" }}>Blocked by P0 teen safety: {safetyReason}</div> : null}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${contact.name}…`}
            rows={2}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            style={{
              padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", flexShrink: 0, borderRadius: 10, border: "none",
              color:      input.trim() ? "#050510"                                  : "rgba(255,255,255,0.2)",
              background: input.trim() ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : "rgba(255,255,255,0.06)",
              cursor:     input.trim() ? "pointer"                                  : "default",
              transition: "all 0.2s",
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </main>
  );
}
