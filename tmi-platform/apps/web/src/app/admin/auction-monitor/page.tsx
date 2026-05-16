"use client";

import { useState } from "react";

const SEED_AUCTIONS = [
  { id: "auc1", title: "Midnight Bars Beat (Exclusive)", type: "BEAT", seller: "Wavetek", currentBid: 680, reserve: 500, buyout: 1200, bids: 8, endsAt: "Apr 27, 2026 · 11:59 PM", status: "ACTIVE" },
  { id: "auc2", title: "Cyber Genesis NFT #002", type: "NFT", seller: "TMI Art", currentBid: 195, reserve: 150, buyout: 500, bids: 3, endsAt: "Apr 28, 2026 · 8:00 PM", status: "ACTIVE" },
  { id: "auc3", title: "VIP Table — Neon Vibe Show", type: "TICKET", seller: "TMI Events", currentBid: 420, reserve: 300, buyout: 600, bids: 11, endsAt: "Apr 27, 2026 · 6:00 PM", status: "ENDING_SOON" },
  { id: "auc4", title: "808 Dreams (Exclusive)", type: "BEAT", seller: "Krypt", currentBid: 310, reserve: 400, buyout: 800, bids: 2, endsAt: "Apr 30, 2026 · 9:00 PM", status: "RESERVE_NOT_MET" },
  { id: "auc5", title: "Lo-Fi Canvas #007", type: "NFT", seller: "Neon Vibe", currentBid: 60, reserve: 60, buyout: 200, bids: 1, endsAt: "Apr 26, 2026 · 11:59 PM", status: "ENDED" },
];

const STATUS_C: Record<string, string> = {
  ACTIVE: "#00FF88",
  ENDING_SOON: "#FFD700",
  RESERVE_NOT_MET: "#FF2DAA",
  ENDED: "rgba(255,255,255,0.3)",
  CANCELLED: "#FF2DAA",
};

const TYPE_C: Record<string, string> = { BEAT: "#FFD700", NFT: "#AA2DFF", TICKET: "#FF2DAA", INSTRUMENTAL: "#00FFFF" };

export default function AdminAuctionMonitorPage() {
  const [auctions] = useState(SEED_AUCTIONS);
  const active = auctions.filter(a => a.status === "ACTIVE" || a.status === "ENDING_SOON");
  const totalBidVolume = auctions.reduce((a, auc) => a + auc.currentBid, 0);
  const tmiCut = totalBidVolume * 0.15;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Auction Monitor</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Live auction oversight — bids, reserve status, buyout triggers · 15% TMI cut</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "ACTIVE AUCTIONS", v: active.length, c: "#00FF88" },
            { l: "TOTAL BID VOLUME", v: `$${totalBidVolume.toLocaleString()}`, c: "#00FFFF" },
            { l: "TMI CUT (15%)", v: `$${tmiCut.toLocaleString()}`, c: "#FF2DAA" },
            { l: "ENDING SOON", v: auctions.filter(a => a.status === "ENDING_SOON").length, c: "#FFD700" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["ITEM", "TYPE", "SELLER", "CURRENT BID", "RESERVE", "BUYOUT", "BIDS", "ENDS AT", "STATUS", "ACTION"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auctions.map(a => {
              const reserveMet = a.currentBid >= a.reserve;
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, maxWidth: 180 }}>{a.title}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: TYPE_C[a.type] ?? "#fff", border: `1px solid ${TYPE_C[a.type] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{a.seller}</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88", fontWeight: 800 }}>${a.currentBid.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: reserveMet ? "#00FF88" : "#FF2DAA", fontSize: 11 }}>${a.reserve.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>${a.buyout.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: "#00FFFF", fontWeight: 700 }}>{a.bids}</td>
                  <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{a.endsAt}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[a.status] ?? "#fff", border: `1px solid ${STATUS_C[a.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.status.replace("_", " ")}</span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {(a.status === "ACTIVE" || a.status === "ENDING_SOON") && (
                      <button style={{ padding: "4px 8px", fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>CANCEL</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
