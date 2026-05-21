import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cases" };

export default function CasesPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>📁 Cases</h1>
      <p style={{ color: "#8080a0" }}>Track and manage your open legal matters here.</p>
      {/* TODO: Fetch cases from /api/cases and render list */}
      <div
        style={{
          padding: "2rem",
          border: "1px dashed #2a2a3f",
          borderRadius: "0.75rem",
          textAlign: "center",
          color: "#606070",
        }}
      >
        No open cases. Start by asking a question in Law Bubble.
      </div>
    </main>
  );
}
