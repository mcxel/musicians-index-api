"use client";

import { useState, useEffect, useRef } from "react";
import {
  messageThreadEngine,
  type MessageThread,
  type ThreadMessage,
  type ThreadParticipant,
} from "@/lib/messaging/MessageThreadEngine";
import "@/styles/tmiTypography.css";

interface InboxPanelProps {
  currentUser: ThreadParticipant;
  /** Optional: pre-open thread with a specific user */
  openWithUser?: ThreadParticipant;
}

const ROLE_COLORS: Record<string, string> = {
  artist: "#FF2DAA",
  sponsor: "#FFD700",
  fan: "#00FFFF",
  admin: "#AA2DFF",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPanel({ currentUser, openWithUser }: InboxPanelProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Refresh threads
  const refreshThreads = () => {
    setThreads(messageThreadEngine.getUserThreads(currentUser.userId));
  };

  useEffect(() => {
    refreshThreads();
    // Poll every 2s for new messages (real-time would use WebSocket)
    const interval = setInterval(refreshThreads, 2000);
    return () => clearInterval(interval);
  }, [currentUser.userId]);

  useEffect(() => {
    // Auto-open thread with openWithUser if provided
    if (openWithUser) {
      const thread = messageThreadEngine.getOrCreateThread(
        currentUser,
        openWithUser,
        currentUser.role === "artist" || openWithUser.role === "artist"
          ? "fan-artist"
          : "fan-fan"
      );
      setActiveThread(thread);
      refreshThreads();
    }
  }, [openWithUser?.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeThread) {
      messageThreadEngine.markRead(activeThread.threadId, currentUser.userId);
    }
  }, [activeThread?.messages.length]);

  const sendDraft = () => {
    if (!activeThread || !draft.trim()) return;
    messageThreadEngine.sendMessage({
      threadId: activeThread.threadId,
      senderId: currentUser.userId,
      senderName: currentUser.displayName,
      body: draft.trim(),
    });
    setDraft("");
    refreshThreads();
    // Refresh active thread
    const updated = messageThreadEngine.getThread(activeThread.threadId);
    if (updated) setActiveThread({ ...updated });
  };

  const unread = messageThreadEngine.getUnreadCount(currentUser.userId);

  const otherParticipant = (thread: MessageThread): ThreadParticipant => {
    return thread.participants.find((p) => p.userId !== currentUser.userId) ?? thread.participants[0];
  };

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
      {/* Thread list */}
      <div
        style={{
          borderRight: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span className="tmi-hud-label" style={{ fontSize: 8, color: "#00FFFF" }}>
            MESSAGES
          </span>
          {unread > 0 && (
            <span
              className="tmi-counter"
              style={{
                fontSize: 8,
                background: "#FF2DAA",
                color: "#fff",
                borderRadius: 10,
                padding: "2px 6px",
              }}
            >
              {unread}
            </span>
          )}
        </div>

        {threads.length === 0 ? (
          <div
            className="tmi-body-copy"
            style={{
              padding: 16,
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            No conversations yet.
          </div>
        ) : (
          threads.map((thread) => {
            const other = otherParticipant(thread);
            const lastMsg = thread.lastMessage;
            const hasUnread =
              lastMsg &&
              !lastMsg.readBy.has(currentUser.userId) &&
              lastMsg.senderId !== currentUser.userId;
            const accent = ROLE_COLORS[other.role] ?? "#00FFFF";

            return (
              <button
                key={thread.threadId}
                onClick={() => {
                  setActiveThread({ ...thread });
                  messageThreadEngine.markRead(thread.threadId, currentUser.userId);
                  refreshThreads();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background:
                    activeThread?.threadId === thread.threadId
                      ? "rgba(0,255,255,0.07)"
                      : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `url('${other.avatarUrl}') center/cover, ${accent}33`,
                    border: `1px solid ${accent}44`,
                    flexShrink: 0,
                    backgroundColor: "#1a1a2e",
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    className="tmi-hud-label"
                    style={{
                      fontSize: 8,
                      color: hasUnread ? "#fff" : "rgba(255,255,255,0.6)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {other.displayName}
                  </div>
                  {lastMsg && (
                    <div
                      className="tmi-body-copy"
                      style={{
                        fontSize: 8,
                        color: "rgba(255,255,255,0.35)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: 2,
                      }}
                    >
                      {lastMsg.deletedAt ? "[deleted]" : lastMsg.body.slice(0, 40)}
                    </div>
                  )}
                </div>
                {lastMsg && (
                  <div
                    className="tmi-body-copy"
                    style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}
                  >
                    {formatTime(lastMsg.createdAt)}
                  </div>
                )}
                {hasUnread && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: accent,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Message pane */}
      {activeThread ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Thread header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {(() => {
              const other = otherParticipant(activeThread);
              const accent = ROLE_COLORS[other.role] ?? "#00FFFF";
              return (
                <>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `url('${other.avatarUrl}') center/cover`,
                      border: `1px solid ${accent}55`,
                      backgroundColor: "#1a1a2e",
                    }}
                  />
                  <div>
                    <div className="tmi-hud-label" style={{ fontSize: 8, color: accent }}>
                      {other.displayName}
                    </div>
                    <div
                      className="tmi-body-copy"
                      style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}
                    >
                      {other.role} · {activeThread.kind}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {activeThread.messages
              .filter((m) => !m.deletedAt)
              .map((msg) => {
                const isMe = msg.senderId === currentUser.userId;
                const isTip = msg.type === "tip";
                return (
                  <div
                    key={msg.messageId}
                    style={{
                      display: "flex",
                      flexDirection: isMe ? "row-reverse" : "row",
                      gap: 8,
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "72%",
                        background: isMe
                          ? "rgba(0,255,255,0.12)"
                          : isTip
                          ? "rgba(255,215,0,0.15)"
                          : "rgba(255,255,255,0.06)",
                        border: isMe
                          ? "1px solid rgba(0,255,255,0.25)"
                          : isTip
                          ? "1px solid rgba(255,215,0,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        padding: "8px 12px",
                      }}
                    >
                      {isTip && msg.valueUsdCents && (
                        <div
                          className="tmi-counter"
                          style={{ fontSize: 10, color: "#FFD700", marginBottom: 4 }}
                        >
                          💰 ${(msg.valueUsdCents / 100).toFixed(2)} TIP
                        </div>
                      )}
                      <div
                        className="tmi-body-copy"
                        style={{ fontSize: 10, color: isMe ? "#e0f7fa" : "rgba(255,255,255,0.8)", lineHeight: 1.4 }}
                      >
                        {msg.body}
                      </div>
                      <div
                        className="tmi-body-copy"
                        style={{
                          fontSize: 7,
                          color: "rgba(255,255,255,0.2)",
                          marginTop: 4,
                          textAlign: isMe ? "right" : "left",
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendDraft();
                }
              }}
              placeholder="Send a message..."
              maxLength={500}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 11,
                outline: "none",
              }}
            />
            <button
              onClick={sendDraft}
              disabled={!draft.trim()}
              className="tmi-button-text"
              style={{
                padding: "8px 16px",
                fontSize: 9,
                borderRadius: 8,
                background: draft.trim() ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${draft.trim() ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: draft.trim() ? "#00FFFF" : "rgba(255,255,255,0.2)",
                cursor: draft.trim() ? "pointer" : "default",
              }}
            >
              SEND
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ fontSize: 32 }}>💬</div>
          <span className="tmi-body-copy" style={{ fontSize: 11 }}>
            Select a conversation
          </span>
        </div>
      )}
    </div>
  );
}
