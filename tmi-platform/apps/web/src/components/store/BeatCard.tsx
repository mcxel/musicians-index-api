"use client";

import React from "react";
import type { Beat, BeatLicenseType } from "@/lib/audio/BeatLabEngine";

interface BeatCardProps {
  beat: Beat;
  onPlayPreview?: (beatId: string) => void;
  onBuy?: (beatId: string, licenseType: BeatLicenseType) => void;
}

export function BeatCard({ beat, onPlayPreview, onBuy }: BeatCardProps) {
  return (
    <div
      style={{
        background: "rgba(2,6,23,0.96)",
        border: "1px solid rgba(51,65,85,0.6)",
        borderRadius: 14,
        padding: 14,
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{beat.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{`${beat.producerName} | ${beat.genre} | ${beat.bpm} BPM | ${beat.musicalKey}`}</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0,255,255,0.25)",
            color: "#00ffff",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            height: "fit-content",
          }}
        >
          {beat.status}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          marginBottom: 12,
          background: "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
          border: "1px solid rgba(51,65,85,0.5)",
          borderRadius: 10,
          height: 54,
          display: "grid",
          gridTemplateColumns: "repeat(24, 1fr)",
          gap: 2,
          padding: "8px 10px",
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              alignSelf: "end",
              height: `${20 + ((i * 7) % 26)}px`,
              borderRadius: 2,
              background: i % 4 === 0 ? "#00ffff" : "rgba(148,163,184,0.65)",
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => onPlayPreview?.(beat.beatId)}
          style={{
            border: "1px solid rgba(0,255,255,0.4)",
            background: "rgba(0,255,255,0.12)",
            color: "#00ffff",
            borderRadius: 8,
            padding: "7px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Play Preview
        </button>
        <div style={{ display: "flex", alignItems: "center", color: "#64748b", fontSize: 11 }}>
          Plays: {beat.plays.toLocaleString()} | Purchases: {beat.purchases.toLocaleString()}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {beat.licenses.map((license) => (
          <button
            key={license.licenseId}
            type="button"
            onClick={() => onBuy?.(beat.beatId, license.type)}
            style={{
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(51,65,85,0.5)",
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              color: "#e2e8f0",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{license.type}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ffd700" }}>${license.priceUsd.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{license.allowsCommercial ? "Commercial" : "Personal"}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
