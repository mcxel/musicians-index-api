"use client";

import { useEffect, useState } from "react";
import {
  subscribeBroadcastDirector,
  type BroadcastShot,
  type RoomType,
} from "@/lib/live/BroadcastDirectorEngine";

interface AudienceDirectorWindowProps {
  roomId: string;
  roomType?: RoomType;
  label?: string;
  accentColor?: string;
  height?: number;
  intervalMs?: number;
  onJoin?: () => void;
}

function avatarEmoji(a: BroadcastShot["featured"][number]): string {
  if (a.tier === "vip" || a.tier === "superfan") return "👑";
  if (a.state === "dancing") return "🕺";
  if (a.state === "clapping") return "👏";
  if (a.state === "waving") return "👋";
  if (a.state === "reacting") return "🔥";
  return "🎧";
}

/**
 * Discovery-surface "Audience Preview" window — Window C in the Broadcast Director
 * System (Audience Visibility Rule v2). Renders a small rotating crowd shot driven by
 * AudienceDirectorCamera, never a static full seat grid.
 */
export default function AudienceDirectorWindow({
  roomId,
  roomType = "PERFORMER_LIVE",
  label,
  accentColor = "#FF2DAA",
  height = 180,
  intervalMs = 4500,
  onJoin,
}: AudienceDirectorWindowProps) {
  const [shot, setShot] = useState<BroadcastShot | null>(null);

  useEffect(() => {
    return subscribeBroadcastDirector(roomId, { roomType }, setShot, intervalMs);
  }, [roomId, roomType, intervalMs]);

  const tileSize = shot?.shotType === "HostView" ? 56 : shot?.shotType === "VIPView" ? 38 : 26;
  const fontSize = shot?.shotType === "HostView" ? 26 : shot?.shotType === "VIPView" ? 16 : 12;

  return (
    <button
      onClick={onJoin}
      style={{
        position: "relative",
        height,
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${accentColor}55`,
        background: `radial-gradient(circle at 50% 30%, ${accentColor}18, #050510 80%)`,
        cursor: onJoin ? "pointer" : "default",
        padding: 0,
        textAlign: "left",
      }}
    >
      <style>{`@keyframes adcShotIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }`}</style>
      {shot && (
        <div
          key={shot.generatedAt}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexWrap: "wrap",
            alignContent: "center",
            justifyContent: "center",
            gap: 6,
            padding: 16,
            animation: "adcShotIn 0.45s ease",
          }}
        >
          {shot.featured.map((a) => (
            <div
              key={a.userId}
              title={a.displayName}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 8,
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
              }}
            >
              {avatarEmoji(a)}
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: accentColor,
          background: "rgba(5,5,16,0.72)",
          padding: "3px 8px",
          borderRadius: 4,
        }}
      >
        🎥 {shot?.caption ?? "AUDIENCE CAM"}
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            background: "rgba(5,5,16,0.6)",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      )}
    </button>
  );
}
