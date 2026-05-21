import type { Metadata } from "next";
import { LawBubbleWidget } from "@/components/law-bubble/LawBubbleWidget";

export const metadata: Metadata = { title: "Law Bubble" };

export default function LawBubblePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>💬 Law Bubble</h1>
      <p style={{ color: "#8080a0", marginBottom: "2rem" }}>
        Ask a legal question. Credit-based. Fast. Private.
      </p>
      <LawBubbleWidget userId="guest" fullPage />
    </main>
  );
}
