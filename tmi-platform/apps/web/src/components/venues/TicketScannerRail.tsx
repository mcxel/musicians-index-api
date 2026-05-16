"use client";

import { useState } from "react";
import { scanTicket, verifyTicket, redeemTicket } from "@/lib/tickets/ticketEngine";
import { evaluateFraudGuard } from "@/lib/tickets/ticketCore";

type ScanResult = {
  ticketId: string;
  status: "allowed" | "denied" | "flagged";
  message: string;
  tier?: string;
  seat?: string;
  ts: string;
};

type TicketScannerRailProps = {
  gate?: string;
  onScanComplete?: (result: ScanResult) => void;
};

export default function TicketScannerRail({
  gate = "GATE-A",
  onScanComplete,
}: TicketScannerRailProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [processing, setProcessing] = useState(false);

  function handleScan() {
    const ticketId = input.trim();
    if (!ticketId || processing) return;

    setProcessing(true);

    try {
      const validation = verifyTicket(ticketId);
      const fraud = evaluateFraudGuard(ticketId);
      const scan = scanTicket(ticketId, gate);

      let status: "allowed" | "denied" | "flagged" = "allowed";
      let message = "Entry granted";

      if (fraud.duplicateScan) {
        status = "flagged";
        message = "DUPLICATE SCAN — ticket already used";
      } else if (fraud.status === "flagged") {
        status = "flagged";
        message = "FRAUD ALERT — checksum invalid";
      }

      void validation;
      void scan;

      try {
        redeemTicket(ticketId);
      } catch {
        if (status === "allowed") {
          status = "denied";
          message = "Ticket already redeemed";
        }
      }

      const result: ScanResult = {
        ticketId,
        status,
        message,
        ts: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [result, ...prev.slice(0, 19)]);
      onScanComplete?.(result);
    } catch {
      const result: ScanResult = {
        ticketId,
        status: "denied",
        message: "Ticket not found",
        ts: new Date().toLocaleTimeString(),
      };
      setResults((prev) => [result, ...prev.slice(0, 19)]);
    } finally {
      setInput("");
      setProcessing(false);
    }
  }

  const statusColor = { allowed: "#22c55e", denied: "#ef4444", flagged: "#f59e0b" };
  const statusBg    = { allowed: "rgba(5,46,22,0.4)", denied: "rgba(69,10,10,0.4)", flagged: "rgba(78,49,5,0.4)" };

  const todayAllowed = results.filter((r) => r.status === "allowed").length;
  const todayDenied  = results.filter((r) => r.status !== "allowed").length;

  return (
    <section
      data-ticket-scanner={gate}
      style={{
        border: "1px solid rgba(56,189,248,0.35)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(5,25,40,0.8), rgba(3,8,18,0.95))",
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ color: "#7dd3fc", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>
          TICKET SCANNER — {gate}
        </strong>
        <span style={{ fontSize: 9, color: "#22c55e" }}>{todayAllowed} in</span>
        <span style={{ fontSize: 9, color: "#ef4444" }}>{todayDenied} denied</span>
      </div>

      {/* Scanner input */}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="Scan ticket ID or QR value..."
          autoFocus
          style={{
            flex: 1,
            background: "#0f172a",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: 7,
            color: "#e2e8f0",
            padding: "7px 12px",
            fontSize: 11,
            fontFamily: "monospace",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleScan}
          disabled={processing || !input.trim()}
          style={{
            borderRadius: 7,
            border: "1px solid rgba(56,189,248,0.55)",
            background: "rgba(14,116,144,0.3)",
            color: "#7dd3fc",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.1em",
            padding: "7px 14px",
            cursor: processing ? "not-allowed" : "pointer",
            textTransform: "uppercase",
          }}
        >
          SCAN
        </button>
      </div>

      {/* Scan log */}
      {results.length > 0 && (
        <div style={{ display: "grid", gap: 4, maxHeight: 280, overflowY: "auto" }}>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                border: `1px solid ${statusColor[r.status]}33`,
                borderRadius: 7,
                background: statusBg[r.status],
                padding: "5px 10px",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[r.status], flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 9, color: "#64748b", flexShrink: 0 }}>{r.ts}</span>
              <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.ticketId}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: statusColor[r.status], letterSpacing: "0.1em", flexShrink: 0 }}>
                {r.status.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0 }}>{r.message}</span>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <p style={{ margin: 0, fontSize: 10, color: "#334155", textAlign: "center", padding: "12px 0" }}>
          Awaiting first scan…
        </p>
      )}
    </section>
  );
}
