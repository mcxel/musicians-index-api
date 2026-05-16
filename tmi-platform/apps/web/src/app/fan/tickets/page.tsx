import Link from "next/link";
import { getPointBalance } from "@/lib/economy/PointWalletEngine";
import { listPointHistory } from "@/lib/economy/PointHistoryEngine";
import { TicketWalletPanel } from "@/components/tickets/TicketWalletPanel";

export const metadata = { title: "Your Tickets | TMI", description: "View and manage your event tickets." };

export default async function FanTicketsPage() {
  const balance = getPointBalance("fan-user");
  const history = listPointHistory("fan-user");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/fan/dashboard" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>← Fan Dashboard</Link>
        <h1 style={{ fontSize: 32, margin: "20px 0 8px" }}>My Tickets</h1>
        <p style={{ color: "rgba(255,255,255,0.65)" }}>Active, past, and upcoming events you have tickets for.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 32 }}>
          {[
            { event: "Monday Cypher #42", date: "May 13, 2026", status: "ACTIVE" },
            { event: "Wavetek Live", date: "May 20, 2026", status: "ACTIVE" },
            { event: "Battle Arena S1 Final", date: "May 27, 2026", status: "UPCOMING" },
          ].map((ticket, idx) => (
            <div key={idx} style={{ border: "1px solid rgba(255,45,170,0.25)", borderRadius: 10, padding: "16px", background: "rgba(255,45,170,0.04)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {ticket.status}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{ticket.event}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>{ticket.date}</div>
              <button style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,45,170,0.4)", background: "rgba(255,45,170,0.1)", color: "#FF2DAA", cursor: "pointer", fontWeight: 700, fontSize: 10 }}>
                View Ticket
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Points Balance: {balance}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>Use points to unlock exclusive event access.</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <TicketWalletPanel tickets={[]} onTransfer={() => {}} onRefund={() => {}} />
        </div>
      </div>
    </main>
  );
}
