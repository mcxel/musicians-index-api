"use client";

import { useState } from "react";

interface Props {
  /** Called with the live MediaStream, or null when sharing stops */
  onStream: (stream: MediaStream | null) => void;
  /** Only performers can share — pass false to disable */
  allowed?: boolean;
}

export default function ScreenShareButton({ onStream, allowed = true }: Props) {
  const [sharing, setSharing] = useState(false);

  async function startShare() {
    if (!allowed || sharing) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setSharing(true);
      onStream(stream);
      // Auto-stop when user ends share via browser UI
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setSharing(false);
        onStream(null);
      });
    } catch {
      // User cancelled or denied — silently ignore
    }
  }

  function stopShare() {
    setSharing(false);
    onStream(null);
  }

  if (!allowed) return null;

  return (
    <button
      onClick={sharing ? stopShare : () => void startShare()}
      style={{
        padding: "8px 14px",
        background: sharing ? "rgba(255,45,45,0.12)" : "rgba(0,255,255,0.08)",
        border: `1px solid ${sharing ? "rgba(255,45,45,0.35)" : "rgba(0,255,255,0.25)"}`,
        borderRadius: 8,
        color: sharing ? "#FF6B6B" : "#00FFFF",
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: "0.08em",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span>{sharing ? "🛑" : "🖥️"}</span>
      {sharing ? "STOP SHARING" : "SHARE SCREEN"}
    </button>
  );
}
