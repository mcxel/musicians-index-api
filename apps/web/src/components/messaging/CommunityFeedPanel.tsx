"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { senderColorFor, senderBubbleStyles } from "@/lib/messaging/senderColor";
import { gpsDestinationById, gpsDestinationState } from "@/lib/commandCenter/gpsReleaseAllowlist";

type CommunityMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  text: string;
  mine: boolean;
  ts: number;
};

const REPORT_CATEGORIES = ["harassment", "hate_speech", "spam", "other"] as const;

const POLL_MS = 4000;

function CommunityFeedPanelLive() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportOpenFor, setReportOpenFor] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const olderPageBusyRef = useRef(false);
  const pendingScrollAnchorRef = useRef<{ height: number; top: number } | null>(null);
  const lastIdRef = useRef<string | null>(null);
  const prevCountRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const NEAR_BOTTOM_PX = 80;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    setNewMessageCount(0);
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (isNearBottomRef.current) setNewMessageCount(0);
  };

  useLayoutEffect(() => {
    const anchor = pendingScrollAnchorRef.current;
    const container = scrollContainerRef.current;
    if (!anchor || !container) return;
    container.scrollTop = anchor.top + (container.scrollHeight - anchor.height);
    pendingScrollAnchorRef.current = null;
  }, [messages]);

  async function submitReport(messageId: string, category: (typeof REPORT_CATEGORIES)[number]) {
    setReportOpenFor(null);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "message", targetId: messageId, category }),
      });
      setReportedIds((prev) => new Set(prev).add(messageId));
    } catch {
      /* best-effort — reporting failures shouldn't disrupt the feed */
    }
  }

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/community/messages", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError(res.status === 401 ? "Sign in to join the community feed." : "Unable to load messages.");
          return;
        }
        const data = (await res.json()) as { messages: CommunityMessage[]; hasOlder?: boolean };
        if (cancelled) return;
        setError(null);
        setHasOlderMessages(Boolean(data.hasOlder));
        setMessages((current) => {
          const cutoff = Date.now() - 72 * 60 * 60 * 1000;
          const merged = new Map(current.filter((m) => m.ts >= cutoff).map((m) => [m.id, m]));
          for (const message of data.messages ?? []) merged.set(message.id, message);
          return [...merged.values()].sort((a, b) => a.ts - b.ts);
        });
      } catch {
        if (!cancelled) setError("Unable to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function loadOlderMessages() {
    if (olderPageBusyRef.current || !hasOlderMessages || !messages.length) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    olderPageBusyRef.current = true;
    setLoadingOlderMessages(true);
    pendingScrollAnchorRef.current = { height: container.scrollHeight, top: container.scrollTop };
    let prepended = false;
    try {
      const oldestTimestamp = messages[0]!.ts;
      const res = await fetch(`/api/community/messages?before=${oldestTimestamp}&limit=50`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: CommunityMessage[]; hasOlder?: boolean };
      setHasOlderMessages(Boolean(data.hasOlder));
      const older = data.messages ?? [];
      if (older.length === 0) {
        pendingScrollAnchorRef.current = null;
        return;
      }
      prepended = true;
      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));
        const fresh = older.filter((message) => !existingIds.has(message.id));
        return [...fresh, ...current];
      });
    } catch {
      setError("Unable to load older messages.");
    } finally {
      if (!prepended) pendingScrollAnchorRef.current = null;
      olderPageBusyRef.current = false;
      setLoadingOlderMessages(false);
    }
  }

  useEffect(() => {
    const newestId = messages[messages.length - 1]?.id ?? null;
    if (!newestId || newestId === lastIdRef.current) return;
    const isFirstLoad = lastIdRef.current === null;
    const arrivedCount = Math.max(0, messages.length - prevCountRef.current);
    lastIdRef.current = newestId;
    prevCountRef.current = messages.length;
    if (isFirstLoad || isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: isFirstLoad ? "auto" : "smooth", block: "end" });
    } else {
      setNewMessageCount((n) => n + arrivedCount);
    }
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: CommunityMessage; error?: string };
      if (!res.ok || !data.ok || !data.message) {
        setError(data.error ?? "Unable to send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message as CommunityMessage]);
      setInput("");
      isNearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } catch {
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0, flex: 1 }}>
      <div style={{ position: "relative", minHeight: 120, maxHeight: 260, display: "flex" }}>
      <div
        ref={scrollContainerRef}
        onScroll={(event) => {
          handleScroll();
          if (event.currentTarget.scrollTop < 40) void loadOlderMessages();
        }}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "4px 2px",
        }}
      >
        {loadingOlderMessages ? (
          <div role="status" style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Loading older messages…</div>
        ) : null}
        {loading && messages.length === 0 && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 16 }}>
            Loading community feed…
          </div>
        )}
        {!loading && messages.length === 0 && !error && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 16, lineHeight: 1.5 }}>
            No messages yet.
            <br />
            Be the first to say something.
          </div>
        )}
        {messages.map((m) => {
          const color = senderColorFor(m.senderId, m.senderName);
          const bubble = senderBubbleStyles(color);
          const reported = reportedIds.has(m.id);
          return (
            <div key={m.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <Link href={`/p/${encodeURIComponent(m.senderId)}`} style={{ flexShrink: 0 }}>
                {m.senderImage ? (
                  <img
                    src={m.senderImage}
                    alt={m.senderName}
                    style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: `1px solid ${color}88` }}
                  />
                ) : (
                  <div
                    data-community-message-text={m.id}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `${color}33`,
                      border: `1px solid ${color}88`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      color,
                    }}
                  >
                    {m.senderName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <Link
                    href={`/p/${encodeURIComponent(m.senderId)}`}
                    style={{ fontSize: 8, fontWeight: 800, color: bubble.nameColor, letterSpacing: "0.04em", textDecoration: "none" }}
                  >
                    {m.senderName}
                  </Link>
                  {!m.mine && (
                    <button
                      type="button"
                      onClick={() => setReportOpenFor(reportOpenFor === m.id ? null : m.id)}
                      disabled={reported}
                      title="Report this message"
                      style={{
                        fontSize: 8,
                        color: reported ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.3)",
                        background: "none",
                        border: "none",
                        cursor: reported ? "default" : "pointer",
                        padding: 0,
                      }}
                    >
                      {reported ? "reported" : "⚠ report"}
                    </button>
                  )}
                </div>
                {reportOpenFor === m.id && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                    {REPORT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => void submitReport(m.id, cat)}
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 999,
                          border: "1px solid rgba(252,165,165,0.4)",
                          background: "rgba(252,165,165,0.08)",
                          color: "#fca5a5",
                          cursor: "pointer",
                        }}
                      >
                        {cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    color: bubble.color,
                    border: bubble.border,
                    background: bubble.background,
                    borderRadius: 10,
                    padding: "6px 10px",
                    maxWidth: "92%",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                    userSelect: "text",
                    WebkitUserSelect: "text",
                  }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {newMessageCount > 0 && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 9,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,255,255,0.4)",
            background: "rgba(5,5,16,0.92)",
            color: "#00FFFF",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          ↓ {newMessageCount} new message{newMessageCount === 1 ? "" : "s"}
        </button>
      )}
      </div>

      {error && (
        <div style={{ fontSize: 9, color: "#fca5a5", padding: "3px 6px" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Message the community…"
          rows={2}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            padding: "7px 10px",
            color: "#fff",
            fontSize: 11,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!input.trim() || sending}
          style={{
            padding: "7px 12px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.05em",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.4)",
            background: input.trim() && !sending ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.04)",
            color: input.trim() && !sending ? "#00FFFF" : "rgba(255,255,255,0.3)",
            cursor: input.trim() && !sending ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          {sending ? "…" : "SEND"}
        </button>
      </div>
    </div>
  );
}

export default function CommunityFeedPanel() {
  // Release gate: do not mount the feed until community is LIVE.
  if (gpsDestinationState("community") !== "LIVE") {
    const item = gpsDestinationById("community");
    return (
      <div data-testid="gated-community-soon" style={{ padding: 16, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#fff" }}>COMING SOON</div>
        <p style={{ margin: "8px 0 0" }}>{item?.building ?? "We're building community chat."}</p>
      </div>
    );
  }
  return <CommunityFeedPanelLive />;
}
