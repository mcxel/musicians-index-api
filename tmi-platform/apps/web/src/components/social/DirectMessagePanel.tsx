"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AgePolicyGateModal, {
  clearMessagingPendingIntent,
  gateModeFromCode,
  loadMessagingPendingIntent,
  saveMessagingPendingIntent,
} from "@/components/messaging/AgePolicyGateModal";

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
  threadId?: string;
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

type ApiThread = {
  threadId: string;
  kind?: string;
  participants?: Array<{ userId: string; displayName?: string; role?: string }>;
  lastMessage?: { body?: string; createdAt?: string } | null;
  unreadCount?: number;
  updatedAt?: string;
};

function toTs(value?: string | number | null): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Date.parse(value);
  return Number.isFinite(n) ? n : 0;
}

function peerFromThread(
  thread: ApiThread,
  selfId: string,
): { userId: string; userName: string; userRole: string } {
  const peers = (thread.participants ?? []).filter((p) => p.userId && p.userId !== selfId);
  const peer = peers[0] ?? thread.participants?.[0];
  return {
    userId: peer?.userId ?? thread.threadId,
    userName: peer?.displayName ?? "Conversation",
    userRole: (peer?.role ?? "user").toUpperCase(),
  };
}

function mapThread(thread: ApiThread, selfId: string): Conversation {
  const peer = peerFromThread(thread, selfId);
  return {
    userId: peer.userId,
    userName: peer.userName,
    userRole: peer.userRole,
    threadId: thread.threadId,
    lastMessage: thread.lastMessage?.body ?? undefined,
    lastTime: toTs(thread.lastMessage?.createdAt ?? thread.updatedAt),
    unreadCount: thread.unreadCount ?? 0,
  };
}

async function bootstrapConversation(
  recipientId: string,
  recipientName: string,
  body?: string,
): Promise<{ threadId: string | null; code?: string; error?: string }> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      recipientId,
      recipientName,
      body: body?.trim() || undefined,
      bootstrapOnly: !body?.trim(),
      kind: "fan-fan",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    threadId?: string;
    code?: string;
    error?: string;
    reason?: string;
  };
  if (!res.ok) {
    return { threadId: null, code: data.code, error: data.reason ?? data.error };
  }
  return { threadId: data.threadId ?? null, code: data.code, error: data.error };
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
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");
  const [error, setError] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateCode, setGateCode] = useState<string | undefined>();
  const [gateMessage, setGateMessage] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoOpenedRef = useRef(false);

  const BG = "#05060f";
  const PANEL_BG = "#07081a";
  const BORDER = "rgba(255,255,255,0.07)";

  const openGate = useCallback(
    (
      code?: string,
      msg?: string,
      intent?: { recipientId: string; recipientName?: string; body?: string },
    ) => {
      if (intent) {
        saveMessagingPendingIntent({
          recipientId: intent.recipientId,
          recipientName: intent.recipientName,
          body: intent.body,
          returnPath:
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : undefined,
        });
      }
      setGateCode(code);
      setGateMessage(msg);
      setGateOpen(true);
      setError(msg ?? code ?? "Messaging gate required");
    },
    [],
  );

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { threads?: ApiThread[] };
      const threads = Array.isArray(data.threads) ? data.threads : [];
      const mapped = threads.map((t) => mapThread(t, currentUserId));
      setConversations((prev) => {
        const byUser = new Map(mapped.map((c) => [c.userId, c]));
        for (const seed of prev) {
          if (!byUser.has(seed.userId)) byUser.set(seed.userId, seed);
        }
        for (const seed of initialConversations) {
          if (!byUser.has(seed.userId)) byUser.set(seed.userId, seed);
        }
        return Array.from(byUser.values());
      });
    } catch {
      /* keep existing list */
    }
  }, [currentUserId, initialConversations]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreadMessages = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/messages/${threadId}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      setMessages([]);
      return;
    }
    const data = (await res.json()) as {
      messages?: Array<{
        messageId: string;
        senderId: string;
        senderName: string;
        body: string;
        createdAt: string;
      }>;
    };
    setMessages(
      (data.messages ?? []).map((m) => ({
        id: m.messageId,
        fromId: m.senderId,
        fromName: m.senderName,
        text: m.body,
        timestamp: toTs(m.createdAt),
      })),
    );
  }, []);

  const openConversation = useCallback(
    async (conv: Conversation) => {
      setActiveConv(conv);
      setView("chat");
      setMessages([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);

      let threadId = conv.threadId;
      if (!threadId) {
        const boot = await bootstrapConversation(conv.userId, conv.userName);
        if (!boot.threadId) {
          if (
            boot.code === "AGE_VERIFICATION_REQUIRED" ||
            boot.code === "POLICY_ACCEPTANCE_REQUIRED"
          ) {
            openGate(boot.code, boot.error, {
              recipientId: conv.userId,
              recipientName: conv.userName,
            });
          } else {
            setError(boot.error ?? "Could not start conversation.");
            if (boot.code) openGate(boot.code, boot.error);
          }
          return;
        }
        threadId = boot.threadId;
        const withThread = { ...conv, threadId };
        setActiveConv(withThread);
        setConversations((cs) =>
          cs.map((c) => (c.userId === conv.userId ? { ...c, threadId } : c)),
        );
      }

      try {
        await loadThreadMessages(threadId);
        setConversations((cs) =>
          cs.map((c) => (c.userId === conv.userId ? { ...c, unreadCount: 0, threadId } : c)),
        );
      } catch {
        setMessages([]);
      }
    },
    [loadThreadMessages, openGate],
  );

  useEffect(() => {
    if (autoOpenedRef.current) return;
    const seed = initialConversations[0];
    if (!seed?.userId) return;
    autoOpenedRef.current = true;
    void openConversation(seed);
  }, [initialConversations, openConversation]);

  const resumeAfterGate = useCallback(async () => {
    setGateOpen(false);
    const pending = loadMessagingPendingIntent();
    clearMessagingPendingIntent();
    if (!pending?.recipientId) return;

    setSending(true);
    setError(null);
    try {
      const boot = await bootstrapConversation(
        pending.recipientId,
        pending.recipientName ?? pending.recipientId,
        pending.body,
      );
      if (!boot.threadId) {
        if (
          boot.code === "AGE_VERIFICATION_REQUIRED" ||
          boot.code === "POLICY_ACCEPTANCE_REQUIRED"
        ) {
          openGate(boot.code, boot.error, pending);
        } else {
          setError(boot.error ?? "Could not start conversation.");
          if (boot.code) openGate(boot.code, boot.error);
        }
        return;
      }

      const conv: Conversation = {
        userId: pending.recipientId,
        userName: pending.recipientName ?? pending.recipientId,
        userRole: "FAN",
        threadId: boot.threadId,
        lastMessage: pending.body,
      };
      setConversations((cs) => {
        const rest = cs.filter((c) => c.userId !== conv.userId);
        return [conv, ...rest];
      });
      setActiveConv(conv);
      setView("chat");
      if (pending.body?.trim()) setDraft("");
      await loadThreadMessages(boot.threadId);
      await loadInbox();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [loadInbox, loadThreadMessages, openGate]);

  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !activeConv || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    setError(null);

    const optimistic: DMessage = {
      id: `opt-${Date.now()}`,
      fromId: currentUserId,
      fromName: currentUserName,
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      if (activeConv.threadId) {
        const res = await fetch(`/api/messages/${activeConv.threadId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ body: text, type: "text" }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          code?: string;
          error?: string;
          reason?: string;
        };
        if (!res.ok) {
          setMessages((m) => m.filter((x) => x.id !== optimistic.id));
          setDraft(text);
          if (
            data.code === "AGE_VERIFICATION_REQUIRED" ||
            data.code === "POLICY_ACCEPTANCE_REQUIRED"
          ) {
            openGate(data.code, data.reason ?? data.error, {
              recipientId: activeConv.userId,
              recipientName: activeConv.userName,
              body: text,
            });
          } else {
            setError(data.reason ?? data.error ?? "Failed to send message.");
          }
          return;
        }
        await loadThreadMessages(activeConv.threadId);
        return;
      }

      const boot = await bootstrapConversation(activeConv.userId, activeConv.userName, text);
      if (!boot.threadId) {
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        setDraft(text);
        if (
          boot.code === "AGE_VERIFICATION_REQUIRED" ||
          boot.code === "POLICY_ACCEPTANCE_REQUIRED"
        ) {
          openGate(boot.code, boot.error, {
            recipientId: activeConv.userId,
            recipientName: activeConv.userName,
            body: text,
          });
        } else {
          setError(boot.error ?? "Could not start conversation.");
          if (boot.code) openGate(boot.code, boot.error);
        }
        return;
      }

      const withThread = { ...activeConv, threadId: boot.threadId, lastMessage: text };
      setActiveConv(withThread);
      setConversations((cs) =>
        cs.map((c) => (c.userId === activeConv.userId ? withThread : c)),
      );
      await loadThreadMessages(boot.threadId);
    } catch {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setDraft(text);
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [draft, activeConv, sending, currentUserId, currentUserName, loadThreadMessages, openGate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 14px",
          borderBottom: `1px solid ${BORDER}`,
          gap: 8,
          background: PANEL_BG,
          flexShrink: 0,
        }}
      >
        {view === "chat" && activeConv ? (
          <>
            <button
              type="button"
              onClick={() => setView("list")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 16,
                padding: 0,
                marginRight: 4,
              }}
            >
              ←
            </button>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: activeConv.avatarColor ?? `${accent}22`,
                border: `1.5px solid ${accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{activeConv.userName}</div>
              <div
                style={{
                  fontSize: 9,
                  color: activeConv.isOnline ? "#00FF88" : "rgba(255,255,255,0.25)",
                }}
              >
                {activeConv.isOnline ? "● Online" : "○ Offline"}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: accent }}>
                MESSAGES
              </div>
              {totalUnread > 0 && (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                  {totalUnread} unread
                </div>
              )}
            </div>
            <a
              href="/messages/new"
              title="New message"
              style={{
                background: `${accent}22`,
                border: `1px solid ${accent}44`,
                borderRadius: 7,
                padding: "5px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 800,
                color: accent,
                textDecoration: "none",
              }}
            >
              + New
            </a>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: 11,
            color: "#fca5a5",
            background: "rgba(252,165,165,0.08)",
            borderBottom: "1px solid rgba(252,165,165,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              No conversations yet.
              <br />
              <a href="/messages/new" style={{ fontSize: 11, color: accent }}>
                Start a conversation
              </a>
            </div>
          ) : (
            conversations.map((c, i) => (
              <div
                key={c.threadId ?? c.userId}
                onClick={() => void openConversation(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderBottom: i < conversations.length - 1 ? `1px solid ${BORDER}` : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: c.avatarColor ?? "rgba(255,255,255,0.08)",
                      border: "1.5px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    👤
                  </div>
                  {c.isOnline && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#00FF88",
                        border: "1.5px solid #05060f",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.userName}</span>
                    {c.lastTime ? (
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                        {formatTime(c.lastTime)}
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.lastMessage ?? "Start a conversation"}
                  </div>
                </div>
                {(c.unreadCount ?? 0) > 0 && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {c.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {view === "chat" && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 24 }}>
                No messages yet.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.fromId === currentUserId;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "8px 12px",
                        borderRadius: isMe ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                        background: isMe ? `${accent}22` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isMe ? accent + "33" : "rgba(255,255,255,0.08)"}`,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      <div>{m.text}</div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.25)",
                          marginTop: 4,
                          textAlign: isMe ? "right" : "left",
                        }}
                      >
                        {formatTime(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              gap: 8,
              background: PANEL_BG,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              style={{
                flex: 1,
                padding: "9px 12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: "#fff",
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!draft.trim() || sending}
              style={{
                padding: "9px 14px",
                background: draft.trim() ? accent : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 8,
                cursor: draft.trim() ? "pointer" : "not-allowed",
                fontSize: 14,
                opacity: sending ? 0.6 : 1,
                transition: "background 0.2s",
              }}
            >
              ↑
            </button>
          </div>
        </>
      )}

      <AgePolicyGateModal
        open={gateOpen}
        mode={gateModeFromCode(gateCode)}
        code={gateCode}
        message={gateMessage}
        onClose={() => setGateOpen(false)}
        onComplete={() => void resumeAfterGate()}
      />
    </div>
  );
}
