import Link from "next/link";
import type { Metadata } from "next";
import ExploreDiscoveryClient from "@/components/explore/ExploreDiscoveryClient";

export const metadata: Metadata = {
  title: "Explore | TMI",
  description: "Explore TMI — live lobbies, radio, games, battles, and official events.",
};

export default function ExplorePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>DISCOVER</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Explore TMI</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto" }}>
          Every live lobby, battle, cypher, official event, and radio room — launched through the Experience Operating System.
        </p>
      </section>

      <ExploreDiscoveryClient role="fan" />

      <section style={{ textAlign: "center", marginTop: 44 }}>
        <Link href="/search" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FFFF", borderRadius: 7, textDecoration: "none" }}>
          SEARCH PERFORMERS →
        </Link>
      </section>
    </main>
  );
}
