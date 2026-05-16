"use client";

import { useEffect, useMemo, useState } from "react";
import type { TheaterSeat } from "@/components/lobbies/LobbySeatGrid";
import { getLobbyIdleInteraction } from "@/lib/lobby/LobbyIdleInteractionEngine";

type LobbyAvatarSeatProps = {
  seat: TheaterSeat;
  selected: boolean;
  onSelect: (seatId: string) => void;
};

const STATE_CONFIG: Record<TheaterSeat["visualState"], { head: string; body: string; glow: string; label: string }> = {
  open: { head: "#2a1a42", body: "#1d1330", glow: "transparent", label: "OPEN" },
  occupied: { head: "#00FF88", body: "#153524", glow: "rgba(0,255,136,0.3)", label: "IN" },
  vip: { head: "#FFD700", body: "#3f3010", glow: "rgba(255,215,0,0.35)", label: "VIP" },
  reserved: { head: "#FF2DAA", body: "#3a1d26", glow: "rgba(255,45,170,0.3)", label: "RES" },
  speaker: { head: "#00FFFF", body: "#13213a", glow: "rgba(0,255,255,0.3)", label: "SPK" },
  host: { head: "#FFD700", body: "#40290e", glow: "rgba(255,215,0,0.45)", label: "HOST" },
};

function profileMeta(seat: TheaterSeat) {
  const source = (seat.occupantName ?? seat.id).toLowerCase();
  const props = ["Mic", "Cap", "Lens", "Deck", "Cam"];

  return {
    prop: props[source.length % props.length] ?? props[0],
    talking: seat.visualState === "speaker" || source.includes("host"),
    pinned: seat.visualState === "host",
    liveVideo: seat.visualState !== "open",
  };
}

export default function LobbyAvatarSeat({ seat, selected, onSelect }: LobbyAvatarSeatProps) {
  const cfg = STATE_CONFIG[seat.visualState];
  const isEmpty = seat.visualState === "open";
  const meta = profileMeta(seat);
  const [idleBeat, setIdleBeat] = useState(0);

  useEffect(() => {
    if (isEmpty) return;

    const timer = setInterval(() => {
      setIdleBeat((prev) => prev + 1);
    }, 3200);

    return () => clearInterval(timer);
  }, [isEmpty]);

  const interaction = useMemo(() => getLobbyIdleInteraction(seat, idleBeat), [idleBeat, seat]);

  return (
    <button
      onClick={() => onSelect(seat.id)}
      title={seat.occupantName ? `${seat.id} — ${seat.occupantName}` : seat.id}
      style={{
        background: cfg.body,
        border: `1px solid ${selected ? "#fff2a8" : isEmpty ? "#3b2a56" : cfg.head}`,
        borderRadius: 10,
        padding: "8px 4px 6px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        boxShadow: selected
          ? `0 0 16px ${interaction.accent}55`
          : isEmpty
            ? "none"
            : `0 0 10px ${interaction.pulse ? interaction.accent : cfg.glow}`,
        transition: "box-shadow 0.25s, transform 0.25s, border-color 0.25s",
        minWidth: 52,
        position: "relative",
        overflow: "hidden",
        transform: interaction.pulse && !isEmpty ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {!isEmpty ? (
        <span
          style={{
            position: "absolute",
            inset: 1,
            borderRadius: 9,
            border: `1px solid ${interaction.accent}22`,
            pointerEvents: "none",
          }}
        />
      ) : null}
      {meta.liveVideo ? (
        <span
          style={{
            position: "absolute",
            top: 5,
            left: 6,
            fontSize: 6,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#dbeafe",
            textTransform: "uppercase",
          }}
        >
          {meta.pinned ? "PIN" : "LIVE"}
        </span>
      ) : null}
      {meta.talking ? (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px rgba(52,211,153,0.9)",
          }}
        />
      ) : null}
      <div style={{ position: "relative", width: 26, height: 26 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: isEmpty ? "#2f2742" : cfg.head,
          border: `2px solid ${isEmpty ? "#5f4688" : cfg.head}`,
          opacity: isEmpty ? 0.35 : 1,
          boxShadow: isEmpty ? "none" : `0 0 6px ${cfg.glow}`,
        }} />
        {!isEmpty && (
          <div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", width: 18, height: 8, borderRadius: "50% 50% 0 0", background: cfg.head, opacity: 0.7 }} />
        )}
      </div>
      <div style={{ color: isEmpty ? "#4a3660" : cfg.head, fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>
        {cfg.label}
      </div>
      <div style={{ color: "#6b5a88", fontSize: 8 }}>{seat.id}</div>
      <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {meta.prop}
      </div>
      {!isEmpty ? (
        <div style={{ color: interaction.accent, fontSize: 7, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {interaction.emoji} {interaction.label}
        </div>
      ) : null}
    </button>
  );
}
