"use client";

/**
 * Thin Observatory competition widget — Rule 20 real counts only (Phase 2C).
 */

import { useEffect, useState } from "react";
import { getChallengeQueue } from "@/lib/championship";
import { getChampionshipObservatoryCounts } from "@/lib/championship/legacyScore";

export default function ObservatoryChampionshipWidget() {
  const [counts, setCounts] = useState({
    vacantTitles: 0,
    openChallenges: 0,
    activeChampions: 0,
  });

  useEffect(() => {
    const queued = getChallengeQueue().filter(
      (c) => c.status === "queued" || c.status === "eligible",
    ).length;
    setCounts(getChampionshipObservatoryCounts(queued));
  }, []);

  const cells = [
    { label: "Vacant Titles", value: counts.vacantTitles, color: "#FF6B35" },
    { label: "Open Challenges", value: counts.openChallenges, color: "#00FF88" },
    { label: "Active Champions", value: counts.activeChampions, color: "#FFD700" },
  ];

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,215,0,0.28)",
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FFD700",
          }}
        >
          CHAMPIONSHIP PULSE
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          ChampionshipRegistry · challenge queue · no commerce revenue
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {cells.map((c) => (
          <div
            key={c.label}
            style={{
              padding: "10px 8px",
              borderRadius: 8,
              border: `1px solid ${c.color}44`,
              background: `${c.color}12`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
