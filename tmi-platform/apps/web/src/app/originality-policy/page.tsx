import Link from "next/link";

export default function OriginalityPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0915", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Originality Policy</h1>
      <p style={{ opacity: 0.85 }}>
        This policy route is active as a fallback and links to the primary moderation and editorial standards.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/admin/moderation" style={{ color: "#facc15" }}>Moderation</Link>
        <Link href="/editorial" style={{ color: "#67e8f9" }}>Editorial</Link>
      </div>
    </main>
  );
}
