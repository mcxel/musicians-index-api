import Link from "next/link";
import TmiVenueBoard from "@/components/billboards/TmiVenueBoard";

export const metadata = { title: "Venue Billboard — TMI" };

export default function BillboardVenuePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <Link href="/billboards" style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.12em", textDecoration: "none" }}>← BILLBOARD HUB</Link>
        <TmiVenueBoard />
      </div>
    </main>
  );
}
