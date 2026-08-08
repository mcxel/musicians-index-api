"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { senderBubbleStyles, senderColorFor } from "@/lib/messaging/senderColor";
import { peerThreadParticipant } from "@/lib/messaging/threadPeerParticipant";

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
  senderAvatarUrl?: string;
  body: string;
  type: string;
  playlistId?: string;
  trackId?: string;
  mediaUrl?: string;
  callId?: string;
  createdAt: number;
  isOwn?: boolean;
}

type GovernanceContact = {
  userId: string;
  memberId: string;
  displayName: string;
  online: boolean;
};

function toTs(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Date.parse(v);
    return Number.isFinite(n) ? n : Date.now();
  }
  return Date.now();
}

function fmt(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
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

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\/\S+/i.test(s.trim());
}

function looksLikeImageUrl(s: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(s.trim());
}

const AVATAR_FALLBACK = "/images/tmi-placeholder.jpg";

function AvatarThumb({
  avatarUrl,
  accent,
  size = 36,
  emojiFallback = "💬",
}: {
  avatarUrl?: string;
  accent: string;
  size?: number;
  emojiFallback?: string;
}) {
  const src = avatarUrl?.trim();
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${accent}55`,
          flexShrink: 0,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = AVATAR_FALLBACK;
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${accent}18`,
        border: `2px solid ${accent}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.44,
        flexShrink: 0,
      }}
    >
      {emojiFallback}
    </div>
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchThreads(): Promise<ThreadSummary[]> {
  const sessionRes = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
  if (!sessionRes.ok) return [];
  const session = (await sessionRes.json()) as {
    authenticated?: boolean;
    user?: { id?: string };
  };
  if (!session.authenticated || !session.user?.id) return [];
  const selfId = session.user.id;

  const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { threads?: Record<string, unknown>[] };
  if (!Array.isArray(data.threads)) return [];

  return data.threads.map((t) => {
    const participants =
      (t.participants as { userId: string; displayName: string; avatarUrl: string; role: string }[]) ?? [];
    const lastMsg = t.lastMessage as { body?: string; createdAt?: string | number } | null;
    const other = peerThreadParticipant(participants, selfId);
    return {
      threadId: t.threadId as string,
      kind: t.kind as string,
      name:
        other?.displayName ??
        participants.map((p) => p.displayName).filter(Boolean).join(", ") ??
        "Conversation",
      role: (other?.role ?? "user").toUpperCase(),
      lastMessage: lastMsg?.body ?? "",
      lastMessageAt: toTs(lastMsg?.createdAt ?? t.updatedAt),
      unread: (t.unreadCount as number) ?? 0,
      participants,
    };
  });
}

async function fetchMessages(threadId: string): Promise<ThreadMessage[]> {
  const res = await fetch(`/api/messages/${threadId}`, { credentials: "include", cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { messages?: Record<string, unknown>[] };
  if (!Array.isArray(data.messages)) return [];
  return data.messages.map((m) => ({
    messageId: m.messageId as string,
    senderId: m.senderId as string,
    senderName: m.senderName as string,
    body: m.body as string,
    type: (m.type as string) ?? "text",
    playlistId: typeof m.playlistId === "string" ? m.playlistId : undefined,
    trackId: typeof m.trackId === "string" ? m.trackId : undefined,
    mediaUrl: typeof m.mediaUrl === "string" ? m.mediaUrl : undefined,
    callId: typeof m.callId === "string" ? m.callId : undefined,
    createdAt: toTs(m.createdAt),
    isOwn: (m.isOwn as boolean) ?? false,
  }));
}

async function sendToThread(
  threadId: string,
  body: string,
  opts?: { type?: string; mediaUrl?: string; callId?: string },
): Promise<boolean> {
  const res = await fetch(`/api/messages/${threadId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      body,
      type: opts?.type ?? "text",
      mediaUrl: opts?.mediaUrl,
      callId: opts?.callId,
    }),
  });
  return res.ok;
}

async function createThread(
  recipientId: string,
  recipientName: string,
  body: string,
  opts?: { type?: string; mediaUrl?: string; callId?: string },
): Promise<string | null> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      recipientId,
      recipientName,
      body,
      kind: "fan-fan",
      type: opts?.type ?? "text",
      mediaUrl: opts?.mediaUrl,
      callId: opts?.callId,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { threadId?: string };
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
  const other = thread.participants.find((p) => p.displayName === thread.name) ?? thread.participants[0];
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
      <AvatarThumb avatarUrl={other?.avatarUrl} accent={color} size={36} />
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
  const href = playlistId
    ? `/hub/fan?drawer=playlist&playlistId=${encodeURIComponent(playlistId)}`
    : "/hub/fan?drawer=playlist";
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#AA2DFF", marginBottom: 4 }}>
        PLAYLIST SHARE
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "#F4F7FF", wordBreak: "break-word", marginBottom: 6 }}>
        {msg.body}
      </div>
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

function VideoInviteBubble({
  msg,
  onJoin,
}: {
  msg: ThreadMessage;
  onJoin?: (callId: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF", marginBottom: 4 }}>
        📹 VIDEO CHAT INVITE
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "#F4F7FF", wordBreak: "break-word", marginBottom: 8 }}>
        {msg.body}
      </div>
      {msg.callId ? (
        <button
          type="button"
          onClick={() => onJoin?.(msg.callId!)}
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            borderRadius: 6,
            border: "1px solid rgba(0,255,255,0.55)",
            background: "rgba(0,255,255,0.15)",
            color: "#00FFFF",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          JOIN VIDEO CHAT
        </button>
      ) : (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Invite expired or missing call id.</div>
      )}
    </div>
  );
}

function SharedMediaGrid({ messages }: { messages: ThreadMessage[] }) {
  const shared = messages.filter(
    (m) => m.type === "playlist" || m.type === "image" || m.type === "link" || Boolean(m.playlistId) || Boolean(m.mediaUrl),
  );
  if (shared.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 1.6 }}>
        No shared media in this conversation yet.
      </div>
    );
  }
  return (
    <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
      {shared.map((msg) => {
        const color = senderColorFor(msg.senderId, msg.senderName);
        return (
          <div
            key={msg.messageId}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${color}44`,
              background: `${color}12`,
              color: "#fff",
            }}
          >
            <span style={{ fontSize: 16 }}>
              {msg.type === "image" ? "🖼️" : msg.type === "video_invite" ? "📹" : msg.type === "link" ? "🔗" : "🎵"}
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color }}>
              {msg.senderName}
            </span>
            <span style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {msg.body || "Shared"}
            </span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{fmt(msg.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({
  msg,
  onJoinCall,
}: {
  msg: ThreadMessage;
  onJoinCall?: (callId: string) => void;
}) {
  const isPlaylist = msg.type === "playlist" || Boolean(msg.playlistId);
  const isVideoInvite = msg.type === "video_invite";
  const color = senderColorFor(msg.senderId, msg.senderName);
  const bubble = senderBubbleStyles(color);
  const media = msg.mediaUrl || (looksLikeUrl(msg.body) ? msg.body.trim() : undefined);

  return (
    <div style={{ display: "flex", justifyContent: msg.isOwn ? "flex-end" : "flex-start", marginBottom: 6, gap: 8, alignItems: "flex-end" }}>
      {!msg.isOwn ? <AvatarThumb avatarUrl={msg.senderAvatarUrl} accent={color} size={32} emojiFallback="👤" /> : null}
      <div
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: msg.isOwn ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          background: bubble.background,
          border: bubble.border,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 800, color: bubble.nameColor, marginBottom: 3 }}>
          {msg.isOwn ? "You" : msg.senderName}
        </div>
        {isPlaylist ? (
          <PlaylistShareBubble msg={msg} />
        ) : isVideoInvite ? (
          <VideoInviteBubble msg={msg} onJoin={onJoinCall} />
        ) : (
          <>
            {(msg.type === "image" || (media && looksLikeImageUrl(media))) && media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media}
                alt=""
                style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 6, display: "block" }}
              />
            ) : null}
            <div style={{ fontSize: 13, lineHeight: 1.45, color: bubble.color, wordBreak: "break-word" }}>
              {looksLikeUrl(msg.body) && msg.type !== "image" ? (
                <a href={msg.body.trim()} target="_blank" rel="noreferrer" style={{ color: color, textDecoration: "underline" }}>
                  {msg.body}
                </a>
              ) : (
                msg.body
              )}
            </div>
          </>
        )}
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4, textAlign: msg.isOwn ? "right" : "left" }}>
          {fmt(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Canister ────────────────────────────────────────────────────────────

export interface MessagingCanisterProps {
  recipientId?: string;
  recipientName?: string;
  height?: number | string;
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
  const [attachUrl, setAttachUrl] = useState("");
  const [newTo, setNewTo] = useState("");
  const [contacts, setContacts] = useState<GovernanceContact[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callNote, setCallNote] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadThreads = useCallback(async () => {
    try {
      const fresh = await fetchThreads();
      setThreads(fresh);
      if (recipientId && !activeThreadId) {
        const match = fresh.find((t) => t.participants.some((p) => p.userId === recipientId));
        if (match) setActiveThreadId(match.threadId);
      }
    } catch {
      /* keep */
    } finally {
      setLoadingThreads(false);
    }
  }, [recipientId, activeThreadId]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    fetch("/api/admin/observatory-call", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { contacts?: GovernanceContact[] } | null) => {
        if (d?.contacts) setContacts(d.contacts);
      })
      .catch(() => {});
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await fetchMessages(threadId);
      const thread = threads.find((t) => t.threadId === threadId);
      const avatars: Record<string, string> = {};
      for (const p of thread?.participants ?? []) {
        if (p.userId && p.avatarUrl) avatars[p.userId] = p.avatarUrl;
      }
      setMessages(
        msgs.map((m) => ({
          ...m,
          senderAvatarUrl: avatars[m.senderId],
        })),
      );
    } catch {
      /* keep */
    } finally {
      setLoadingMessages(false);
    }
  }, [threads]);

  useEffect(() => {
    setActiveTab("chat");
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    void loadMessages(activeThreadId);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      void loadMessages(activeThreadId);
    }, 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeThreadId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function detectPayload(text: string, urlField: string): { type: string; body: string; mediaUrl?: string } {
    const url = urlField.trim() || (looksLikeUrl(text) ? text.trim() : "");
    if (url && looksLikeImageUrl(url)) {
      return { type: "image", body: text.trim() || "Image", mediaUrl: url };
    }
    if (url && looksLikeUrl(url)) {
      return { type: "link", body: text.trim() || url, mediaUrl: url };
    }
    return { type: "text", body: text.trim() };
  }

  async function handleSend() {
    const text = input.trim();
    if ((!text && !attachUrl.trim()) || sending) return;
    setError(null);
    setSending(true);
    const payload = detectPayload(text || attachUrl, attachUrl);

    try {
      if (activeThreadId) {
        const ok = await sendToThread(activeThreadId, payload.body, {
          type: payload.type,
          mediaUrl: payload.mediaUrl,
        });
        if (ok) {
          setInput("");
          setAttachUrl("");
          setMessages((prev) => [
            ...prev,
            {
              messageId: `opt-${Date.now()}`,
              senderId: "me",
              senderName: "You",
              body: payload.body,
              type: payload.type,
              mediaUrl: payload.mediaUrl,
              createdAt: Date.now(),
              isOwn: true,
            },
          ]);
          void loadMessages(activeThreadId);
        } else {
          setError("Failed to send message. Please try again.");
        }
      } else if (recipientId) {
        const threadId = await createThread(recipientId, recipientName ?? recipientId, payload.body, {
          type: payload.type,
          mediaUrl: payload.mediaUrl,
        });
        if (threadId) {
          setInput("");
          setAttachUrl("");
          setActiveThreadId(threadId);
          await loadThreads();
        } else {
          setError("Could not start conversation. Please try again.");
        }
      } else {
        const to = newTo.trim();
        if (!to) {
          setError("Enter a username, email, or pick Marcel / Justin / Jay Paul.");
          return;
        }
        const threadId = await createThread(to, to, payload.body, {
          type: payload.type,
          mediaUrl: payload.mediaUrl,
        });
        if (threadId) {
          setInput("");
          setAttachUrl("");
          setNewTo("");
          setActiveThreadId(threadId);
          await loadThreads();
        } else {
          setError("Could not start conversation. Recipient not found.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function inviteVideoChat() {
    const active = threads.find((t) => t.threadId === activeThreadId);
    const ownIds = new Set(
      messages.filter((m) => m.isOwn).map((m) => m.senderId).filter((id) => id && id !== "me"),
    );
    const peer =
      active?.participants.find((p) => p.userId && !ownIds.has(p.userId)) ??
      active?.participants.find((p) => p.userId) ??
      (recipientId ? { userId: recipientId, displayName: recipientName ?? recipientId } : null);

    if (!peer?.userId) {
      setError("Open a 1:1 thread first, then invite to video chat.");
      return;
    }

    setCallNote(null);
    setSending(true);
    try {
      const callRes = await fetch("/api/admin/observatory-call", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          calleeId: peer.userId,
          calleeName: peer.displayName,
          threadId: activeThreadId ?? undefined,
        }),
      });
      const callData = (await callRes.json()) as {
        call?: { callId: string; status: string };
        calleeOnline?: boolean;
        error?: string;
      };
      if (!callRes.ok || !callData.call) {
        setError(callData.error ?? "Could not create video invite.");
        return;
      }

      const inviteBody =
        callData.call.status === "offline" || callData.calleeOnline === false
          ? `📹 Video chat invite — ${peer.displayName} appears offline. Open Observatory video when available.`
          : `📹 Video chat invite — join Observatory video chat now.`;

      if (activeThreadId) {
        await sendToThread(activeThreadId, inviteBody, {
          type: "video_invite",
          callId: callData.call.callId,
        });
        await loadMessages(activeThreadId);
      } else if (recipientId) {
        const tid = await createThread(recipientId, recipientName ?? recipientId, inviteBody, {
          type: "video_invite",
          callId: callData.call.callId,
        });
        if (tid) setActiveThreadId(tid);
      }

      setCallNote(
        callData.calleeOnline === false
          ? "Invite sent. Callee offline — honest waiting state."
          : "Invite sent. Use OBS VIDEO panel to connect when they accept.",
      );
    } catch {
      setError("Could not send video invite.");
    } finally {
      setSending(false);
    }
  }

  async function joinVideoInvite(callId: string) {
    setCallNote("Accepting invite…");
    const res = await fetch("/api/admin/observatory-call", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", callId, status: "accepted" }),
    });
    if (res.ok) {
      setCallNote("Accepted — open OBS VIDEO (bottom-right) to see the call.");
      window.dispatchEvent(new CustomEvent("tmi:observatory-call-accept", { detail: { callId } }));
    } else {
      setCallNote("Could not join — call may have ended.");
    }
  }

  const activeThread = threads.find((t) => t.threadId === activeThreadId);
  const activeName = activeThread?.name ?? recipientName ?? "New Conversation";
  const activeRole = activeThread?.role ?? "";
  const showSidebar = !compact && !recipientId;

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

  return (
    <div style={panelStyle}>
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
          <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>
              MESSAGES
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {loadingThreads && (
              <div style={{ padding: "16px 4px", fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
                Loading messages…
              </div>
            )}
            {!loadingThreads && threads.length === 0 && (
              <div style={{ padding: "24px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>No messages yet.</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {threads.map((t) => (
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
                <button
                  type="button"
                  onClick={() => void inviteVideoChat()}
                  title="Invite to Observatory video chat"
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    padding: "4px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: "1px solid rgba(0,255,255,0.45)",
                    background: "rgba(0,255,255,0.1)",
                    color: "#00FFFF",
                  }}
                >
                  📹 VIDEO
                </button>
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

        {!activeThreadId && !recipientId && activeTab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.6 }}>
              {threads.length > 0
                ? "Select a conversation, or start a new thread below."
                : "No messages yet. Start a thread below — community messaging is always on."}
            </div>
            {contacts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 }}>
                {contacts.map((c) => (
                  <button
                    key={c.userId}
                    type="button"
                    onClick={() => {
                      setNewTo(c.userId);
                      setActiveThreadId(null);
                    }}
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "5px 10px",
                      borderRadius: 999,
                      border: `1px solid ${senderColorFor(c.userId, c.displayName)}66`,
                      background: `${senderColorFor(c.userId, c.displayName)}18`,
                      color: senderColorFor(c.userId, c.displayName),
                      cursor: "pointer",
                    }}
                  >
                    {c.online ? "● " : "○ "}
                    {c.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeThreadId && activeTab === "media" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <SharedMediaGrid messages={messages} />
          </div>
        )}

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
                <br />
                Send the first message below.
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.messageId} msg={msg} onJoinCall={(id) => void joinVideoInvite(id)} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {activeTab === "chat" && (
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            {!activeThreadId && !recipientId && (
              <>
                <input
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="To: email, display name, or user id"
                  style={{
                    width: "100%",
                    marginBottom: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(0,255,255,0.22)",
                    borderRadius: 8,
                    padding: "7px 10px",
                    color: "#fff",
                    fontSize: 11,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {contacts.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {contacts.map((c) => (
                      <button
                        key={c.userId}
                        type="button"
                        onClick={() => setNewTo(c.userId)}
                        style={{
                          fontSize: 8,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,215,0,0.35)",
                          background: newTo === c.userId ? "rgba(255,215,0,0.2)" : "transparent",
                          color: "#FFD700",
                          cursor: "pointer",
                        }}
                      >
                        {c.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {error && (
              <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(252,165,165,0.08)" }}>
                {error}
              </div>
            )}
            {callNote && (
              <div style={{ fontSize: 10, color: "#67e8f9", marginBottom: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(0,255,255,0.08)" }}>
                {callNote}
              </div>
            )}
            <input
              value={attachUrl}
              onChange={(e) => setAttachUrl(e.target.value)}
              placeholder="Optional: image or link URL"
              style={{
                width: "100%",
                marginBottom: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 10px",
                color: "#fff",
                fontSize: 11,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={
                  activeThreadId || recipientId
                    ? `Message ${activeName}…`
                    : "Write a message to start a thread…"
                }
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
                type="button"
                onClick={() => void handleSend()}
                disabled={(!input.trim() && !attachUrl.trim()) || sending}
                style={{
                  padding: "8px 16px",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  borderRadius: 8,
                  border: "none",
                  flexShrink: 0,
                  color: (input.trim() || attachUrl.trim()) && !sending ? "#050510" : "rgba(255,255,255,0.25)",
                  background:
                    (input.trim() || attachUrl.trim()) && !sending
                      ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)"
                      : "rgba(255,255,255,0.06)",
                  cursor: (input.trim() || attachUrl.trim()) && !sending ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                {sending ? "…" : activeThreadId || recipientId ? "SEND" : "START"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
