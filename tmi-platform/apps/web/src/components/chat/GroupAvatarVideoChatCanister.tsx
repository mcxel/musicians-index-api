"use client";

import { useState } from "react";
import { getAllEntities, AvatarEntity } from "@/lib/avatars/UnifiedAvatarRuntime";

export interface GroupAvatarVideoChatCanisterProps {
  onClose: () => void;
  roomId?: string;
}

export default function GroupAvatarVideoChatCanister({
  onClose,
}: GroupAvatarVideoChatCanisterProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Fetch active avatar audience entities
  const seatedAvatars: AvatarEntity[] = getAllEntities().slice(0, 4);

  return (
    <div
      style={{
        width: "100%",
        padding: "16px 20px",
        background: "radial-gradient(circle at top, #0A0A20 0%, #04040A 100%)",
        borderTop: "2px solid #FF2DAA",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Canister Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00FFFF",
              boxShadow: "0 0 10px #00FFFF",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", color: "#fff" }}>
            GROUP AVATAR VIDEO CHAT CANISTER · <span style={{ color: "#FF2DAA" }}>SEATED TABLE #04</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            style={{
              background: micEnabled ? "rgba(0,255,255,0.15)" : "rgba(255,32,32,0.2)",
              border: micEnabled ? "1px solid #00FFFF" : "1px solid #FF2020",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {micEnabled ? "🎙 MIC ON" : "🔇 MIC MUTED"}
          </button>

          <button
            onClick={() => setCamEnabled(!camEnabled)}
            style={{
              background: camEnabled ? "rgba(255,45,170,0.15)" : "rgba(255,32,32,0.2)",
              border: camEnabled ? "1px solid #FF2DAA" : "1px solid #FF2020",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {camEnabled ? "📹 CAM ON" : "📷 CAM OFF"}
          </button>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ✕ CLOSE CANISTER
          </button>
        </div>
      </div>

      {/* Seated Avatars Row with Optional Camera Overlay Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {seatedAvatars.map((avatar, idx) => (
          <div
            key={avatar.id || idx}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              position: "relative",
            }}
          >
            {/* Avatar Head & Camera Tile */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1A0033, #330066)",
                border: "2px solid #FFD700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 0 14px rgba(255,215,0,0.4)",
              }}
            >
              {avatar.displayName?.[0]?.toUpperCase() || "👤"}
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{avatar.displayName}</div>
              <div style={{ fontSize: 8, color: "#00FFFF", fontWeight: 700, marginTop: 2 }}>
                💺 SEAT {idx + 1} · {avatar.animState.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
