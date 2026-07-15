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
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      {state === "loading" && (
        <p style={{ fontSize: 10, color: "rgba(255,216,143,0.6)" }}>Loading operators…</p>
      )}
      {state === "error" && (
        <p style={{ fontSize: 10, color: "#fb7185" }}>Unable to load roster. Retry.</p>
      )}
      {state === "ready" && operators.length === 0 && (
        <p style={{ fontSize: 10, color: "rgba(255,216,143,0.6)" }}>No ADMIN/STAFF accounts found.</p>
      )}

      <div style={{ display: "grid", gap: 6 }}>
        {operators.map((op) => {
          const active = (selected?.userId ?? operators[0]?.userId) === op.userId;
          return (
            <button
              key={op.userId}
              type="button"
              onClick={() => setSelectedId(op.userId)}
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
                      width: 26, height: 26, borderRadius: "50%",
                      border: "1px solid rgba(241,181,66,0.45)",
                      background: "linear-gradient(180deg, rgba(241,181,66,0.35), rgba(71,31,25,0.72))",
                      color: "#ffe3a3", fontSize: 10, fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {initials(op.displayName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {op.displayName}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,216,143,0.72)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {op.assignedRoles.join(" · ")}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${presenceColor[op.presence]}66`,
                    background: `${presenceColor[op.presence]}22`,
                    color: presenceColor[op.presence],
                    fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px",
                  }}
                >
                  {op.presence}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
          <DeckChip label="Active Role" value={selected.activeRole ?? "—"} />
          <DeckChip label="Last Seen" value={selected.lastSeenAt ? new Date(selected.lastSeenAt).toLocaleString() : "Unknown"} />
        </div>
      )}

      {presenceNote && (
        <p style={{ fontSize: 8, color: "rgba(255,216,143,0.45)", marginTop: "auto" }}>
          ⚠ {presenceNote}
        </p>
      )}
    </section>
  );
}
