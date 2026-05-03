import Link from "next/link";

export default function CurrentIssueCyphersPage() {
  return (
    <main data-testid="magazine-current-cyphers-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 10 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>Current Issue: Cyphers</h1>
      <p style={{ color: "#cbd5e1" }}>Magazine issue route wired for cypher features and article drill-down.</p>
      <Link href="/home/1" style={{ color: "#93c5fd" }}>Back to Home 1</Link>
    </main>
  );
}
