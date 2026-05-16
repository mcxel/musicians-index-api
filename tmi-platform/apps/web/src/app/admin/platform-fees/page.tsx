import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Platform Fees | TMI" };

const FEE_SCHEDULE = [
  { channel: "Beat Lease (Basic)", tmiCut: "30%", creatorKeeps: "70%", notes: "Non-exclusive · MP3" },
  { channel: "Beat Lease (Premium)", tmiCut: "30%", creatorKeeps: "70%", notes: "Non-exclusive · WAV" },
  { channel: "Beat Exclusive", tmiCut: "20%", creatorKeeps: "80%", notes: "Full ownership transfer" },
  { channel: "Beat Auction", tmiCut: "15%", creatorKeeps: "85%", notes: "Highest bid wins" },
  { channel: "NFT Sale", tmiCut: "20%", creatorKeeps: "80%", notes: "Royalty model pending" },
  { channel: "NFT Auction", tmiCut: "15%", creatorKeeps: "85%", notes: "Reserve + buyout" },
  { channel: "Ticket Sale", tmiCut: "10%", creatorKeeps: "90%", notes: "Event tickets" },
  { channel: "Merch Sale", tmiCut: "15%", creatorKeeps: "85%", notes: "After POD vendor cost" },
  { channel: "Sponsor Deal", tmiCut: "0%", creatorKeeps: "—", notes: "Platform retains full" },
  { channel: "Advertiser Campaign", tmiCut: "0%", creatorKeeps: "—", notes: "Platform retains full" },
  { channel: "Entry Fee (Battle)", tmiCut: "20%", creatorKeeps: "80%", notes: "Prizepool funded" },
  { channel: "Entry Fee (Cypher)", tmiCut: "20%", creatorKeeps: "80%", notes: "Prizepool funded" },
];

const MONTHLY = [
  { month: "Apr 2026", gross: 48240, tmiFees: 5890, payouts: 42350 },
  { month: "Mar 2026", gross: 31200, tmiFees: 3820, payouts: 27380 },
  { month: "Feb 2026", gross: 18900, tmiFees: 2210, payouts: 16690 },
];

export default function AdminPlatformFeesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Platform Fee Schedule</h1>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>FEE BY CHANNEL</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["CHANNEL", "TMI CUT", "CREATOR KEEPS", "NOTES"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
            <tbody>
              {FEE_SCHEDULE.map(f => (
                <tr key={f.channel} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 12px", fontWeight: 700 }}>{f.channel}</td>
                  <td style={{ padding: "12px 12px", color: "#FF2DAA", fontWeight: 800 }}>{f.tmiCut}</td>
                  <td style={{ padding: "12px 12px", color: "#00FF88" }}>{f.creatorKeeps}</td>
                  <td style={{ padding: "12px 12px", color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{f.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>MONTHLY REVENUE SUMMARY</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["MONTH", "GROSS", "TMI FEES", "CREATOR PAYOUTS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
            <tbody>
              {MONTHLY.map(m => (
                <tr key={m.month} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{m.month}</td>
                  <td style={{ padding: "14px 12px", color: "#00FFFF" }}>${m.gross.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: "#FF2DAA", fontWeight: 800 }}>${m.tmiFees.toLocaleString()}</td>
                  <td style={{ padding: "14px 12px", color: "#00FF88" }}>${m.payouts.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
