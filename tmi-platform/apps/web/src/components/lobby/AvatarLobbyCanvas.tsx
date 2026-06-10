"use client";
/**
 * AvatarLobbyCanvas — 3D-ready container for avatar display in lobby context.
 * Currently 2D with avatar grid. When Three.js is installed, swap inner renderer
 * for react-three-fiber canvas with GLB avatar models.
 */
import { useState } from "react";
import Link from "next/link";

interface LobbyAvatar {
  id: string;
  name: string;
  role: "fan" | "performer" | "artist" | "vip";
  emoji: string;
  color: string;
  isLive?: boolean;
  seatLabel?: string;
}

interface Props {
  roomId: string;
  avatars?: LobbyAvatar[];
  maxVisible?: number;
  accentColor?: string;
  onAvatarClick?: (avatar: LobbyAvatar) => void;
  fullscreen?: boolean;
  showExpand?: boolean;
}

const DEMO_AVATARS: LobbyAvatar[] = [
  { id: "1",  name: "SkyFan",   role: "fan",       emoji: "🎧", color: "#00FFFF", seatLabel: "G-R12-C4"  },
  { id: "2",  name: "BeatHead", role: "fan",       emoji: "🎵", color: "#FF2DAA", seatLabel: "G-R15-C8"  },
  { id: "3",  name: "VIPLvr",   role: "vip",       emoji: "💎", color: "#AA2DFF", seatLabel: "VIP-R2-C1" },
  { id: "4",  name: "MxLvr22",  role: "fan",       emoji: "🔥", color: "#FFD700", seatLabel: "G-R20-C11" },
  { id: "5",  name: "Nova",     role: "performer", emoji: "🎤", color: "#AA2DFF", isLive: true           },
  { id: "6",  name: "EchoVee",  role: "artist",    emoji: "⚡", color: "#00FF88", seatLabel: "F-R8-C5"   },
  { id: "7",  name: "RhymeLn",  role: "fan",       emoji: "🎭", color: "#FF6B35", seatLabel: "G-R18-C2"  },
  { id: "8",  name: "AriVolt",  role: "artist",    emoji: "👑", color: "#FFD700", seatLabel: "F-R6-C9"   },
  { id: "9",  name: "CrowdKng", role: "fan",       emoji: "🏆", color: "#00FFFF", seatLabel: "G-R30-C7"  },
  { id: "10", name: "ProFan",   role: "vip",       emoji: "🌟", color: "#AA2DFF", seatLabel: "VIP-R3-C2" },
  { id: "11", name: "MusicLvr", role: "fan",       emoji: "🎸", color: "#FF2DAA", seatLabel: "G-R22-C14" },
  { id: "12", name: "BassHed",  role: "fan",       emoji: "🎹", color: "#00FF88", seatLabel: "G-R25-C3"  },
];

export default function AvatarLobbyCanvas({
  roomId,
  avatars = DEMO_AVATARS,
  maxVisible = 24,
  accentColor = "#00FFFF",
  onAvatarClick,
  fullscreen = false,
  showExpand = true,
}: Props) {
  const [expanded, setExpanded] = useState(fullscreen);
  const [hovered, setHovered] = useState<string | null>(null);
  const visible = avatars.slice(0, maxVisible);
  const overflow = Math.max(0, avatars.length - maxVisible);

  return (
    <div style={{
      background: "rgba(5,5,16,0.9)",
      border: `1px solid ${accentColor}20`,
      borderRadius: 16,
      overflow: "hidden",
      transition: "all 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderBottom: `1px solid ${accentColor}15`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
          <span style={{ fontSize: 9, letterSpacing: "0.18em", color: accentColor, fontWeight: 900 }}>
            LIVE LOBBY — {avatars.length} PRESENT
          </span>
        </div>
        {showExpand && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 12 }}
          >
            {expanded ? "⊟" : "⊞"}
          </button>
        )}
      </div>

      {/* Avatar grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: expanded ? "repeat(auto-fill, minmax(64px, 1fr))" : "repeat(auto-fill, minmax(48px, 1fr))",
        gap: 8,
        padding: "12px",
        maxHeight: expanded ? "none" : "240px",
        overflowY: expanded ? "visible" : "hidden",
        transition: "max-height 0.3s ease",
      }}>
        {visible.map(avatar => (
          <button
            key={avatar.id}
            onClick={() => onAvatarClick?.(avatar)}
            onMouseEnter={() => setHovered(avatar.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === avatar.id ? `${avatar.color}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${avatar.color}${avatar.isLive ? "66" : "22"}`,
              borderRadius: 10,
              padding: "8px 4px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {avatar.isLive && (
              <div style={{
                position: "absolute", top: 4, right: 4,
                width: 6, height: 6, borderRadius: "50%",
                background: "#FF2DAA", boxShadow: "0 0 6px #FF2DAA",
              }} />
            )}
            <span style={{ fontSize: expanded ? 22 : 18 }}>{avatar.emoji}</span>
            <span style={{
              fontSize: 7, fontWeight: 800, color: avatar.color,
              textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap",
              maxWidth: "100%",
            }}>
              {avatar.name}
            </span>
            {avatar.seatLabel && expanded && (
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                {avatar.seatLabel}
              </span>
            )}
          </button>
        ))}

        {overflow > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "8px 4px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>+</span>
            <span style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.35)" }}>
              {overflow} more
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 14px", borderTop: `1px solid ${accentColor}10`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
          🎭 {avatars.filter(a => a.isLive).length > 0 ? `${avatars.filter(a => a.isLive).length} LIVE` : "LOBBY ACTIVE"}
        </span>
        <Link href={`/live/rooms`} style={{
          fontSize: 8, color: accentColor, textDecoration: "none", fontWeight: 700,
          letterSpacing: "0.1em",
        }}>
          VIEW ALL →
        </Link>
      </div>
    </div>
  );
}
