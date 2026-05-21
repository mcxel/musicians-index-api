import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compliance" };

export default function CompliancePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>✅ Compliance</h1>
      <p style={{ color: "#8080a0" }}>Understand your rights and obligations as a creator.</p>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#c0c0d0" }}>Topics covered</h2>
        <ul style={{ lineHeight: 2, color: "#a0a0b0" }}>
          <li>DMCA takedowns and counter-notices</li>
          <li>Performance Rights Organizations (PROs)</li>
          <li>Work-for-hire vs. independent contractor status</li>
          <li>Streaming royalty compliance</li>
          <li>Label deal review checklist</li>
          <li>Union agreements (AFM, SAG-AFTRA)</li>
        </ul>
      </section>
    </main>
  );
}
