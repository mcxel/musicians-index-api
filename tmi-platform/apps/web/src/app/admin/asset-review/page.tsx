import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Asset Review | TMI" };

const QUEUE = [
  { id: "ar1", creator: "BotBeats AI", asset: "Lo-Fi Groove Pack Vol.3", type: "BEAT", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "14.2MB" },
  { id: "ar2", creator: "Vault Bot", asset: "Trap Kit 808 Collection", type: "BEAT", source: "BOT_GENERATED", flags: 1, status: "FLAGGED", size: "22.8MB" },
  { id: "ar3", creator: "MerchBot v2", asset: "TMI Logo Hoodie — Black", type: "MERCH", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "N/A" },
  { id: "ar4", creator: "NFT Engine", asset: "Cyber Genesis NFT #018", type: "NFT", source: "BOT_GENERATED", flags: 2, status: "REVIEW", size: "3.1MB" },
  { id: "ar5", creator: "Wavetek", asset: "Midnight Bars (Exclusive)", type: "BEAT", source: "CREATOR_UPLOAD", flags: 0, status: "APPROVED", size: "8.4MB" },
  { id: "ar6", creator: "FlowBot", asset: "Cypher Instrumental Set", type: "INSTRUMENTAL", source: "BOT_GENERATED", flags: 0, status: "PENDING", size: "31.0MB" },
];

const STATUS_C: Record<string, string> = { PENDING: "#FFD700", FLAGGED: "#FF2DAA", REVIEW: "#AA2DFF", APPROVED: "#00FF88", REJECTED: "#FF2DAA" };
const SOURCE_C: Record<string, string> = { BOT_GENERATED: "#AA2DFF", CREATOR_UPLOAD: "#00FFFF" };

export default function AdminAssetReviewPage() {
  const pending = QUEUE.filter(a => a.status === "PENDING").length;
  const flagged = QUEUE.filter(a => a.status === "FLAGGED" || a.flags > 0).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Asset Review Queue</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Bot-generated and creator-uploaded assets awaiting approval before going live.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "IN QUEUE", v: QUEUE.length, c: "#00FFFF" }, { l: "PENDING", v: pending, c: "#FFD700" }, { l: "FLAGGED", v: flagged, c: "#FF2DAA" }, { l: "APPROVED TODAY", v: 1, c: "#00FF88" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["ASSET", "CREATOR", "TYPE", "SOURCE", "FLAGS", "SIZE", "STATUS", "ACTIONS"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUEUE.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{a.asset}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{a.creator}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{a.type}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: SOURCE_C[a.source] ?? "#fff", border: `1px solid ${SOURCE_C[a.source] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.source.replace("_", " ")}</span>
                </td>
                <td style={{ padding: "14px 12px", color: a.flags > 0 ? "#FF2DAA" : "rgba(255,255,255,0.3)", fontWeight: a.flags > 0 ? 800 : 400 }}>{a.flags}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{a.size}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[a.status] ?? "#fff", border: `1px solid ${STATUS_C[a.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.status}</span>
                </td>
                <td style={{ padding: "14px 12px", display: "flex", gap: 6 }}>
                  {a.status !== "APPROVED" && (
                    <button style={{ padding: "4px 8px", fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>APPROVE</button>
                  )}
                  <button style={{ padding: "4px 8px", fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>REJECT</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
