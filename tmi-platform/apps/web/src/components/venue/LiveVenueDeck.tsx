"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BillboardPortalCard from "@/components/venue/BillboardPortalCard";
import { billboardPortalEngine, type BillboardPortal } from "@/lib/live/BillboardPortalEngine";
import { venuePresenceEngine } from "@/lib/live/VenuePresenceEngine";
import { roomEnergyEngine } from "@/lib/live/RoomEnergyEngine";
import { audienceVisibilityEngine } from "@/lib/live/AudienceVisibilityEngine";
import { botCrowdFillEngine } from "@/lib/live/BotCrowdFillEngine";
import { seatGridEngine } from "@/lib/live/SeatGridEngine";
import "@/styles/tmiTypography.css";

// Seed some demo rooms on first render
function seedDemoRooms() {
  const demos = [
    { roomId: "battle-001", roomType: "battle" as const, title: "Crown Night Vol.12", genre: "Hip-Hop", hostName: "DJ Phantom", hostImageUrl: "/avatars/host-01.png", battleStatus: "VOTING OPEN" },
    { roomId: "cypher-001", roomType: "cypher" as const, title: "Monday Cypher Open Mic", genre: "Trap", hostName: "Wavetek", hostImageUrl: "/avatars/host-02.png" },
    { roomId: "concert-001", roomType: "concert" as const, title: "Zuri Bloom Live Session", genre: "Afrobeats", hostName: "Zuri Bloom", hostImageUrl: "/avatars/host-03.png" },
    { roomId: "karaoke-001", roomType: "karaoke" as const, title: "Late Night Karaoke", genre: "Pop", hostName: "Neon Vibe", hostImageUrl: "/avatars/host-04.png" },
    { roomId: "interview-001", roomType: "interview" as const, title: "TMI Artist Spotlight", genre: "Industry", hostName: "TMI Host", hostImageUrl: "/avatars/host-05.png" },
    { roomId: "battle-002", roomType: "battle" as const, title: "Dirty Dozens Championship", genre: "Hip-Hop", hostName: "Crown Mic", hostImageUrl: "/avatars/host-01.png", battleStatus: "QUEUE OPEN" },
  ];

  demos.forEach((d, i) => {
    const occupancy = 15 + i * 12;
    const energy = 30 + i * 11;
    const energyLabel = energy > 75 ? "ON FIRE" : energy > 50 ? "HOT" : energy > 30 ? "WARMING" : "COLD";

    // Create presence room
    venuePresenceEngine.createRoom({
      roomId: d.roomId,
      roomType: d.roomType,
      title: d.title,
      genre: d.genre,
      hostUserId: `host-${i}`,
      capacity: 100,
      isPublic: true,
    });

    // Init energy
    roomEnergyEngine.initRoom(d.roomId);

    // Init seat grid + bot fill
    audienceVisibilityEngine.initGrid(d.roomId, 6, 10);
    botCrowdFillEngine.activate({
      roomId: d.roomId,
      minimumFillRatio: 0.35,
      minimumRealThreshold: 5,
      maxBotCount: 30,
    });

    // Register billboard portal
    billboardPortalEngine.upsert({
      roomId: d.roomId,
      roomType: d.roomType,
      title: d.title,
      genre: d.genre,
      hostName: d.hostName,
      hostImageUrl: d.hostImageUrl,
      occupancy,
      capacity: 100,
      energyScore: energy,
      energyLabel,
      tipsTotal: i * 23.5,
      battleStatus: d.battleStatus,
      isPublic: true,
      isJoinable: true,
      tags: [d.genre.toLowerCase(), d.roomType],
    });
  });
}

let seeded = false;

export default function LiveVenueDeck() {
  const [portals, setPortals] = useState<BillboardPortal[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!seeded) {
      seedDemoRooms();
      seeded = true;
    }
    setPortals(billboardPortalEngine.getPublicPortals());
  }, []);

  const filters = ["all", "battle", "cypher", "concert", "karaoke", "interview"];
  const filtered =
    filter === "all"
      ? portals
      : portals.filter((p) => p.roomType === filter);

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <div className="tmi-hud-label" style={{ fontSize: 9, color: "#00FFFF" }}>
          LIVE VENUE DISCOVERY
        </div>
        <h2 className="tmi-masthead" style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", margin: 0 }}>
          OPEN ROOMS
        </h2>
        <p className="tmi-body-copy" style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          Click any billboard to join instantly. Performer feeds live. Audience visible. No empty rooms.
        </p>
      </header>

      {/* Filter strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="tmi-button-text"
            style={{
              padding: "6px 14px",
              fontSize: 9,
              borderRadius: 6,
              border: filter === f ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
              background: filter === f ? "rgba(0,255,255,0.12)" : "transparent",
              color: filter === f ? "#00FFFF" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Portal grid */}
      {filtered.length === 0 ? (
        <div
          className="tmi-body-copy"
          style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.35)" }}
        >
          No live rooms found. Check back soon.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((portal) => (
            <BillboardPortalCard key={portal.portalId} portal={portal} size="md" />
          ))}
        </div>
      )}

      <footer style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/rooms/create"
          className="tmi-button-text"
          style={{ color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 8, padding: "9px 18px", fontSize: 10, textDecoration: "none" }}
        >
          HOST A ROOM →
        </Link>
        <Link
          href="/battles/live"
          className="tmi-button-text"
          style={{ color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "9px 18px", fontSize: 10, textDecoration: "none" }}
        >
          JOIN BATTLE →
        </Link>
      </footer>
    </section>
  );
}
