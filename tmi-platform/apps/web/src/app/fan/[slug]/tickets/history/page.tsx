import Link from "next/link";
import { listTicketHistory } from "@/lib/tickets/ticketEngine";

export default function FanTicketHistoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { tickets, scans } = listTicketHistory(slug);

  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,2,11,0.95)", borderBottom: "1px solid rgba(168,85,247,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/fan/${slug}/tickets`} style={{ color: "#c4b5fd", fontSize: 10, textDecoration: "none", border: "1px solid rgba(168,85,247,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← WALLET</Link>
        <strong style={{ color: "#c4b5fd", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>TICKET HISTORY</strong>
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 10 }}>{tickets.length} total · {scans.length} scans</span>
      </header>

      <div style={{ padding: "14px 20px", display: "grid", gap: 12 }}>
        {/* Scan ledger */}
        {scans.length > 0 && (
          <div style={{ border: "1px solid rgba(168,85,247,0.3)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(168,85,247,0.2)", background: "rgba(44,14,69,0.3)" }}>
              <strong style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>SCAN LOG</strong>
            </div>
            <div style={{ display: "grid", gap: 4, padding: 10 }}>
              {scans.map((scan, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.3)", fontSize: 9 }}>
                  <span style={{ color: scan.status === "allowed" ? "#22c55e" : "#ef4444", fontWeight: 700, letterSpacing: "0.1em", width: 50, flexShrink: 0 }}>{scan.status.toUpperCase()}</span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.ticketId}</span>
                  <span style={{ color: "#475569", flexShrink: 0 }}>{scan.gate}</span>
                  <span style={{ color: "#334155", flexShrink: 0 }}>{new Date(scan.scannedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All tickets */}
        <div style={{ border: "1px solid rgba(100,116,139,0.25)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(100,116,139,0.15)", background: "rgba(15,23,42,0.5)" }}>
            <strong style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>ALL TICKETS</strong>
          </div>
          <div style={{ display: "grid", gap: 4, padding: 10 }}>
            {tickets.length === 0 && <p style={{ color: "#475569", fontSize: 10, margin: 0, padding: "8px 0" }}>No ticket history.</p>}
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", fontSize: 10 }}>
                <span style={{ color: ticket.redeemed ? "#64748b" : "#22c55e", fontWeight: 700, width: 70, flexShrink: 0, letterSpacing: "0.08em" }}>{ticket.template.tier}</span>
                <span style={{ color: "#94a3b8", flex: 1 }}>{ticket.template.eventSlug} · {ticket.template.venueSlug}</span>
                <span style={{ color: "#64748b", fontFamily: "monospace", fontSize: 9 }}>{ticket.id.slice(-8)}</span>
                <span style={{ color: ticket.redeemed ? "#475569" : "#22c55e", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>{ticket.redeemed ? "USED" : "VALID"}</span>
                <span style={{ color: "#22c55e", fontWeight: 700, width: 50, textAlign: "right" }}>${ticket.template.faceValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
