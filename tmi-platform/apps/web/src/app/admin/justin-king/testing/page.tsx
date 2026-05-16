import Link from "next/link";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

export default function JustinKingTestingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b14", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Justin King Testing Dashboard</h1>
      <p style={{ opacity: 0.8 }}>Live stream, radio, and account-chain diagnostics with unified feed cards.</p>
      <Link href="/admin" style={{ color: "#facc15", textDecoration: "none" }}>← Back to Overseer Deck</Link>
      <div style={{ marginTop: 14 }}>
        <HomeFeedObserver title="Justin King Feed Observer" />
      </div>
    </main>
  );
}
