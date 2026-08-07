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
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => operators.find((op) => op.userId === selectedId) ?? operators[0] ?? null,
    [operators, selectedId],
  );

  const onlineCount = operators.filter((op) => op.presence === "ONLINE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <DeckChip
          label="CHAIN COMMAND"
          value={state === "ready" ? `${operators.length} ops` : state === "loading" ? "…" : "—"}
        />
        {state === "ready" ? (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
            {onlineCount}/{operators.length} online
          </span>
        ) : null}
      </div>

      {state === "loading" ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: 8 }}>Loading operators…</div>
      ) : null}

      {state === "error" ? (
        <div style={{ fontSize: 11, color: "#FF4444", padding: 8 }}>Unable to load chain command.</div>
      ) : null}

      {state === "ready" && operators.length === 0 ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: 8 }}>
          No operators in chain yet.
        </div>
      ) : null}

      {state === "ready" && operators.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {operators.map((op) => {
            const active = (selected?.userId ?? null) === op.userId;
            return (
              <button
                key={op.userId}
                type="button"
                onClick={() => setSelectedId(op.userId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: active
                    ? "linear-gradient(180deg, #37171d 0%, #1a080c 100%)"
                    : "rgba(0,0,0,0.35)",
                  border: active ? "1.5px solid #D4AF37" : "1px solid rgba(255,215,0,0.18)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "1.5px solid #D4AF37",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#FFD700",
                    flexShrink: 0,
                  }}
                >
                  {initials(op.displayName || op.userId)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      color: "#ffe3a3",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {op.displayName || op.userId}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {op.activeRole ?? op.assignedRoles[0] ?? "Operator"}
                  </div>
                </div>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: presenceColor[op.presence],
                    boxShadow: `0 0 6px ${presenceColor[op.presence]}`,
                    flexShrink: 0,
                  }}
                  title={op.presence}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {selected && presenceNote ? (
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", padding: "0 2px" }}>{presenceNote}</div>
      ) : null}
    </div>
  );
}
