"use client";

/**
 * InboxPanel — Prisma-backed DMs via /api/messages (not in-memory MessageThreadEngine).
 * Concurrent multi-user safe: each session uses real user ids from auth.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { senderBubbleStyles, senderColorFor } from "@/lib/messaging/senderColor";
import "@/styles/tmiTypography.css";

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

interface ThreadRow {
  threadId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  participants: Participant[];
}

interface MsgRow {
  messageId: string;
  senderId: string;
  senderName: string;
  body: string;
  type: string;
  mediaUrl?: string;
  createdAt: number;
  isOwn: boolean;
}

interface InboxPanelProps {
  currentUser: {
    userId: string;
    displayName: string;
    role: string;
    avatarUrl?: string;
  };
  openWithUser?: {
    userId: string;
    displayName: string;
    role?: string;
  };
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPanel({ currentUser, openWithUser }: InboxPanelProps) {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [draft, setDraft] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshThreads = useCallback(async () => {
    const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      threads?: Array<{
        threadId: string;
        participants?: Participant[];
        lastMessage?: { body?: string; createdAt?: string } | null;
        unreadCount?: number;
        updatedAt?: string;
      }>;
    };
    const rows: ThreadRow[] = (data.threads ?? []).map((t) => {
      const other =
        t.participants?.find((p) => p.userId !== currentUser.userId) ?? t.participants?.[0];
      return {
        threadId: t.threadId,
        name: other?.displayName ?? "Conversation",
        role: (other?.role ?? "fan").toUpperCase(),
        lastMessage: t.lastMessage?.body ?? "",
        lastMessageAt: t.lastMessage?.createdAt ?? t.updatedAt ?? "",
        unread: t.unreadCount ?? 0,
        participants: t.participants ?? [],
      };
    });
    setThreads(rows);
  }, [currentUser.userId]);

  const loadMessages = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/messages/${threadId}`, { credentials: "include", cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      messages?: Array<{
        messageId: string;
        senderId: string;
        senderName: string;
        body: string;
        type?: string;
        mediaUrl?: string;
        createdAt: string;
        isOwn?: boolean;
      }>;
    };
    setMessages(
      (data.messages ?? []).map((m) => ({
        messageId: m.messageId,
        senderId: m.senderId,
        senderName: m.senderName,
        body: m.body,
        type: m.type ?? "text",
        mediaUrl: m.mediaUrl,
        createdAt: Date.parse(m.createdAt) || Date.now(),
        isOwn: m.isOwn ?? m.senderId === currentUser.userId,
      })),
    );
  }, [currentUser.userId]);

  useEffect(() => {
    void refreshThreads();
    const interval = setInterval(() => void refreshThreads(), 4000);
    return () => clearInterval(interval);
  }, [refreshThreads]);

  useEffect(() => {
    if (!openWithUser?.userId) return;
    void (async () => {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: openWithUser.userId }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { threadId?: string };
      if (data.threadId) {
        setActiveThreadId(data.threadId);
        await refreshThreads();
      }
    })();
  }, [openWithUser?.userId, refreshThreads]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeThreadId);
    const t = setInterval(() => void loadMessages(activeThreadId), 4000);
    return () => clearInterval(t);
  }, [activeThreadId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendDraft = async () => {
    if (!activeThreadId || (!draft.trim() && !attachUrl.trim()) || sending) return;
    setSending(true);
    setError(null);
    const url = attachUrl.trim();
    const type = url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url) ? "image" : url ? "link" : "text";
    const body = draft.trim() || url;
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, type, mediaUrl: url || undefined }),
      });
      if (!res.ok) {
        setError("Failed to send.");
        return;
      }
      setDraft("");
      setAttachUrl("");
      await loadMessages(activeThreadId);
      await refreshThreads();
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  };

  const unread = threads.reduce((n, t) => n + t.unread, 0);
  const active = threads.find((t) => t.threadId === activeThreadId);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        height: 480,
        background: "#0a0a1a",
        border: "1px solid rgba(0,255,255,0.15)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto" }}>
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span className="tmi-hud-label" style={{ fontSize: 8, color: "#00FFFF" }}>
            MESSAGES
          </span>
          {unread > 0 && (
            <span style={{ fontSize: 8, background: "#FF2DAA", color: "#fff", borderRadius: 10, padding: "2px 6px" }}>
              {unread}
            </span>
          )}
        </div>
        {threads.length === 0 ? (
          <div style={{ padding: 16, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>No conversations yet.</div>
        ) : (
          threads.map((t) => (
            <button
              key={t.threadId}
              type="button"
              onClick={() => setActiveThreadId(t.threadId)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                background: activeThreadId === t.threadId ? "rgba(0,255,255,0.08)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: senderColorFor(t.participants[0]?.userId, t.name) }}>
                {t.name}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.lastMessage || "—"}
              </div>
            </button>
          ))
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 800 }}>
          {active?.name ?? "Select a conversation"}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {messages.map((m) => {
            const color = senderColorFor(m.senderId, m.senderName);
            const bubble = senderBubbleStyles(color);
            return (
              <div key={m.messageId} style={{ display: "flex", justifyContent: m.isOwn ? "flex-end" : "flex-start", marginBottom: 6 }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: bubble.background,
                    border: bubble.border,
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 800, color: bubble.nameColor, marginBottom: 2 }}>
                    {m.isOwn ? "You" : m.senderName}
                  </div>
                  <div style={{ fontSize: 13, color: bubble.color, wordBreak: "break-word" }}>{m.body}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{formatTime(m.createdAt)}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {error && <div style={{ padding: "0 12px", fontSize: 10, color: "#fca5a5" }}>{error}</div>}
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            value={attachUrl}
            onChange={(e) => setAttachUrl(e.target.value)}
            placeholder="Optional image/link URL"
            style={{
              width: "100%",
              marginBottom: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#fff",
              fontSize: 11,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void sendDraft();
                }
              }}
              placeholder={activeThreadId ? "Type a message…" : "Select a thread first"}
              disabled={!activeThreadId}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 12,
              }}
            />
            <button
              type="button"
              onClick={() => void sendDraft()}
              disabled={!activeThreadId || sending}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
                color: "#050510",
                fontWeight: 900,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
