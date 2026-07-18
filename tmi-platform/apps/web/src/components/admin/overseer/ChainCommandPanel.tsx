"use client";

import { useEffect, useMemo, useState } from "react";
import { DeckChip } from "@/components/admin/overseer/AdminDesignSystem";
import type { ChainCommandOperator } from "@/app/api/admin/chain-command/route";

type LoadState = "loading" | "ready" | "error";

const presenceColor: Record<ChainCommandOperator["presence"], string> = {
  ONLINE: "#00ff88",
  RECENT: "#facc15",
  OFFLINE: "#a1a1aa",
  UNKNOWN: "#6b6b74",
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function ChainCommandPanel() {
  const [operators, setOperators] = useState<ChainCommandOperator[]>([]);
  const [presenceNote, setPresenceNote] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/chain-command", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ operators: ChainCommandOperator[]; presenceNote: string }>;
      })
      .then((data) => {
        if (cancelled) return;
        setOperators(data.operators ?? []);
        setPresenceNote(data.presenceNote ?? null);
        setState("ready");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, []);

  const selected = useMemo(
    () => operators.find((op) => op.userId === selectedId) ?? operators[0] ?? null,
    [operators, selectedId],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Inter', sans-serif" }}>
      {/* Flowchart container */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", width: "100%" }}>
        
        {/* Node 1: Big Ace Overseer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(180deg, #37171d 0%, #1a080c 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 10,
          padding: "6px 12px",
          width: "100%",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)"
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #D4AF37", background: "rgba(255,255,255,0.05)" }}>
            <img src="/images/tmi-placeholder.jpg" alt="Big Ace Overseer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe3a3", textTransform: "uppercase", letterSpacing: "0.05em" }}>Big Ace Overseer</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div style={{ width: 2, height: 12, background: "#D4AF37", margin: "2px 0", opacity: 0.7 }} />

        {/* Node 2: Big Ace */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(180deg, #37171d 0%, #1a080c 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 10,
          padding: "6px 12px",
          width: "100%",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)"
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #D4AF37", background: "rgba(255,255,255,0.05)" }}>
            <img src="/images/tmi-placeholder.jpg" alt="Big Ace" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe3a3", textTransform: "uppercase", letterSpacing: "0.05em" }}>Big Ace</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div style={{ width: 2, height: 12, background: "#D4AF37", margin: "2px 0", opacity: 0.7 }} />

        {/* Node 3: Verifying Supervisors */}
        <div style={{
          background: "linear-gradient(180deg, #37171d 0%, #1a080c 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 10,
          padding: "6px 12px",
          width: "100%",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontSize: 7, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em", textTransform: "uppercase" }}>VERIFYING SUPERVISORS</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>👤 10</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>8h 55</span>
          </div>
        </div>
      </div>

      {/* Metrics Row: 54% GOOD circle + Cards */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
        {/* Radial gauge */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "4px solid #b8860b",
          borderTopColor: "#FF8A00",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.3)",
          boxShadow: "0 0 10px rgba(255,138,0,0.2)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#FF8A00", lineHeight: 1 }}>54%</span>
          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.6)", fontWeight: 800, marginTop: 1 }}>GOOD</span>
        </div>

        {/* Small stats cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 6 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Teams</span>
            <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>556K</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 6 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Proin Rate</span>
            <span style={{ fontSize: 9, fontWeight: 900, color: "#E63000" }}>€800</span>
          </div>
        </div>
      </div>
    </div>
  );
}
