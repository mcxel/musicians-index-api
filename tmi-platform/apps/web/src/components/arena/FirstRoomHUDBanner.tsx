"use client";

import { useEffect, useState } from "react";

// Slides in after the seat-settle window (1.5s), auto-dismisses after 8s or on tap.
export function FirstRoomHUDBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("tmi_room_hint_shown")) return;

    const showTimer = setTimeout(() => setVisible(true), 1500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("tmi_room_hint_shown", "1");
    }, 9500);

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("tmi_room_hint_shown", "1");
  }

  if (dismissed || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9000,
        background: "rgba(0,0,0,0.88)",
        border: "1px solid rgba(0,229,255,0.35)",
        borderRadius: 10,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 4px 32px rgba(0,229,255,0.12)",
        backdropFilter: "blur(8px)",
        animation: "tmi-slide-up 0.4s ease",
        maxWidth: "90vw",
      }}
    >
      <span style={{ fontSize: 20 }}>🪑</span>
      <span style={{ color: "#e0e0e0", fontSize: 13, lineHeight: 1.5 }}>
        <strong style={{ color: "#00e5ff" }}>Seated.</strong>
        {" "}Drag to look around · Tap seats to interact · View Live Vibe
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          color: "#666",
          fontSize: 16,
          cursor: "pointer",
          padding: "0 4px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes tmi-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
