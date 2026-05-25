"use client";

import { useMemo } from "react";
import MemoryWall from "@/components/memory/MemoryWall";
import MemoryItemModal from "@/components/hub/MemoryItemModal";
import type { MemoryItem } from "@/types/memory";

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

export default function ProfileMemoriesPage({ params }: { params: { slug: string } }) {
  const memories = useMemo(() => getSeedMemories(params.slug), [params.slug]);

  const tickets = memories.filter((m) => m.kind === "ticket");
  const polaroids = memories.filter((m) => m.kind === "polaroid");
  const other = memories.filter((m) => m.kind !== "ticket" && m.kind !== "polaroid");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#050510,#0a0820)", borderBottom: "1px solid rgba(255,45,170,0.12)", padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.45em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>
            MEMORY WALL · @{params.slug}
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Experiences &amp; Memories
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {memories.length} items &nbsp;·&nbsp; Tickets, Polaroids, NFTs, Prizes
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Upcoming / past tickets */}
        {tickets.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#00FF88", fontWeight: 800, marginBottom: 16 }}>
              🎟️ TICKETS &amp; EVENTS
            </div>
            <MemoryWall items={tickets} title="TICKETS" />
          </section>
        )}

        {/* Polaroids */}
        {polaroids.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>
              📸 CAPTURED MOMENTS
            </div>
            <MemoryWall items={polaroids} title="POLAROIDS" />
          </section>
        )}

        {/* NFTs, prizes, badges */}
        {other.length > 0 && (
          <section>
            <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>
              🏆 COLLECTIBLES &amp; ACHIEVEMENTS
            </div>
            <MemoryWall items={other} title="COLLECTIBLES" />
          </section>
        )}
      </div>

      {/* Global modal — mounts here, open from anywhere via memoryModalStore */}
      <MemoryItemModal />
    </main>
  );
}
