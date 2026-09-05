"use client";

import React from "react";
import Link from "next/link";
import type { UniversalShowroomSlot } from "@/lib/discovery/UniversalShowroomEngine";

export interface LiveSessionPreviewSlotProps {
  slot: UniversalShowroomSlot;
  variant?: "feature" | "compact" | "tile" | "magazine_strip";
  className?: string;
  onJoinClick?: (slot: UniversalShowroomSlot) => void;
}

export default function LiveSessionPreviewSlot({
  slot,
  variant = "feature",
  className,
  onJoinClick,
}: LiveSessionPreviewSlotProps) {
  const accent = slot.accentColor || "#FF2DAA";
  const isFan = slot.hostRole === "fan";

  if (variant === "compact") {
    return (
      <Link
        href={slot.exactJoinHref}
        onClick={() => onJoinClick?.(slot)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          background: "rgba(5,5,16,0.85)",
          border: `1px solid ${accent}44`,
          borderRadius: 8,
          textDecoration: "none",
          color: "#fff",
          transition: "border-color 0.2s, transform 0.15s",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 8px #FF2DAA",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {slot.title}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            {slot.hostName} · {slot.badgeLabel}
          </div>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: accent,
            background: `${accent}18`,
            padding: "3px 7px",
            borderRadius: 4,
            border: `1px solid ${accent}44`,
            flexShrink: 0,
          }}
        >
          {slot.participantCount} watching
        </span>
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        background: "linear-gradient(145deg, rgba(10,8,24,0.95), rgba(4,3,12,0.98))",
        border: `1px solid ${accent}55`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 16px ${accent}22`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: `1px solid ${accent}22`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: isFan ? "#00FFFF" : "#FF2DAA",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isFan ? "#00FFFF" : "#FF2DAA",
              boxShadow: `0 0 6px ${isFan ? "#00FFFF" : "#FF2DAA"}`,
            }}
          />
          {slot.badgeLabel}
        </span>

        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          👁 {slot.participantCount} in room
        </span>
      </div>

      {/* Visual Canvas / Media Underlay */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "linear-gradient(135deg, #0d0722, #04020a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {slot.posterUrl ? (
          <img
            src={slot.posterUrl}
            alt={slot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: 0.85,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accent}44, transparent)`,
                border: `1px solid ${accent}88`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#fff",
              }}
            >
              {isFan ? "👥" : "🎤"}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: accent,
              }}
            >
              LIVE BROADCAST
            </span>
          </div>
        )}
      </div>

      {/* Content & Action Bar */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {slot.title}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            Host: <strong style={{ color: "#FFD700" }}>{slot.hostName}</strong>
          </div>
        </div>

        <Link
          href={slot.exactJoinHref}
          onClick={() => onJoinClick?.(slot)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 0",
            borderRadius: 6,
            background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
            color: "#050310",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textDecoration: "none",
            boxShadow: `0 4px 12px ${accent}44`,
          }}
        >
          <span>▶</span>
          <span>{isFan ? "JOIN FAN LOBBY" : "WATCH LIVE STAGE"}</span>
        </Link>
      </div>
    </div>
  );
}
