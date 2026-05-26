"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export interface UserProfilePanelUser {
  id: string;
  name: string;
  role: string;
  avatarEmoji?: string;
  slug?: string;
  isOnline?: boolean;
  genre?: string;
  accentColor?: string;
}

interface UserProfilePanelProps {
  user: UserProfilePanelUser;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

const ROLE_COLOR: Record<string, string> = {
  artist:     "#FF2DAA",
  fan:        "#00C8FF",
  producer:   "#FFD700",
  sponsor:    "#AA2DFF",
  advertiser: "#FF6B00",
  performer:  "#FF2DAA",
};

const ROLE_LABEL: Record<string, string> = {
  artist:     "Artist",
  fan:        "Fan",
  producer:   "Producer",
  sponsor:    "Sponsor",
  advertiser: "Advertiser",
  performer:  "Performer",
};

export default function UserProfilePanel({ user, onClose, anchorEl }: UserProfilePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const accent = user.accentColor ?? ROLE_COLOR[user.role] ?? "#00C8FF";
  const slug = user.slug ?? user.id;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && e.target !== anchorEl) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, anchorEl]);

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        width: 280,
        background: "rgba(5,5,16,0.97)",
        border: `1px solid ${accent}40`,
        backdropFilter: "blur(16px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
        zIndex: 8500,
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 16px 10px",
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${accent}30, rgba(5,5,16,0.8))`,
          border: `2px solid ${accent}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}>
          {user.avatarEmoji ?? "🎵"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: accent, textTransform: "uppercase" }}>
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            {user.isOnline && (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00C896", display: "inline-block", boxShadow: "0 0 4px #00C896" }} />
            )}
            {user.genre && (
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>· {user.genre}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 4, flexShrink: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <Link
            href={`/messages/new?recipientId=${slug}&name=${encodeURIComponent(user.name)}`}
            onClick={onClose}
            style={actionStyle("#00C8FF")}
          >
            💬 Message
          </Link>
          <Link
            href={`/messages/${slug}?call=video`}
            onClick={onClose}
            style={actionStyle("#00C896")}
          >
            🎥 Video Call
          </Link>
          <Link
            href={`/messages/${slug}?call=voice`}
            onClick={onClose}
            style={actionStyle("#AA2DFF")}
          >
            📞 Voice Call
          </Link>
          <button
            style={buttonActionStyle("#FFD700")}
            onClick={() => { onClose(); }}
          >
            ➕ Add Friend
          </button>
        </div>

        <Link
          href={`/live/lobby?invite=${slug}`}
          onClick={onClose}
          style={{ ...actionStyle("#FF6B00"), textAlign: "center" }}
        >
          🎤 Invite to Room
        </Link>

        <Link
          href={`/profile/${slug}`}
          onClick={onClose}
          style={{
            display: "block",
            textAlign: "center",
            padding: "8px",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            marginTop: 4,
          }}
        >
          VIEW FULL PROFILE →
        </Link>
      </div>
    </div>
  );
}

function actionStyle(color: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "9px 10px",
    background: `${color}10`,
    border: `1px solid ${color}30`,
    color,
    fontSize: 10,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    letterSpacing: "0.04em",
  };
}

function buttonActionStyle(color: string): React.CSSProperties {
  return {
    ...actionStyle(color),
    background: `${color}10`,
    border: `1px solid ${color}30`,
    fontFamily: "'Inter',sans-serif",
  };
}
