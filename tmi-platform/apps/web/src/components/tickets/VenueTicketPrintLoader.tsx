"use client";

import { useState } from "react";
import type { TicketRecord } from "@/lib/tickets/ticketCore";
import VenueTicketPrintShell from "@/components/tickets/VenueTicketPrintShell";

export default function VenueTicketPrintLoader({ slug }: { slug: string }) {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLoad() {
    if (!ticketId.trim()) return;
    setLoading(true);
    setStatus("Loading ticket...");
    setTicket(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId.trim()}/print`);
      const payload = await res.json();
      if (!res.ok) {
        setStatus(payload?.error ?? "ticket_not_found");
      } else {
        setTicket(payload.ticket ?? null);
        if (!payload.ticket) setStatus("ticket_data_missing");
        else setStatus("");
      }
    } catch {
      setStatus("network_error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <section style={{ border: "1px solid rgba(0,255,255,0.25)", borderRadius: 12, background: "rgba(0,8,20,0.97)", padding: 14 }}>
        <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", marginBottom: 10 }}>
          TICKET PRINT · {slug.toUpperCase()}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
            placeholder="Enter ticket ID..."
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b", borderRadius: 7, color: "#e2e8f0", fontSize: 11, padding: "8px 10px" }}
          />
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading || !ticketId.trim()}
            style={{ borderRadius: 7, border: "1px solid rgba(0,255,255,0.4)", background: "rgba(0,255,255,0.12)", color: "#00FFFF", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "8px 14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading || !ticketId.trim() ? 0.5 : 1 }}
          >
            {loading ? "LOADING..." : "LOAD"}
          </button>
        </div>
        {status && (
          <div style={{ color: "#f87171", fontSize: 9, fontFamily: "monospace", marginTop: 8 }}>{status}</div>
        )}
      </section>

      {ticket && (
        <VenueTicketPrintShell
          ticket={ticket}
          branding={{ venueSlug: slug, venueName: slug.replace(/-/g, " ").toUpperCase() }}
          faceScanId={null}
        />
      )}
    </div>
  );
}
