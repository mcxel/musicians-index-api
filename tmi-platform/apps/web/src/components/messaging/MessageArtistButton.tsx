"use client";

import { useState } from "react";
import InboxPanel from "@/components/messaging/InboxPanel";
import type { ThreadParticipant } from "@/lib/messaging/MessageThreadEngine";
import "@/styles/tmiTypography.css";

interface MessageArtistButtonProps {
  artistSlug: string;
  artistName: string;
}

/** Demo fan identity — replace with real auth session in production */
const DEMO_FAN: ThreadParticipant = {
  userId: "demo-fan-001",
  displayName: "You",
  avatarUrl: "/avatars/fan-default.png",
  role: "fan",
};

export default function MessageArtistButton({
  artistSlug,
  artistName,
}: MessageArtistButtonProps) {
  const [open, setOpen] = useState(false);

  const artistParticipant: ThreadParticipant = {
    userId: `artist-${artistSlug}`,
    displayName: artistName,
    avatarUrl: `/artists/${artistSlug}/avatar.png`,
    role: "artist",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tmi-button-text"
        style={{
          padding: "10px 20px",
          fontSize: 10,
          borderRadius: 8,
          border: "1px solid rgba(0,255,255,0.35)",
          background: "rgba(0,255,255,0.08)",
          color: "#00FFFF",
          cursor: "pointer",
          letterSpacing: "0.12em",
        }}
      >
        💬 MESSAGE
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div style={{ width: "100%", maxWidth: 700, position: "relative" }}>
            <button
              onClick={() => setOpen(false)}
              className="tmi-button-text"
              style={{
                position: "absolute",
                top: -32,
                right: 0,
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              ✕ CLOSE
            </button>
            <InboxPanel
              currentUser={DEMO_FAN}
              openWithUser={artistParticipant}
            />
          </div>
        </div>
      )}
    </>
  );
}
