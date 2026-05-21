import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>📄 Documents</h1>
      <p style={{ color: "#8080a0" }}>Upload and review contracts, agreements, and notices.</p>
      <div
        style={{
          padding: "2rem",
          border: "1px dashed #2a2a3f",
          borderRadius: "0.75rem",
          textAlign: "center",
          color: "#606070",
        }}
      >
        No documents uploaded yet.
      </div>
    </main>
  );
}
