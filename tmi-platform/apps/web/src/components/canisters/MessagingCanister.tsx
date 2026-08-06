"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThreadSummary {
  threadId: string;
  kind: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageAt: number;
  unread: number;
  participants: { userId: string; displayName: string; avatarUrl: string; role: string }[];
}

interface ThreadMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  body: string;
  type: string;
  playlistId?: string;
  trackId?: string;
  createdAt: number;
  isOwn?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000)    return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

function roleColor(role: string): string {
  if (role === "ARTIST" || role === "PERFORMER") return "#AA2DFF";
  if (role === "SPONSOR") return "#FFD700";
  if (role === "VENUE") return "#00FF88";
  if (role === "PROMOTER") return "#FF6B35";
  if (role === "ADMIN") return "#FF2DAA";
  return "#00FFFF";
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchThreads(): Promise<ThreadSummary[]> {
  const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json() as { threads?: Record<string, unknown>[] };
  if (!Array.isArray(data.threads)) return [];

  return data.threads.map((t) => {
    const participants = (t.participants as { userId: string; displayName: string; avatarUrl: string; role: string }[]) ?? [];
    const lastMsg = t.lastMessage as { body?: string; createdAt?: number } | null;
    const other = participants.length > 1 ? participants.find(p => p.userId !== "") ?? participants[0] : participants[0];
    return {
      threadId: t.threadId as string,
      kind: t.kind as string,
      name: other?.displayName ?? participants.map(p => p.displayName).join(", ") ?? "Unknown",
      role: (other?.role ?? "user").toUpperCase(),
      lastMessage: lastMsg?.body ?? "",
      lastMessageAt: lastMsg?.createdAt ?? (t.updatedAt as number) ?? 0,
      unread: (t.unreadCount as number) ?? 0,
      participants,
    };
  });
}

async function fetchMessages(threadId: string): Promise<ThreadMessage[]> {
  const res = await fetch(`/api/messages/${threadId}`, { credentials: "include", cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json() as { messages?: Record<string, unknown>[] };
  if (!Array.isArray(data.messages)) return [];
  return data.messages.map(m => ({
    messageId: m.messageId as string,
    senderId: m.senderId as string,
    senderName: m.senderName as string,
    body: m.body as string,
    type: (m.type as string) ?? "text",
    playlistId: typeof m.playlistId === "string" ? m.playlistId : undefined,
    trackId: typeof m.trackId === "string" ? m.trackId : undefined,
    createdAt: m.createdAt as number,
    isOwn: (m.isOwn as boolean) ?? false,
  }));
}

async function sendToThread(threadId: string, body: string): Promise<boolean> {
  const res = await fetch(`/api/messages/${threadId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ body, type: "text" }),
  });
  return res.ok;
}

async function createThread(recipientId: string, recipientName: string, body: string): Promise<string | null> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ recipientId, recipientName, body, kind: "fan-fan" }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { threadId?: string };
  return data.threadId ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationRow({
  thread,
  isActive,
  onClick,
}: {
  thread: ThreadSummary;
  isActive: boolean;
  onClick: () => void;
}) {
  const color = roleColor(thread.role);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: isActive ? "rgba(0,255,255,0.07)" : "transparent",
        border: `1px solid ${isActive ? "rgba(0,255,255,0.22)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        color: "#fff",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `${color}18`,
          border: `2px solid ${color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        💬
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {thread.name}
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{fmt(thread.lastMessageAt)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {thread.lastMessage || "No messages yet"}
          </span>
          {thread.unread > 0 && (
            <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 900, background: "#FF2DAA", color: "#fff", borderRadius: 10, padding: "2px 6px" }}>
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function PlaylistShareBubble({ msg }: { msg: ThreadMessage }) {
  const playlistId = msg.playlistId;
  // Hub deep-link opens Playlist drawer; fan hub is the shared consumer path.
  const href = playlistId
    ? `/hub/fan?drawer=playlist&playlistId=${encodeURIComponent(playlistId)}`
    : "/hub/fan?drawer=playlist";
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#AA2DFF", marginBottom: 4 }}>
        PLAYLIST SHARE
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "#fff", wordBreak: "break-word", marginBottom: 6 }}>
        {msg.body}
      </div>
      {playlistId ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "monospace" }}>
          playlistId: {playlistId}
          {msg.trackId ? ` · trackId: ${msg.trackId}` : ""}
        </div>
      ) : null}
      <a
        href={href}
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 800,
          color: "#050510",
          background: "linear-gradient(135deg,#00FFFF,#AA2DFF)",
          borderRadius: 6,
          padding: "6px 10px",
          textDecoration: "none",
        }}
      >
        Open Playlist →
      </a>
    </div>
  );
}

function SharedMediaGrid({ messages }: { messages: ThreadMessage[] }) {
  const shared = messages.filter((m) => m.type === "playlist" || Boolean(m.playlistId));
  if (shared.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 1.6 }}>
        No shared playlists in this conversation yet.
      </div>
    );
  }
  return (
    <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
      {shared.map((msg) => {
        const href = msg.playlistId
          ? `/hub/fan?drawer=playlist&playlistId=${encodeURIComponent(msg.playlistId)}`
          : "/hub/fan?drawer=playlist";
        return (
          <a
            key={msg.messageId}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(170,45,255,0.25)",
              background: "rgba(170,45,255,0.06)",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <span style={{ fontSize: 16 }}>🎵</span>
            <span style={{ fontSize: 10, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {msg.body || "Shared playlist"}
            </span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{fmt(msg.createdAt)} · {msg.senderName}</span>
          </a>
        );
      })}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ThreadMessage }) {
  const isPlaylist = msg.type === "playlist" || Boolean(msg.playlistId);
  return (
    <div style={{ display: "flex", justifyContent: msg.isOwn ? "flex-end" : "flex-start", marginBottom: 6 }}>
      <div
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: msg.isOwn ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          background: msg.isOwn ? "rgba(255,45,170,0.13)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${msg.isOwn ? "rgba(255,45,170,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        {!msg.isOwn && (
          <div style={{ fontSize: 9, fontWeight: 700, color: "#AA2DFF", marginBottom: 3 }}>{msg.senderName}</div>
        )}
        {isPlaylist ? (
          <PlaylistShareBubble msg={msg} />
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.45, color: "#fff", wordBreak: "break-word" }}>{msg.body}</div>
        )}
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: msg.isOwn ? "right" : "left" }}>
          {fmt(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Canister ────────────────────────────────────────────────────────────

export interface MessagingCanisterProps {
  /** Pre-select a recipient (e.g., from a performer profile page) */
  recipientId?: string;
  recipientName?: string;
  /** Height of the canister panel */
  height?: number | string;
  /** Compact mode hides the conversation list sidebar */
  compact?: boolean;
}

export default function MessagingCanister({
  recipientId,
  recipientName,
  height = 480,
  compact = false,
}: MessagingCanisterProps) {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "media">("chat");
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load thread list ─────────────────────────────────────────────────────

  const loadThreads = useCallback(async () => {
    try {
      const fresh = await fetchThreads();
      setThreads(fresh);
      // If recipientId is supplied and we have a matching thread, auto-select it
      if (recipientId && !activeThreadId) {
        const match = fresh.find(t => t.participants.some(p => p.userId === recipientId));
        if (match) setActiveThreadId(match.threadId);
      }
    } catch {
      // network error — keep existing threads
    } finally {
      setLoadingThreads(false);
    }
  }, [recipientId, activeThreadId]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  // ── Load messages for active thread + 5-second poll ──────────────────────

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await fetchMessages(threadId);
      setMessages(msgs);
    } catch {
      // keep existing
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    setActiveTab("chat");
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    void loadMessages(activeThreadId);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => { void loadMessages(activeThreadId); }, 5000);
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [activeThreadId, loadMessages]);

  // ── Auto-scroll to bottom when messages change ───────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ─────────────────────────────────────────────────────────────────

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);

    try {
      if (activeThreadId) {
        // Send to existing thread
        const ok = await sendToThread(activeThreadId, text);
        if (ok) {
          setInput("");
          // Optimistic append
          setMessages(prev => [
            ...prev,
            {
              messageId: `opt-${Date.now()}`,
              senderId: "me",
              senderName: "You",
              body: text,
              type: "text",
              createdAt: Date.now(),
              isOwn: true,
            },
          ]);
        } else {
          setError("Failed to send message. Please try again.");
        }
      } else if (recipientId) {
        // Create new thread
        const threadId = await createThread(recipientId, recipientName ?? recipientId, text);
        if (threadId) {
          setInput("");
          setActiveThreadId(threadId);
          await loadThreads();
        } else {
          setError("Could not start conversation. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // ── Determine active thread metadata ─────────────────────────────────────

  const activeThread = threads.find(t => t.threadId === activeThreadId);
  const activeName = activeThread?.name ?? recipientName ?? "New Conversation";
  const activeRole = activeThread?.role ?? "";

  // ── UI ───────────────────────────────────────────────────────────────────

  const panelStyle: React.CSSProperties = {
    display: "flex",
    background: "#07071a",
    border: "1px solid rgba(0,255,255,0.12)",
    borderRadius: 12,
    overflow: "hidden",
    height,
    fontSize: 13,
    color: "#fff",
    fontFamily: "inherit",
  };

  // In compact mode or when a recipient is pre-set, skip the sidebar
  const showSidebar = !compact && !recipientId;

  return (
    <div style={panelStyle}>
      {/* Sidebar: conversation list */}
      {showSidebar && (
        <div
          style={{
            width: 220,
            borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Sidebar header */}
          <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>MESSAGES</div>
          </div>

          {/* Thread list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {loadingThreads && (
              <div style={{ padding: "16px 4px", fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
                Loading messages…
              </div>
            )}
            {!loadingThreads && threads.length === 0 && (
              <div style={{ padding: "24px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                  No messages yet.
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {threads.map(t => (
                <ConversationRow
                  key={t.threadId}
                  thread={t}
                  isActive={t.threadId === activeThreadId}
                  onClick={() => setActiveThreadId(t.threadId)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main panel: message thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Thread header */}
        {(activeThreadId || recipientId) && (
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            {showSidebar && (
              <button
                onClick={() => setActiveThreadId(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, padding: 0 }}
                title="Back"
              >
                ←
              </button>
            )}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${roleColor(activeRole)}18`,
                border: `2px solid ${roleColor(activeRole)}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              💬
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{activeName}</div>
              {activeRole && (
                <div style={{ fontSize: 9, fontWeight: 700, color: roleColor(activeRole), letterSpacing: "0.1em" }}>
                  {activeRole}
                </div>
              )}
            </div>
            {activeThreadId ? (
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {(["chat", "media"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: activeTab === tab ? "1px solid rgba(170,45,255,0.55)" : "1px solid rgba(255,255,255,0.12)",
                      background: activeTab === tab ? "rgba(170,45,255,0.18)" : "transparent",
                      color: activeTab === tab ? "#c98bff" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {tab === "chat" ? "CHAT" : "SHARED MEDIA"}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* No thread selected + no recipient */}
        {!activeThreadId && !recipientId && !loadingThreads && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.6 }}>
              {threads.length > 0 ? "Select a conversation to start messaging." : "No messages yet.\nSend a message to get started."}
            </div>
          </div>
        )}

        {/* Media list */}
        {activeThreadId && activeTab === "media" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <SharedMediaGrid messages={messages} />
          </div>
        )}

        {/* Message list */}
        {(activeThreadId || recipientId) && activeTab === "chat" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            {loadingMessages && messages.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 16 }}>
                Loading messages…
              </div>
            )}
            {!loadingMessages && messages.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 24, lineHeight: 1.6 }}>
                No messages yet.
                {recipientId && <><br />Send the first message below.</>}
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.messageId} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Compose area */}
        {(activeThreadId || recipientId) && activeTab === "chat" && (
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            {error && (
              <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(252,165,165,0.08)" }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                placeholder={`Message ${activeName}…`}
                rows={2}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
                style={{
                  padding: "8px 16px",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  borderRadius: 8,
                  border: "none",
                  flexShrink: 0,
                  color: input.trim() && !sending ? "#050510" : "rgba(255,255,255,0.25)",
                  background: input.trim() && !sending ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : "rgba(255,255,255,0.06)",
                  cursor: input.trim() && !sending ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                {sending ? "…" : "SEND"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
