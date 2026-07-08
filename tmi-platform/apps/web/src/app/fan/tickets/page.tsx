"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketRecord } from "@/lib/tickets/ticketCore";

export default function FanTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tickets/mine", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch_failed");
        const data = await res.json() as TicketRecord[] | { tickets?: TicketRecord[] };
        const list = Array.isArray(data) ? data : (data as { tickets?: TicketRecord[] }).tickets ?? [];
        setTickets(list);
      })
      .catch(() => {
        setError("Unable to load tickets. Please try again.");
        setTickets([]);
      });
  }, []);

  function viewTicket(id: string) {
    router.push(`/tickets/print/${encodeURIComponent(id)}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/hub/fan" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>← Fan Hub</Link>
        <h1 style={{ fontSize: 32, margin: "20px 0 8px" }}>My Tickets</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 0 }}>Tickets you own for upcoming and past events.</p>

        {error && (
          <div style={{ margin: "16px 0", padding: "10px 14px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "#FF4444" }}>
            {error}
          </div>
        )}

        {tickets === null && (
          <div style={{ marginTop: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: "0.1em" }}>
            Loading tickets…
          </div>
        )}

        {tickets !== null && tickets.length === 0 && !error && (
          <div style={{ marginTop: 40, padding: "32px", border: "1px dashed rgba(255,45,170,0.2)", borderRadius: 16, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>No tickets yet.</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Browse upcoming events to find shows to attend.
            </div>
            <Link
              href="/venues"
              style={{ display: "inline-block", padding: "10px 24px", background: "#FF2DAA", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}
            >
              Browse Events
            </Link>
          </div>
        )}

        {tickets !== null && tickets.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 32 }}>
            {tickets.map((ticket) => {
              const tier = ticket.template?.tier ?? "STANDARD";
              const event = ticket.template?.eventSlug?.replace(/-/g, " ") ?? "Event";
              const venue = ticket.template?.venueSlug?.replace(/-/g, " ") ?? "";
              const issued = ticket.mintedAt ? new Date(ticket.mintedAt).toLocaleDateString() : "";
              return (
                <div
                  key={ticket.id}
                  style={{ border: "1px solid rgba(255,45,170,0.25)", borderRadius: 10, padding: "16px", background: "rgba(255,45,170,0.04)" }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, color: ticket.redeemed ? "#FF9500" : "#00FF88", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {ticket.redeemed ? "REDEEMED" : "ACTIVE"}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{event}</div>
                  {venue && <div style={{ fontSize: 11, color: "#00FFFF", marginBottom: 2 }}>{venue}</div>}
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>{tier.replace(/_/g, " ")}</div>
                  {issued && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Issued {issued}</div>}
                  <button
                    onClick={() => viewTicket(ticket.id)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,45,170,0.4)", background: "rgba(255,45,170,0.1)", color: "#FF2DAA", cursor: "pointer", fontWeight: 700, fontSize: 10 }}
                  >
                    View / Print Ticket
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 32, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Looking for more events?</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Browse venues and upcoming shows on TMI.</div>
          </div>
          <Link href="/venues" style={{ padding: "8px 18px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, color: "#FF2DAA", fontWeight: 800, fontSize: 11, textDecoration: "none" }}>
            Find Events →
          </Link>
        </div>
      </div>
    </main>
  );
}
