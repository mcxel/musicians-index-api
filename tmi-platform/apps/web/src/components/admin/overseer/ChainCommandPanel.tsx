"use client";

import { useMemo, useState } from "react";
import { DeckButton, DeckChip } from "@/components/admin/overseer/AdminDesignSystem";

type UnitState = "online" | "monitoring" | "repairing" | "idle";

type Unit = {
  id: string;
  name: string;
  role: string;
  state: UnitState;
  tasks: number;
  successRate: number;
};

const UNITS: Unit[] = [
  { id: "bigace", name: "Big Ace Overseer", role: "Chief Runtime", state: "online", tasks: 21, successRate: 96 },
  { id: "mcharlie", name: "Michael Charlie", role: "Operations", state: "repairing", tasks: 9, successRate: 91 },
  { id: "security", name: "Security Division", role: "Sentinel", state: "monitoring", tasks: 14, successRate: 98 },
  { id: "revenue", name: "Revenue Division", role: "Stripe / Billing", state: "monitoring", tasks: 8, successRate: 94 },
  { id: "media", name: "Media Division", role: "Broadcast", state: "online", tasks: 12, successRate: 93 },
  { id: "support", name: "Support Division", role: "Inbox", state: "idle", tasks: 3, successRate: 89 },
];

const stateLabel: Record<UnitState, string> = {
  online: "Online",
  monitoring: "Monitoring",
  repairing: "Repairing",
  idle: "Idle",
};

const stateColor: Record<UnitState, string> = {
  online: "#00ff88",
  monitoring: "#facc15",
  repairing: "#fb7185",
  idle: "#a1a1aa",
};

export default function ChainCommandPanel() {
  const [selectedId, setSelectedId] = useState<string>(UNITS[0].id);
  const [log, setLog] = useState<string[]>([]);

  const selected = useMemo(
    () => UNITS.find((unit) => unit.id === selectedId) ?? UNITS[0],
    [selectedId],
  );

  function command(action: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} · ${action} -> ${selected.name}`, ...prev.slice(0, 5)]);
  }

  return (
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gap: 6 }}>
        {UNITS.map((unit) => {
          const active = selectedId === unit.id;
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setSelectedId(unit.id)}
              style={{
                width: "100%",
                textAlign: "left",
                borderRadius: 8,
                border: active ? "1px solid rgba(255,212,120,0.75)" : "1px solid rgba(241,181,66,0.28)",
                background: active
                  ? "linear-gradient(180deg, rgba(131,57,31,0.56), rgba(46,18,19,0.85))"
                  : "linear-gradient(180deg, rgba(74,31,25,0.42), rgba(28,12,14,0.8))",
                padding: "7px 8px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1px solid rgba(241,181,66,0.45)",
                      background: "linear-gradient(180deg, rgba(241,181,66,0.35), rgba(71,31,25,0.72))",
                      color: "#ffe3a3",
                      fontSize: 10,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unit.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {unit.name}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,216,143,0.72)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {unit.role}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${stateColor[unit.state]}66`,
                    background: `${stateColor[unit.state]}22`,
                    color: stateColor[unit.state],
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                  }}
                >
                  {stateLabel[unit.state]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
        <DeckChip label="Tasks" value={String(selected.tasks)} />
        <DeckChip label="Success" value={`${selected.successRate}%`} />
        <DeckChip label="Queue" value={selected.state === "idle" ? "Idle" : "Active"} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <DeckButton onClick={() => command("Summon")}>Summon</DeckButton>
        <DeckButton onClick={() => command("Inspect")}>Inspect</DeckButton>
        <DeckButton onClick={() => command("Reroute")}>Reroute</DeckButton>
        <DeckButton onClick={() => command("Escalate")} active={selected.state === "repairing"}>
          Escalate
        </DeckButton>
      </div>

      {log.length > 0 ? (
        <div
          style={{
            marginTop: "auto",
            borderRadius: 8,
            border: "1px solid rgba(241,181,66,0.24)",
            background: "rgba(20,9,12,0.66)",
            padding: "7px 8px",
          }}
        >
          {log.slice(0, 3).map((entry, index) => (
            <div key={`${entry}-${index}`} style={{ fontSize: 8, color: "rgba(255,216,143,0.75)", lineHeight: 1.5 }}>
              {entry}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
