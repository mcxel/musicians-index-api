import Link from "next/link";

export default function TheEndDropsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#090914", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>The End Drops</h1>
      <p style={{ opacity: 0.85 }}>Drop route is active for end-sequence collectibles and release events.</p>
      <Link href="/the-end" style={{ color: "#facc15" }}>Open The End Hub</Link>
    </main>
  );
}
