"use client";

import { useEffect, useState } from "react";

type HistoryPayload = {
  tickets: Array<{ id: string; template: { tier: string; eventSlug: string } }>;
  scans: Array<{ ticketId: string; gate: string; scannedAt: string; status: string }>;
};

export default function TicketsHistoryPage() {
  const [history, setHistory] = useState<HistoryPayload>({ tickets: [], scans: [] });

  useEffect(() => {
    fetch("/api/tickets/history?ownerId=demo-user", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setHistory({ tickets: payload.tickets ?? [], scans: payload.scans ?? [] }))
      .catch(() => setHistory({ tickets: [], scans: [] }));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20 }}>
      <section style={{ maxWidth: 980, margin: "0 auto", border: "1px solid #5f4485", borderRadius: 16, background: "#140d22", padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Ticket History</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 16 }}>Tickets</h2>
            <div style={{ display: "grid", gap: 6 }}>
              {history.tickets.map((ticket) => (
                <div key={ticket.id} style={{ borderRadius: 8, border: "1px solid #6c4f95", background: "#1a1029", padding: "8px 10px", fontSize: 12 }}>
                  {ticket.id} | {ticket.template.tier} | {ticket.template.eventSlug}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 16 }}>Scan Ledger</h2>
            <div style={{ display: "grid", gap: 6 }}>
              {history.scans.map((scan, index) => (
                <div key={`${scan.ticketId}-${index}`} style={{ borderRadius: 8, border: "1px solid #6c4f95", background: "#1a1029", padding: "8px 10px", fontSize: 12 }}>
                  {scan.ticketId} | {scan.gate} | {scan.status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
