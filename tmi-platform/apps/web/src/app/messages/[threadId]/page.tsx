"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";

type Msg = { id: string; from: string; text: string; mine: boolean; ts: number };

function fmt(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

function normalizeMessages(data: unknown): Msg[] {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.messages)
      ? (data as Record<string, unknown[]>).messages
      : null;
  if (!arr || arr.length === 0) return [];
  return (arr as Record<string, unknown>[]).map((m, i) => ({
    id:   String(m.messageId ?? m.id ?? `m-${i}`),
    from: String(m.senderName ?? m.from ?? "Unknown"),
    text: String(m.body ?? m.content ?? m.text ?? ""),
    mine: Boolean(m.isOwn ?? m.mine ?? false),
    ts:   typeof m.createdAt === "string" ? new Date(m.createdAt).getTime() : (Number(m.createdAt) || Number(m.ts) || Date.now()),
  }));
}

export default function MessageThreadPage({ params }: { params: { threadId: string } }) {
  const { threadId } = params;
  const { trackAction } = useGamificationEngine();

  // Contact metadata loaded from the thread API
  const [contactName, setContactName] = useState(threadId);
  const [contactRole, setContactRole] = useState("USER");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,    setInput]    = useState("");
  const [ready,    setReady]    = useState(false);
  const [sending,  setSending]  = useState(false);
  const [safetyReason, setSafetyReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) { setReady(true); return; }
      const data = await res.json() as Record<string, unknown>;
      const normalized = normalizeMessages(data);
      setMessages(normalized);

      // Extract contact name/role from participants
      const participants = (data.participants as { userId: string; displayName: string; role: string }[]) ?? [];
      const currentUserId = (data.currentUserId as string) ?? "";
      const other = participants.find(p => p.userId !== currentUserId) ?? participants[0];
      if (other) {
        setContactName(other.displayName ?? threadId);
        setContactRole(other.role?.toUpperCase() ?? "USER");
      }
      setReady(true);
    } catch {
      setReady(true);
    }
  }, [threadId]);

  // Initial load
  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // 5-second poll for new messages
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => { void loadMessages(); }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages]);

  useEffect(() => {
    if (ready) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ready]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const decision = enforceAdultTeenContactBlock({
      source: "messages:thread",
      channel: "dm",
      actor:  { userId: "local-user", ageClass: "unknown", familyVerified: true, guardianApproved: true },
      target: { userId: threadId,     ageClass: "unknown", familyMember: true,   guardianLink: true    },
    });

    if (!decision.allowed) { setSafetyReason(decision.reason); return; }
    setSafetyReason(null);
    setError(null);
    setSending(true);

    // Optimistic append
    const outgoing: Msg = { id: `u${Date.now()}`, from: "You", text, mine: true, ts: Date.now() };
    setMessages(prev => [...prev, outgoing]);
    setInput("");
    trackAction('SEND_MESSAGE');

    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: text, type: "text" }),
      });
      if (!res.ok) setError("Failed to send. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const roleColor = (role: string): string => {
    if (role === "ARTIST" || role === "PERFORMER") return "#AA2DFF";
    if (role === "SPONSOR") return "#FFD700";
    if (role === "VENUE") return "#00FF88";
    if (role === "PROMOTER") return "#FF6B35";
    if (role === "ADMIN") return "#FF2DAA";
    return "#00FFFF";
  };

  const color = roleColor(contactRole);

  return (
    <main style={{ height: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", paddingTop: 56 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0, background: "rgba(5,5,16,0.97)" }}>
        <Link href="/messages" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          ← INBOX
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ width: 38, height: 38, background: `${color}15`, border: `2px solid ${color}40`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            💬
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{contactName}</div>
            {contactRole !== "USER" && (
              <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: "0.1em" }}>{contactRole}</div>
            )}
          </div>
        </div>
        <Link
          href={`/video/rooms/new?inviteId=${threadId}&name=${encodeURIComponent(contactName)}`}
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
        {/* Loading skeleton */}
        {!ready && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                <div style={{ width: "55%", height: 42, borderRadius: 12, background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {ready && messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 40 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              No messages yet. Send the first message below.
            </div>
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
              {!msg.mine && (
                <div style={{ fontSize: 9, fontWeight: 700, color: "#AA2DFF", marginBottom: 3 }}>{msg.from}</div>
              )}
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: msg.mine ? "right" : "left" }}>
                {fmt(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,16,0.97)", flexShrink: 0, maxWidth: 760, width: "100%", margin: "0 auto" }}>
        {safetyReason && (
          <div style={{ marginBottom: 8, fontSize: 11, color: "#fca5a5", padding: "6px 10px", borderRadius: 6, background: "rgba(252,165,165,0.08)" }}>
            ⚠️ {safetyReason}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 8, fontSize: 11, color: "#fca5a5", padding: "6px 10px", borderRadius: 6, background: "rgba(252,165,165,0.08)" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder={`Message ${contactName}…`}
            rows={2}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || sending}
            style={{
              padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", flexShrink: 0, borderRadius: 10, border: "none",
              color:      input.trim() && !sending ? "#050510"                              : "rgba(255,255,255,0.2)",
              background: input.trim() && !sending ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : "rgba(255,255,255,0.06)",
              cursor:     input.trim() && !sending ? "pointer"                              : "default",
              transition: "all 0.2s",
            }}
          >
            {sending ? "…" : "SEND"}
          </button>
        </div>
      </div>
    </main>
  );
}
