import { BillboardCampaignEngine } from "@/lib/billboards/BillboardCampaignEngine";

export default function BigAceBillboardsPage() {
  const summary = BillboardCampaignEngine.getCampaignSummary();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1>Big Ace Billboard Health</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 16 }}>
          {Object.entries(summary).map(([status, count]) => (
            <div key={status} style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: 10 }}>
              <div style={{ color: "#FFD700", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em" }}>{status}</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
