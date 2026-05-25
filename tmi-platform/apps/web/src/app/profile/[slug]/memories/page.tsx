"use client";

import { useMemo, useState } from "react";
import MemoryWall from "@/components/memory/MemoryWall";
import HolographicCard from "@/components/memory/HolographicCard";
import MemoryItemModal from "@/components/hub/MemoryItemModal";
import type { MemoryItem, ProLegacyItem } from "@/types/memory";

// Seed memories for demo — in production: fetch from /api/profile/[slug]/memories
function getSeedMemories(slug: string): MemoryItem[] {
  return [
    {
      id: `ticket-1-${slug}`,
      kind: "ticket",
      title: "World Dance Party",
      subtitle: "TMI Live Venue",
      date: "June 21, 2026",
      eventTitle: "World Dance Party",
      venueName: "TMI Live Venue",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
    {
      id: `polaroid-1-${slug}`,
      kind: "polaroid",
      title: "Friday Night Cypher",
      date: "May 30, 2026",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
    {
      id: `nft-1-${slug}`,
      kind: "nft",
      title: "Big Ace — Crown Season #12",
      subtitle: "Hip-Hop · Edition 1 of 100",
      date: "May 15, 2026",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
    {
      id: `prize-1-${slug}`,
      kind: "prize",
      title: "Song Challenge Winner",
      subtitle: "$250 prize — Hip-Hop Round",
      date: "May 10, 2026",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
    {
      id: `ticket-2-${slug}`,
      kind: "ticket",
      title: "Monday Night Stage",
      subtitle: "Main Lobby",
      date: "May 6, 2026",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
    {
      id: `badge-1-${slug}`,
      kind: "badge",
      title: "First Battle Completed",
      subtitle: "Achievement Badge",
      date: "April 29, 2026",
      visibility: "public",
      capturedAt: new Date().toISOString(),
    },
  ];
}

// Seed pro ledger items — in production: fetch from /api/profile/[slug]/ledger
const SEED_LEDGER: ProLegacyItem[] = [
  { id: "l1", userId: "demo", kind: "sponsor-gift", title: "Sponsored World Dance Party", eventTitle: "World Dance Party", metricImpact: { totalPaidOut: 500, audienceReached: 5800 }, verified: true, showcaseMode: true, displayMode: "holographic-card", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "l2", userId: "demo", kind: "promoter-win", title: "Sold Out: Monday Night Stage", eventTitle: "Monday Night Stage", metricImpact: { ticketsSold: 420, conversionRate: 84 }, verified: true, showcaseMode: true, displayMode: "holographic-card", createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "l3", userId: "demo", kind: "advertiser-milestone", title: "Campaign: Hip-Hop June Drop", eventTitle: "Hip-Hop June Drop", metricImpact: { audienceReached: 12400, engagementRate: 22 }, verified: true, showcaseMode: true, displayMode: "holographic-card", createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
];

type Tab = "memories" | "ledger";

export default function ProfileMemoriesPage({ params }: { params: { slug: string } }) {
  const memories = useMemo(() => getSeedMemories(params.slug), [params.slug]);
  const [tab, setTab] = useState<Tab>("memories");

  const tickets = memories.filter((m) => m.kind === "ticket");
  const polaroids = memories.filter((m) => m.kind === "polaroid");
  const other = memories.filter((m) => m.kind !== "ticket" && m.kind !== "polaroid");

  const tabBtn = (t: Tab, label: string): React.ReactElement => (
    <button
      onClick={() => setTab(t)}
      style={{ padding: "7px 18px", background: tab === t ? "rgba(255,45,170,0.12)" : "transparent", border: `1px solid ${tab === t ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#050510,#0a0820)", borderBottom: "1px solid rgba(255,45,170,0.12)", padding: "32px 24px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.45em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>
            MEMORY WALL · @{params.slug}
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Experiences &amp; Memories
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {tabBtn("memories", "📸 MEMORIES")}
            {tabBtn("ledger", "💼 LEGACY LEDGER")}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {tab === "memories" ? (
          <>
            {tickets.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#00FF88", fontWeight: 800, marginBottom: 16 }}>🎟️ TICKETS &amp; EVENTS</div>
                <MemoryWall items={tickets} title="TICKETS" />
              </section>
            )}
            {polaroids.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>📸 CAPTURED MOMENTS</div>
                <MemoryWall items={polaroids} title="POLAROIDS" />
              </section>
            )}
            {other.length > 0 && (
              <section>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>🏆 COLLECTIBLES &amp; ACHIEVEMENTS</div>
                <MemoryWall items={other} title="COLLECTIBLES" />
              </section>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(0,200,255,0.7)", fontWeight: 800, marginBottom: 6 }}>PRO LEGACY LEDGER</div>
            <p style={{ margin: "0 0 24px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Verified impact records generated automatically from sponsorships, ticket sales, and campaigns. Read-only — created by the platform.
            </p>
            {SEED_LEDGER.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {SEED_LEDGER.map((item) => <HolographicCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
                <p style={{ fontSize: 13, margin: 0 }}>No verified impact records yet. Sponsor an event or promote a show to start building your ledger.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global modal — mounts here, open from anywhere via memoryModalStore */}
      <MemoryItemModal />
    </main>
  );
}
