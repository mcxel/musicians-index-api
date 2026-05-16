import Link from "next/link";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

export default function MarcelTestingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b14", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Marcel Testing Dashboard</h1>
      <p style={{ opacity: 0.8 }}>Operator feed visibility for HOME1-HOME5 with route/state/error diagnostics.</p>
      <Link href="/admin" style={{ color: "#facc15", textDecoration: "none" }}>← Back to Overseer Deck</Link>
      <div style={{ marginTop: 14 }}>
        <HomeFeedObserver title="Marcel Feed Observer" />
      </div>
    </main>
  );
}
