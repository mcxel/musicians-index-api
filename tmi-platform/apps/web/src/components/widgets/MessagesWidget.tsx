"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { peerThreadParticipant } from "@/lib/messaging/threadPeerParticipant";

interface ConversationPreview {
  id: string;
  name: string;
  role: string;
  icon: string;
  accentColor: string;
  avatarUrl?: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
}

type LoadState = "loading" | "ready" | "error" | "unauthenticated";

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
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h`;
  return `${Math.floor(d / 86_400_000)}d`;
}

function roleColor(role: string): string {
  const r = role.toUpperCase();
  if (r === "ARTIST" || r === "PERFORMER") return "#AA2DFF";
  if (r === "PRODUCER") return "#FFD700";
  if (r === "SPONSOR") return "#FFD700";
  if (r === "VENUE") return "#00FF88";
  if (r === "PROMOTER") return "#00FF88";
  if (r === "ADMIN") return "#FF2DAA";
  return "#00FFFF";
}

function roleIcon(role: string): string {
  const r = role.toUpperCase();
  if (r === "ARTIST" || r === "PERFORMER") return "🎵";
  if (r === "PRODUCER") return "🎹";
  if (r === "SPONSOR") return "⭐";
  if (r === "VENUE") return "🏟";
  if (r === "PROMOTER") return "📣";
  return "💬";
}

const AVATAR_FALLBACK = "/images/tmi-placeholder.jpg";

export default function MessagesWidget() {
  const [search, setSearch] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      try {
        const sessionRes = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });
        if (!sessionRes.ok) {
          if (!cancelled) {
            setConversations([]);
            setLoadState("unauthenticated");
          }
          return;
        }
        const session = (await sessionRes.json()) as {
          authenticated?: boolean;
          user?: { id?: string };
        };
        if (!session.authenticated || !session.user?.id) {
          if (!cancelled) {
            setConversations([]);
            setLoadState("unauthenticated");
          }
          return;
        }
        const selfId = session.user.id;

        const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) {
            setConversations([]);
            setLoadState("unauthenticated");
          }
          return;
        }
        if (!res.ok) {
          if (!cancelled) {
            setConversations([]);
            setLoadState("error");
          }
          return;
        }

        const data = (await res.json()) as { threads?: Record<string, unknown>[] };
        if (!Array.isArray(data.threads)) {
          if (!cancelled) {
            setConversations([]);
            setLoadState("error");
          }
          return;
        }

        const mapped: ConversationPreview[] = data.threads.map((t) => {
          const participants =
            (t.participants as {
              userId: string;
              displayName: string;
              avatarUrl: string;
              role: string;
            }[]) ?? [];
          const lastMsg = t.lastMessage as { body?: string; createdAt?: string | number } | null;
          const other = peerThreadParticipant(participants, selfId);
          const role = (other?.role ?? "user").toUpperCase();
          const name =
            other?.displayName ??
            participants.map((p) => p.displayName).filter(Boolean).join(", ") ??
            "Conversation";
          return {
            id: t.threadId as string,
            name,
            role,
            icon: roleIcon(role),
            accentColor: roleColor(role),
            avatarUrl: other?.avatarUrl?.trim() || undefined,
            lastMessage: lastMsg?.body?.trim() || "No messages yet",
            timeAgo: fmt(toTs(lastMsg?.createdAt ?? t.updatedAt)),
            unread: (t.unreadCount as number) ?? 0,
          };
        });

        mapped.sort((a, b) => {
          const ta = data.threads!.find((x) => x.threadId === a.id);
          const tb = data.threads!.find((x) => x.threadId === b.id);
          return toTs(tb?.updatedAt) - toTs(ta?.updatedAt);
        });

        if (!cancelled) {
          setConversations(mapped);
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) {
          setConversations([]);
          setLoadState("error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loadState !== "ready"}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 16px",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            opacity: loadState === "ready" ? 1 : 0.6,
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }} className="tmi-scroll">
        {loadState === "loading" && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", padding: "48px 0", fontSize: 13 }}>
            Loading conversations…
          </p>
        )}

        {loadState === "unauthenticated" && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", padding: "48px 16px", fontSize: 13, lineHeight: 1.5 }}>
            Sign in to view your messages.{" "}
            <Link href="/login" style={{ color: "#00FFFF", fontWeight: 700 }}>
              Log in
            </Link>
          </p>
        )}

        {loadState === "error" && (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 12 }}>
              Unable to load messages.
            </p>
            <button
              type="button"
              onClick={retry}
              style={{
                background: "rgba(0,255,255,0.12)",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 8,
                color: "#00FFFF",
                fontSize: 12,
                fontWeight: 700,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loadState === "ready" && conversations.length === 0 && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", padding: "48px 16px", fontSize: 13, lineHeight: 1.5 }}>
            No messages yet. Message someone from their profile to start a thread.
          </p>
        )}

        {loadState === "ready" && conversations.length > 0 && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "48px 0", fontSize: 13 }}>
            No conversations found.
          </p>
        )}

        {loadState === "ready" &&
          filtered.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${encodeURIComponent(conv.id)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 12px",
                background: conv.unread > 0 ? "rgba(0,255,255,0.04)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
                transition: "background 0.15s",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {conv.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conv.avatarUrl}
                    alt=""
                    width={42}
                    height={42}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${conv.accentColor}66`,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = AVATAR_FALLBACK;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: `${conv.accentColor}22`,
                      border: `2px solid ${conv.accentColor}66`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {conv.icon}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontWeight: conv.unread > 0 ? 800 : 600, fontSize: 13, color: "#fff" }}>
                    {conv.name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {conv.timeAgo}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: conv.unread > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conv.lastMessage}
                </div>
              </div>

              {conv.unread > 0 && (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 9,
                    fontWeight: 900,
                    background: "#FF2DAA",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "2px 7px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {conv.unread}
                </span>
              )}
            </Link>
          ))}
      </div>

      {loadState === "ready" && conversations.length > 0 && (
        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            href="/messages"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#00FFFF",
              textDecoration: "none",
              padding: "8px 0",
            }}
          >
            Open full inbox →
          </Link>
        </div>
      )}
    </div>
  );
}
