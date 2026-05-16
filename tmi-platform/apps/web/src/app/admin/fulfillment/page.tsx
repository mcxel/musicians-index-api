import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Fulfillment | TMI" };

const QUEUE = [
  { id: "ORD-0091", item: "TMI Logo Hoodie — Black", type: "POD", vendor: "Printify", status: "IN_PRODUCTION", buyer: "krypt_rider", eta: "Apr 30, 2026" },
  { id: "ORD-0086", item: "Cypher Nation Tee", type: "POD", vendor: "Printify", status: "QUEUED", buyer: "neon_merch_fan", eta: "May 2, 2026" },
  { id: "ORD-0084", item: "Wavetek Vinyl 12\"", type: "PHYSICAL", vendor: "Manual", status: "READY_TO_SHIP", buyer: "bass_head_99", eta: "Apr 28, 2026" },
  { id: "ORD-0082", item: "TMI Collector Pin Set", type: "PHYSICAL", vendor: "Manual", status: "AWAITING_STOCK", buyer: "collector_fan", eta: "TBD" },
  { id: "ORD-0079", item: "Battle Ring Snapback", type: "POD", vendor: "Printify", status: "SHIPPED", buyer: "battle_guy_88", eta: "Delivered" },
];

const STATUS_C: Record<string, string> = {
  IN_PRODUCTION: "#00FFFF",
  QUEUED: "#AA2DFF",
  READY_TO_SHIP: "#FFD700",
  SHIPPED: "#00FF88",
  AWAITING_STOCK: "#FF2DAA",
  DELIVERED: "#00FF88",
};

export default function AdminFulfillmentPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Fulfillment</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Physical + POD order production pipeline. Digital orders fulfilled instantly via Vault.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { l: "IN QUEUE", v: QUEUE.length, c: "#00FFFF" },
            { l: "IN PRODUCTION", v: QUEUE.filter(q => q.status === "IN_PRODUCTION").length, c: "#FFD700" },
            { l: "READY TO SHIP", v: QUEUE.filter(q => q.status === "READY_TO_SHIP").length, c: "#00FF88" },
            { l: "AWAITING STOCK", v: QUEUE.filter(q => q.status === "AWAITING_STOCK").length, c: "#FF2DAA" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>PHYSICAL + POD QUEUE</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["ORDER ID", "ITEM", "TYPE", "VENDOR", "BUYER", "ETA", "STATUS", "ACTION"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUEUE.map(q => (
                <tr key={q.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 10 }}>{q.id}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{q.item}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{q.type}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{q.vendor}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{q.buyer}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{q.eta}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[q.status] ?? "#fff", border: `1px solid ${STATUS_C[q.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{q.status.replace(/_/g, " ")}</span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {q.status === "READY_TO_SHIP" && (
                      <button style={{ padding: "4px 10px", fontSize: 8, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>MARK SHIPPED</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 10, padding: "16px 20px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Digital assets (beats, NFTs, instrumentals) are fulfilled automatically through the Vault delivery chain — no manual fulfillment required.
        </div>
      </div>
    </main>
  );
}
