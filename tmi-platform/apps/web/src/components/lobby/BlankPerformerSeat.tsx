"use client";

import type { BlankSeatPerformerBot } from "@/lib/bots/blankSeatPerformerBots";

type BlankPerformerSeatProps = {
  bot: BlankSeatPerformerBot;
  onClick?: (botId: string) => void;
};

export default function BlankPerformerSeat({ bot, onClick }: BlankPerformerSeatProps) {
  const isListening = bot.state === "listening";
  const isInactive = bot.state === "inactive";

  return (
    <button
      type="button"
      data-testid={`blank-performer-seat-${bot.id}`}
      data-bot-label={bot.label}
      data-bot-state={bot.state}
      onClick={() => onClick?.(bot.id)}
      style={{
        border: "1px solid rgba(148,163,184,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.95))",
        color: "#e2e8f0",
        width: "100%",
        minHeight: 140,
        padding: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ fontSize: 12, letterSpacing: "0.08em", color: "#93c5fd" }}>{bot.label}</strong>
        <span
          data-testid={`blank-seat-state-${bot.id}`}
          style={{
            fontSize: 10,
            borderRadius: 999,
            padding: "3px 8px",
            background: isInactive ? "rgba(71,85,105,0.4)" : isListening ? "rgba(14,165,233,0.35)" : "rgba(250,204,21,0.25)",
            color: isInactive ? "#cbd5e1" : isListening ? "#67e8f9" : "#fde68a",
            textTransform: "uppercase",
          }}
        >
          {bot.state}
        </span>
      </div>

      <div
        data-testid={`blank-seat-screen-${bot.id}`}
        style={{
          border: "1px dashed rgba(148,163,184,0.45)",
          borderRadius: 8,
          minHeight: 66,
          display: "grid",
          placeItems: "center",
          color: "#94a3b8",
          fontSize: 12,
          letterSpacing: "0.05em",
          marginBottom: 8,
          background: "rgba(15,23,42,0.45)",
        }}
      >
        {isInactive ? "BLANK / INACTIVE SEAT" : "LISTENING / TEST MODE"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, fontSize: 10 }}>
        <span data-testid={`blank-seat-video-${bot.id}`}>VIDEO: {bot.feedHealth.video}</span>
        <span data-testid={`blank-seat-audio-${bot.id}`}>AUDIO: {bot.feedHealth.audio}</span>
        <span data-testid={`blank-seat-chat-${bot.id}`}>CHAT: {bot.feedHealth.chat}</span>
      </div>
    </button>
  );
}
