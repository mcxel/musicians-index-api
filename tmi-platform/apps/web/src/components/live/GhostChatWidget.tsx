"use client";

import { useGhostForce } from "@/hooks/useGhostForce";

interface Props {
  roomId: string;
  accentColor?: string;
  compact?: boolean;
}

export default function GhostChatWidget({ roomId, accentColor = "#00FFFF", compact = false }: Props) {
  const { messages, viewerCount, hypeLevel } = useGhostForce(roomId);

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, color: accentColor, fontWeight: 800 }}>
          👁 {viewerCount}
        </span>
        {hypeLevel > 30 && (
          <span style={{ fontSize: 10, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.1em" }}>
            HYPE {hypeLevel}%
          </span>
        )}
        {messages[0] && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {messages[0].botName}: {messages[0].text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(5,5,16,0.92)", border: `1px solid ${accentColor}25`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 320, width: 260 }}>
      {/* Header */}
      <div style={{ background: `${accentColor}12`, borderBottom: `1px solid ${accentColor}20`, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88", flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.15em" }}>LIVE CHAT</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: accentColor, fontWeight: 700 }}>👁 {viewerCount}</span>
          {hypeLevel > 20 && (
            <span style={{ fontSize: 8, color: "#FF2DAA", fontWeight: 900, letterSpacing: "0.15em" }}>
              🔥 {hypeLevel}%
            </span>
          )}
        </div>
      </div>

      {/* Hype bar */}
      {hypeLevel > 0 && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${hypeLevel}%`, height: "100%", background: `linear-gradient(90deg, ${accentColor}, #FF2DAA)`, transition: "width 0.5s ease" }} />
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", marginTop: 40 }}>
            Waiting for activity…
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{
                fontSize: 9, fontWeight: 900,
                color: msg.type === "tip" ? "#FFD700" : msg.type === "hype" ? "#FF2DAA" : accentColor,
                flexShrink: 0, minWidth: 44, letterSpacing: "0.04em",
              }}>
                {msg.botName}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, wordBreak: "break-word" }}>
                {msg.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ borderTop: `1px solid ${accentColor}15`, padding: "8px 10px", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
          TMI Live · All activity is real or simulated
        </div>
      </div>
    </div>
  );
}
