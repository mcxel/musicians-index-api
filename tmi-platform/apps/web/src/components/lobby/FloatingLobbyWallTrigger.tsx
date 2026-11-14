"use client";

import React, { useCallback } from "react";

export interface FloatingLobbyWallTriggerProps {
  onToggle?: () => void;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

/**
 * FloatingLobbyWallTrigger — Persistent Thumb-Friendly Lobby Wall Summon Control
 *
 * Canon:
 * - High-visibility persistent trigger: [ 🏛️ LOBBY WALL ▲ ]
 * - One-tap summon opens MiniLiveLobbyWallRuntime
 * - Preserves running media, sessions, and WebRTC in the background
 * - Mobile thumb-reachable placement above navigation dock
 */
export default function FloatingLobbyWallTrigger({
  onToggle,
  className = "",
  style,
  label = "LOBBY WALL ▲",
}: FloatingLobbyWallTriggerProps) {
  const handleClick = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tmi:toggle-mini-lobby-wall"));
    }
  }, [onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open Live Lobby Wall"
      data-lobby-wall-trigger="true"
      data-testid="floating-lobby-wall-trigger"
      className={className}
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        right: 16,
        zIndex: 85,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 14px",
        background: "linear-gradient(135deg, rgba(6, 7, 13, 0.94) 0%, rgba(20, 10, 35, 0.96) 100%)",
        border: "1px solid #00FFFF",
        borderRadius: 9999,
        boxShadow: "0 0 16px rgba(0, 255, 255, 0.35), 0 4px 12px rgba(0, 0, 0, 0.6)",
        color: "#00FFFF",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        touchAction: "manipulation",
        userSelect: "none",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
        e.currentTarget.style.borderColor = "#FF2DAA";
        e.currentTarget.style.color = "#FF2DAA";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 45, 170, 0.5), 0 6px 16px rgba(0, 0, 0, 0.7)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "#00FFFF";
        e.currentTarget.style.color = "#00FFFF";
        e.currentTarget.style.boxShadow = "0 0 16px rgba(0, 255, 255, 0.35), 0 4px 12px rgba(0, 0, 0, 0.6)";
      }}
    >
      <span style={{ fontSize: 13, filter: "drop-shadow(0 0 4px #00FFFF)" }} aria-hidden="true">
        🏛️
      </span>
      <span>{label}</span>
    </button>
  );
}
