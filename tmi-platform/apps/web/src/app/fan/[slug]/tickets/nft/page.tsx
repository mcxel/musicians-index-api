import Link from "next/link";
import { getOwnedTickets } from "@/lib/tickets/ticketEngine";

export default function FanNFTTicketsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const allTickets = getOwnedTickets(slug);
  const nftTickets = allTickets.filter((t) => t.outputFormats.includes("NFT"));

  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,2,11,0.95)", borderBottom: "1px solid rgba(232,121,249,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/fan/${slug}/tickets`} style={{ color: "#e879f9", fontSize: 10, textDecoration: "none", border: "1px solid rgba(232,121,249,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← WALLET</Link>
        <strong style={{ color: "#e879f9", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>NFT PASSES</strong>
        <span style={{ marginLeft: "auto", color: "#e879f9", fontSize: 10, fontWeight: 700 }}>{nftTickets.length} NFT passes</span>
      </header>

      <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {nftTickets.length === 0 && (
          <p style={{ color: "#475569", fontSize: 11, padding: "40px 0", gridColumn: "1/-1", textAlign: "center" }}>
            No NFT passes yet. <Link href={`/fan/${slug}/tickets`} style={{ color: "#e879f9" }}>View wallet</Link>
          </p>
        )}
        {nftTickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid rgba(232,121,249,0.4)",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(88,28,135,0.25), rgba(3,2,11,0.9))",
              padding: 16,
              display: "grid",
              gap: 10,
            }}
          >
            {/* NFT visual placeholder */}
            <div style={{
              height: 140,
              borderRadius: 10,
              background: `radial-gradient(circle at 30% 30%, rgba(232,121,249,0.3), transparent 60%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.25), transparent 50%), rgba(20,5,35,0.8)`,
              border: "1px solid rgba(232,121,249,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 6,
            }}>
              <span style={{ fontSize: 28 }}>🎫</span>
              <span style={{ fontSize: 9, color: "#e879f9", letterSpacing: "0.2em", textTransform: "uppercase" }}>NFT PASS</span>
            </div>

            <strong style={{ color: "#e879f9", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {ticket.template.tier} — {ticket.template.eventSlug}
            </strong>
            <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>{ticket.template.venueSlug}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>{ticket.id.slice(-12)}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9" }}>${ticket.template.faceValue}</span>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button type="button" style={{ flex: 1, borderRadius: 6, border: "1px solid rgba(232,121,249,0.4)", background: "rgba(88,28,135,0.25)", color: "#e879f9", fontSize: 9, fontWeight: 700, padding: "5px 0", cursor: "pointer" }}>VIEW ON CHAIN</button>
              <button type="button" style={{ flex: 1, borderRadius: 6, border: "1px solid rgba(251,191,36,0.35)", background: "rgba(120,53,15,0.25)", color: "#fde68a", fontSize: 9, fontWeight: 700, padding: "5px 0", cursor: "pointer" }}>LIST FOR SALE</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
