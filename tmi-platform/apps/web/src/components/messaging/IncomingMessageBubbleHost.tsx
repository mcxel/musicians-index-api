"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SoundSystemEngine } from "@/lib/sound/SoundSystemEngine";
import { shouldPlayIncomingMessageSound } from "@/lib/messaging/messageAlertPolicy";
import { peerThreadParticipant } from "@/lib/messaging/threadPeerParticipant";

type ThreadRow = {
  threadId: string;
  participants: { userId: string; displayName: string; avatarUrl: string; role: string }[];
  lastMessage: {
    messageId: string;
    senderId: string;
    senderName: string;
    body: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

type ToastItem = {
  id: string;
  threadId: string;
  fromName: string;
  fromAvatarUrl: string;
  preview: string;
  createdAt: number;
};

const PLACEHOLDER = "/images/tmi-placeholder.jpg";

export default function IncomingMessageBubbleHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const selfIdRef = useRef<string | null>(null);
  const lastSeenRef = useRef<Record<string, string>>({});
  const initializedRef = useRef(false);

  const pushToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev.slice(-4), item]);
    window.dispatchEvent(
      new CustomEvent("tmi:incoming-dm", {
        detail: {
          threadId: item.threadId,
          fromName: item.fromName,
          fromAvatarUrl: item.fromAvatarUrl,
          preview: item.preview,
        },
      }),
    );
    if (shouldPlayIncomingMessageSound()) {
      SoundSystemEngine.play("message");
    }
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, 9000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (!sessionRes.ok) return;
        const session = (await sessionRes.json()) as {
          authenticated?: boolean;
          user?: { id?: string };
        };
        if (!session.authenticated || !session.user?.id) return;
        selfIdRef.current = session.user.id;

        const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { threads?: ThreadRow[] };
        if (cancelled || !Array.isArray(data.threads)) return;

        if (!initializedRef.current) {
          for (const thread of data.threads) {
            if (thread.lastMessage) {
              lastSeenRef.current[thread.threadId] = thread.lastMessage.messageId;
            }
          }
          initializedRef.current = true;
          return;
        }

        for (const thread of data.threads) {
          const last = thread.lastMessage;
          if (!last || last.senderId === session.user!.id) {
            if (last) lastSeenRef.current[thread.threadId] = last.messageId;
            continue;
          }
          const prevId = lastSeenRef.current[thread.threadId];
          if (prevId === last.messageId) continue;
          lastSeenRef.current[thread.threadId] = last.messageId;

          if (prevId === undefined && thread.unreadCount === 0) continue;

          const other = peerThreadParticipant(thread.participants, session.user!.id);
          pushToast({
            id: `dm-toast-${last.messageId}`,
            threadId: thread.threadId,
            fromName: other?.displayName ?? last.senderName,
            fromAvatarUrl: other?.avatarUrl?.trim() || PLACEHOLDER,
            preview: last.body.slice(0, 120),
            createdAt: Date.parse(last.createdAt) || Date.now(),
          });
        }
      } catch {
        /* honest skip */
      }
    }

    void poll();
    const id = window.setInterval(() => void poll(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pushToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        right: 16,
        bottom: 88,
        zIndex: 12050,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 320,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <Link
          key={t.id}
          href={`/messages/${encodeURIComponent(t.threadId)}`}
          style={{
            pointerEvents: "auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "10px 12px",
            borderRadius: 14,
            border: "2px solid rgba(0,255,255,0.45)",
            background: "linear-gradient(135deg, rgba(5,5,16,0.94), rgba(20,10,40,0.92))",
            boxShadow: "0 8px 32px rgba(0,255,255,0.2)",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.fromAvatarUrl}
            alt=""
            width={44}
            height={44}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,45,170,0.55)",
              flexShrink: 0,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", color: "#00FFFF", marginBottom: 2 }}>
              NEW MESSAGE
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{t.fromName}</div>
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.82)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {t.preview || "Sent you a message"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
