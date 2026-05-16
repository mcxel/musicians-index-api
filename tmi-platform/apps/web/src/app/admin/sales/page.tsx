import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Sales | TMI" };

const LEADS = [
  { company: "BeatPort USA", type: "SPONSOR", status: "NEGOTIATING", value: 12000, rep: "Marcel D." },
  { company: "Fender Guitars", type: "SPONSOR", status: "OUTREACH", value: 8000, rep: "Bot: Sponsor Bot" },
  { company: "Roland", type: "ADVERTISER", status: "SIGNED", value: 3200, rep: "Marcel D." },
  { company: "Live Nation", type: "VENUE PARTNER", status: "OUTREACH", value: 25000, rep: "Bot: Sales Bot" },
  { company: "Trap Nation", type: "ADVERTISER", status: "REVIEW", value: 1500, rep: "Bot: Advertiser Bot" },
];
const STATUS_C: Record<string, string> = { SIGNED: "#00FF88", NEGOTIATING: "#FFD700", OUTREACH: "#00FFFF", REVIEW: "#AA2DFF" };

export default function AdminSalesPage() {
  const pipeline = LEADS.reduce((a, l) => a + l.value, 0);
  const signed = LEADS.filter(l => l.status === "SIGNED").reduce((a, l) => a + l.value, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Sales Department</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "PIPELINE", v: `$${pipeline.toLocaleString()}`, c: "#00FFFF" }, { l: "SIGNED", v: `$${signed.toLocaleString()}`, c: "#00FF88" }, { l: "LEADS", v: LEADS.length, c: "#FFD700" }, { l: "BOTS ACTIVE", v: 3, c: "#AA2DFF" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["COMPANY", "TYPE", "STATUS", "VALUE", "REP", "ACTIONS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {LEADS.map((l, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{l.company}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{l.type}</td>
                <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[l.status] ?? "#fff", border: `1px solid ${STATUS_C[l.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{l.status}</span></td>
                <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${l.value.toLocaleString()}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{l.rep}</td>
                <td style={{ padding: "14px 12px" }}><button style={{ padding: "4px 10px", fontSize: 8, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>UPDATE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
