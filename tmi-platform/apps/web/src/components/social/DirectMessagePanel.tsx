"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface DMessage {
  id: string;
  fromId: string;
  fromName: string;
  text: string;
  timestamp: number;
  read?: boolean;
  type?: "text" | "tip" | "booking_invite" | "track_share";
  meta?: Record<string, string>;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  avatarColor?: string;
  lastMessage?: string;
  lastTime?: number;
  unreadCount?: number;
  isOnline?: boolean;
}

interface DirectMessagePanelProps {
  currentUserId: string;
  currentUserName: string;
  initialConversations?: Conversation[];
  accent?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export default function DirectMessagePanel({
  currentUserId,
  currentUserName,
  initialConversations = [],
  accent = "#FF2DAA",
  onClose,
  style,
}: DirectMessagePanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<DMessage[]>([]);
  const [draft, setDraft]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [view, setView]                   = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const BG        = "#05060f";
  const PANEL_BG  = "#07081a";
  const BORDER    = "rgba(255,255,255,0.07)";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when conversation is selected
  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    setView("chat");
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const res = await fetch(`/api/social/messages/${conv.userId}`, { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { messages?: DMessage[] };
        setMessages(data.messages ?? []);
        // Mark as read
        setConversations((cs) => cs.map((c) => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c));
      }
    } catch {
      // Show placeholder messages if API not wired yet
      setMessages([
        { id: "1", fromId: conv.userId, fromName: conv.userName, text: "Hey! What's up?", timestamp: Date.now() - 60000 },
        { id: "2", fromId: currentUserId, fromName: currentUserName, text: "Not much — just getting the studio ready.", timestamp: Date.now() - 30000 },
      ]);
    }
  }, [currentUserId, currentUserName]);

  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !activeConv || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);

    // Optimistic add
    const optimistic: DMessage = {
      id: `opt-${Date.now()}`, fromId: currentUserId,
      fromName: currentUserName, text, timestamp: Date.now(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      await fetch(`/api/social/messages/${activeConv.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
    } catch {
      // keep optimistic message visible
    } finally {
      setSending(false);
    }
  }, [draft, activeConv, sending, currentUserId, currentUserName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        width: 340,
        height: 520,
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, gap: 8, background: PANEL_BG, flexShrink: 0 }}>
        {view === "chat" && activeConv ? (
          <>
            <button type="button" onClick={() => setView("list")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: 0, marginRight: 4 }}>←</button>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: activeConv.avatarColor ?? `${accent}22`, border: `1.5px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{activeConv.userName}</div>
              <div style={{ fontSize: 9, color: activeConv.isOnline ? "#00FF88" : "rgba(255,255,255,0.25)" }}>
                {activeConv.isOnline ? "● Online" : "○ Offline"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" title="Voice call" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>🎙️</button>
              <button type="button" title="Video call" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>📹</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: accent }}>MESSAGES</div>
              {totalUnread > 0 && (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{totalUnread} unread</div>
              )}
            </div>
            <button type="button" title="New message" style={{ background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 800, color: accent }}>
              + New
            </button>
            {onClose && (
              <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
            )}
          </>
        )}
      </div>

      {/* Conversation list */}
      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              No conversations yet.<br />
              <span style={{ fontSize: 11 }}>Search for a performer or fan to start chatting.</span>
            </div>
          ) : conversations.map((c, i) => (
            <div
              key={c.userId}
              onClick={() => void openConversation(c)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                borderBottom: i < conversations.length - 1 ? `1px solid ${BORDER}` : "none",
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <div style={{ position: "relative" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.avatarColor ?? "rgba(255,255,255,0.08)", border: `1.5px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                {c.isOnline && <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#00FF88", border: "1.5px solid #05060f" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.userName}</span>
                  {c.lastTime && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{formatTime(c.lastTime)}</span>}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.lastMessage ?? "Start a conversation"}
                </div>
              </div>
              {(c.unreadCount ?? 0) > 0 && (
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>
                  {c.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat view */}
      {view === "chat" && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m) => {
              const isMe = m.fromId === currentUserId;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "75%", padding: "8px 12px", borderRadius: isMe ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    background: isMe ? `${accent}22` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isMe ? accent + "33" : "rgba(255,255,255,0.08)"}`,
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, background: PANEL_BG, flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              style={{ flex: 1, padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit" }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!draft.trim() || sending}
              style={{ padding: "9px 14px", background: draft.trim() ? accent : "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, cursor: draft.trim() ? "pointer" : "not-allowed", fontSize: 14, opacity: sending ? 0.6 : 1, transition: "background 0.2s" }}
            >
              ↑
            </button>
          </div>
        </>
      )}
    </div>
  );
}
