import Link from "next/link";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

export default function JayPaulSanchezTestingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b14", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Jay Paul Sanchez Testing Dashboard</h1>
      <p style={{ opacity: 0.8 }}>Editorial and music feed diagnostics with unified home observer cards.</p>
      <Link href="/admin" style={{ color: "#facc15", textDecoration: "none" }}>← Back to Overseer Deck</Link>
      <div style={{ marginTop: 14 }}>
        <HomeFeedObserver title="Jay Paul Feed Observer" />
      </div>
    </main>
  );
}
