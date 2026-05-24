"use client";

import { useMemo, useState } from "react";
import VideoRoom from "@/components/video/VideoRoom";

interface LiveRoomWebRTCLayerProps {
  roomId: string;
}

export default function LiveRoomWebRTCLayer({ roomId }: LiveRoomWebRTCLayerProps) {
  const [messages, setMessages] = useState<string[]>([]);

  const roomUrl = useMemo(() => {
    const domain =
      process.env.NEXT_PUBLIC_DAILY_DOMAIN?.replace(/^https?:\/\//, "") ||
      "themusiciansindex.daily.co";
    return `https://${domain}/${encodeURIComponent(roomId)}`;
  }, [roomId]);

  return (
    <section
      style={{
        marginTop: 14,
        marginBottom: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}
      aria-label="Live WebRTC Room Layer"
    >
      <VideoRoom roomUrl={roomUrl} userName="Guest User" />

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: 12,
          background: "rgba(5,5,20,0.75)",
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
          Chat (proof of life)
        </div>
        <div
          style={{
            height: 120,
            overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: 8,
            marginBottom: 8,
            background: "rgba(0,0,0,0.25)",
            fontSize: 12,
          }}
        >
          {messages.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.45)" }}>No messages yet. Say something…</div>
          ) : (
            messages.map((m, i) => (
              <div key={`${i}-${m.slice(0, 12)}`} style={{ marginBottom: 4 }}>
                {m}
              </div>
            ))
          )}
        </div>
        <input
          placeholder="Say something..."
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            padding: "10px 12px",
            fontSize: 12,
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = e.currentTarget.value.trim();
              if (!v) return;
              setMessages((prev) => [...prev, `You: ${v}`]);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </section>
  );
}
