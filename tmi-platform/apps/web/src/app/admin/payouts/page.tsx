import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Payouts | TMI" };

const PAYOUTS = [
  { id: "p1", recipient: "Wavetek", type: "BEAT SALES", amount: 892, status: "PENDING", method: "Stripe", period: "Apr 2026" },
  { id: "p2", recipient: "FlowMaster", type: "BEAT SALES", amount: 312, status: "PENDING", method: "Stripe", period: "Apr 2026" },
  { id: "p3", recipient: "Krypt", type: "BEAT AUCTION", amount: 1050, status: "PROCESSING", method: "Stripe", period: "Apr 2026" },
  { id: "p4", recipient: "TMI Art", type: "NFT SALES", amount: 196, status: "PAID", method: "Manual", period: "Mar 2026" },
  { id: "p5", recipient: "Neon Vibe", type: "TICKET SALES", amount: 4480, status: "PAID", method: "Stripe", period: "Mar 2026" },
];

const STATUS_C: Record<string, string> = { PENDING: "#FFD700", PROCESSING: "#00FFFF", PAID: "#00FF88", FAILED: "#FF2DAA" };

export default function AdminPayoutsPage() {
  const pending = PAYOUTS.filter(p => p.status === "PENDING").reduce((a, p) => a + p.amount, 0);
  const paid = PAYOUTS.filter(p => p.status === "PAID").reduce((a, p) => a + p.amount, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Payouts</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "PENDING", v: `$${pending}`, c: "#FFD700" }, { l: "PAID THIS MONTH", v: `$${paid}`, c: "#00FF88" }, { l: "RECIPIENTS", v: PAYOUTS.length, c: "#00FFFF" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["RECIPIENT", "TYPE", "AMOUNT", "STATUS", "METHOD", "PERIOD", "ACTION"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {PAYOUTS.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{p.recipient}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{p.type}</td>
                <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${p.amount}</td>
                <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[p.status] ?? "#fff", border: `1px solid ${STATUS_C[p.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{p.status}</span></td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{p.method}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{p.period}</td>
                <td style={{ padding: "14px 12px" }}>{p.status === "PENDING" && <button style={{ padding: "4px 10px", fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>PAY NOW</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
