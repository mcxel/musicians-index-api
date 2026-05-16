import Link from "next/link";
import TmiRankingBoard from "@/components/billboards/TmiRankingBoard";

export const metadata = { title: "Ranking Billboard — TMI" };

export default function BillboardRankingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <Link href="/billboards" style={{ color: "#f0abfc", fontSize: 10, letterSpacing: "0.12em", textDecoration: "none" }}>← BILLBOARD HUB</Link>
        <TmiRankingBoard />
      </div>
    </main>
  );
}
