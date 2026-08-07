"use client";

type LedgerEvent = {
  eventId: string;
  caseId: string | null;
  type: string;
  actor: string;
  at: string;
  detail: string;
  previousHash: string;
  eventHash: string;
};

export default function LegalAuditLedgerPanel({
  events,
  chain,
  loading,
}: {
  events: LedgerEvent[];
  chain: { ok: boolean; checked: number; message: string } | null;
  loading: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#AA2DFF" }}>Legal Audit Ledger</div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          Append-only event chain with previousHash / eventHash. The ledger proves what happened.
        </p>
      </div>

      {chain ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: chain.ok ? "#00FF88" : "#FF4444",
            border: `1px solid ${chain.ok ? "rgba(0,255,136,0.35)" : "rgba(255,68,68,0.35)"}`,
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          {chain.message} · checked {chain.checked}
        </div>
      ) : null}

      {loading ? <div style={empty}>Loading ledger…</div> : null}
      {!loading && events.length === 0 ? (
        <div style={empty}>Ledger empty — no events recorded yet.</div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflow: "auto" }}>
        {[...events].reverse().map((e) => (
          <div
            key={e.eventId}
            style={{
              border: "1px solid rgba(170,45,255,0.28)",
              borderRadius: 10,
              padding: 10,
              background: "rgba(170,45,255,0.06)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>
              {e.type} · {e.actor}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{e.detail}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4, wordBreak: "break-all" }}>
              {e.at} · case {e.caseId ?? "—"} · prev {e.previousHash.slice(0, 12)}… · hash{" "}
              {e.eventHash.slice(0, 12)}…
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const empty = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  padding: 16,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: 10,
  textAlign: "center" as const,
};
