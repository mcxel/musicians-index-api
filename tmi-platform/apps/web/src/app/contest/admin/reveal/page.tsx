import { type Metadata } from "next";

export const metadata: Metadata = { title: "Reveal Controls | Contest Admin | TMI" };

export default async function RevealAdminPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "48px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#ff6b1a", margin: "0 0 8px", textTransform: "uppercase" }}>
            Contest Admin
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px" }}>Reveal Controls</h1>
          <p style={{ color: "rgba(255,255,255,.4)", margin: 0 }}>
            Configure winner reveal behavior for the active contest season.
            All changes are logged. Season lock prevents changes during live events.
          </p>
        </div>
      </div>
    </main>
  );
}