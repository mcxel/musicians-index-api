"use client";

import { useState, useEffect } from "react";

type BattlePair = [string, string];

export default function BattleBracketPreview() {
  const [brackets, setBrackets] = useState<BattlePair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/battles/upcoming?limit=4")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }
        setBrackets(
          (data as Array<any>).map((b) => [
            b.participant1 || "Unknown",
            b.participant2 || "Unknown",
          ])
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {loading ? (
        <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Loading battles...
        </div>
      ) : brackets.length === 0 ? (
        <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          No battles scheduled.
        </div>
      ) : (
        brackets.map((pair, index) => (
          <div key={`${pair[0]}-${pair[1]}`} style={{ borderRadius: 10, border: "1px solid rgba(255,45,170,0.35)", padding: 9, background: "rgba(20,8,19,0.78)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#fce7f3", fontWeight: 800 }}>{pair[0]}</span>
            <span style={{ fontSize: 9, color: "#fb7185", fontWeight: 900, letterSpacing: "0.12em" }}>VS</span>
            <span style={{ fontSize: 10, color: "#fce7f3", fontWeight: 800, textAlign: "right" }}>{pair[1]}</span>
          </div>
        ))
      )}
    </div>
  );
}
