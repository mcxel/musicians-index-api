import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0915", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Community Guidelines</h1>
      <p style={{ opacity: 0.85 }}>
        This is the safe fallback guidelines route. Full policy content is currently served in Terms and Safety pages.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/terms" style={{ color: "#facc15" }}>Open Terms</Link>
        <Link href="/safety" style={{ color: "#67e8f9" }}>Open Safety</Link>
      </div>
    </main>
  );
}
