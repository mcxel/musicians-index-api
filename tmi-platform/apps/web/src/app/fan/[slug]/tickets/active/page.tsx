import Link from "next/link";
import { getOwnedTickets } from "@/lib/tickets/ticketEngine";
import TicketPrintEngine from "@/components/venues/TicketPrintEngine";

export default function FanActiveTicketsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const allTickets = getOwnedTickets(slug);
  const active = allTickets.filter((t) => !t.redeemed);

  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,2,11,0.95)", borderBottom: "1px solid rgba(0,255,255,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/fan/${slug}/tickets`} style={{ color: "#00FFFF", fontSize: 10, textDecoration: "none", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← WALLET</Link>
        <strong style={{ color: "#00FFFF", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>ACTIVE TICKETS</strong>
        <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 10, fontWeight: 700 }}>{active.length} valid</span>
      </header>

      <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {active.length === 0 && (
          <p style={{ color: "#475569", fontSize: 11, padding: "40px 0", gridColumn: "1/-1", textAlign: "center" }}>
            No active tickets. <Link href={`/fan/${slug}/tickets`} style={{ color: "#00FFFF" }}>View wallet</Link>
          </p>
        )}
        {active.map((ticket) => (
          <TicketPrintEngine key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </main>
  );
}
