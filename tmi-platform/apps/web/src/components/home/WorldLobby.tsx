"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getWorldVenues,
  getLiveVenues,
  getTotalViewers,
  tickWorldRuntime,
  WORLD_VENUES,
  type WorldVenue,
} from "@/lib/world/WorldRuntime";
import AudienceScene from "@/components/live/AudienceScene";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";

const BPM_MAP: Record<string, number> = {
  concert: 120, battle: 145, cypher: 130, "monday-stage": 118,
  "dirty-dozens": 110, "world-dance-party": 138, challenge: 125, "fan-live": 100,
};

function DanceFloorPreview({ color, large }: { color: string; large?: boolean }) {
  const EMOJIS = ["🕺","💃","🔥","🎧","⚡","👑","🌊","✨"];
  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #0a0010, ${color}18)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: large ? 12 : 6, padding: large ? 20 : 8 }}>
      <div style={{ fontSize: large ? 9 : 7, letterSpacing: "0.2em", color, fontWeight: 900, marginBottom: 4 }}>NO SEATING — DANCE FLOOR</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: large ? 8 : 4 }}>
        {Array.from({ length: large ? 24 : 16 }).map((_, i) => (
          <div key={i} style={{ fontSize: large ? 20 : 14, textAlign: "center", animation: `worldLobbyFloat ${1 + (i % 3) * 0.4}s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.2}s` }}>
            {EMOJIS[i % EMOJIS.length]}
          </div>
        ))}
      </div>
      {large && <div style={{ fontSize: 9, color: `${color}99`, letterSpacing: "0.1em" }}>DJ BOOTH · VIDEO WALLS · LIGHTING</div>}
    </div>
  );
}

function LiveDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
      background: "#FF2020", marginRight: 5, flexShrink: 0,
      animation: pulse ? "worldLobbyBlink 1s step-end infinite" : "none",
    }} />
  );
}

function VenueCard({ venue, idx, onEnter }: { venue: WorldVenue; idx: number; onEnter: (v: WorldVenue) => void }) {
  const [hovered, setHovered] = useState(false);
  const [viewers, setViewers] = useState(venue.viewers);

  useEffect(() => {
    const id = setInterval(() => {
      setViewers(v => Math.max(5, v + Math.floor((Math.random() - 0.35) * 30)));
    }, 3000 + idx * 400);
    return () => clearInterval(id);
  }, [idx]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnter(venue)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: 14,
        border: `1.5px solid ${hovered ? venue.color : venue.color + "33"}`,
        background: hovered ? `${venue.color}10` : "rgba(255,255,255,0.02)",
        overflow: "hidden", transition: "all 0.18s ease",
        boxShadow: hovered ? `0 0 24px ${venue.color}33` : "none",
      }}
    >
      {/* Mini 3D audience preview */}
      <div style={{ height: 120, position: "relative", overflow: "hidden", background: "#050510" }}>
        {venue.usesDanceFloor ? (
          <DanceFloorPreview color={venue.color} />
        ) : (
          <AudienceScene
            venue={venue.venueIndex}
            watcherCount={venue.capacity}
            view="fan"
            accentColor={venue.color}
            bpm={BPM_MAP[venue.eventType] ?? 120}
            screenLabel={venue.label}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #050510 100%)" }} />

        {/* Live badge */}
        {venue.isLive && (
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", background: "rgba(0,0,0,0.75)", borderRadius: 4, padding: "2px 8px", backdropFilter: "blur(4px)" }}>
            <LiveDot />
            <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>LIVE</span>
          </div>
        )}

        {/* Viewer count */}
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.75)", borderRadius: 4, padding: "2px 8px", backdropFilter: "blur(4px)", fontSize: 7, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
          {viewers.toLocaleString()} watching
        </div>

        {/* Dance floor flag */}
        {venue.usesDanceFloor && (
          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: `${venue.color}CC`, color: "#000", fontSize: 7, fontWeight: 900, padding: "2px 10px", borderRadius: 20, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            NO SEATING — DANCE FLOOR ONLY
          </div>
        )}
      </div>

      {/* Card info */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>{venue.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: venue.isLive ? venue.color : "#fff", letterSpacing: "0.04em" }}>{venue.label}</div>
            {venue.currentArtist && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{venue.currentArtist}</div>
            )}
          </div>
        </div>
        {venue.currentEvent && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{venue.currentEvent}</div>
        )}

        <div style={{
          display: "block", textAlign: "center", padding: "7px 0",
          borderRadius: 8, background: hovered ? venue.color : `${venue.color}22`,
          color: hovered ? "#000" : venue.color, fontSize: 9, fontWeight: 900,
          letterSpacing: "0.1em", transition: "all 0.15s",
        }}>
          {venue.isLive ? "▶ ENTER VENUE" : "📅 VIEW SCHEDULE"}
        </div>
      </div>
    </div>
  );
}

function FeaturedVenue({ venue }: { venue: WorldVenue }) {
  const router = useRouter();
  const [viewers, setViewers] = useState(venue.viewers);

  useEffect(() => {
    const id = setInterval(() => {
      setViewers(v => Math.max(5, v + Math.floor((Math.random() - 0.3) * 60)));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `2px solid ${venue.color}55`, marginBottom: 20 }}>
      {/* Full arena preview */}
      <div style={{ height: 260, position: "relative" }}>
        {venue.usesDanceFloor ? (
          <DanceFloorPreview color={venue.color} large />
        ) : (
          <AudienceScene
            venue={venue.venueIndex}
            watcherCount={venue.capacity}
            view="fan"
            accentColor={venue.color}
            bpm={BPM_MAP[venue.eventType] ?? 120}
            screenLabel={venue.currentEvent ?? venue.label}
            screenSubLabel={venue.currentArtist}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #050510 100%)" }} />

        <div style={{ position: "absolute", top: 12, left: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <LiveDot />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.14em" }}>LIVE NOW</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>{viewers.toLocaleString()} watching</span>
        </div>

        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 8, fontWeight: 900, color: venue.color, background: `${venue.color}22`, border: `1px solid ${venue.color}44`, padding: "3px 12px", borderRadius: 20, letterSpacing: "0.1em" }}>
          FEATURED
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: venue.color, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 4 }}>{venue.label.toUpperCase()}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{venue.currentEvent ?? venue.label}</div>
          {venue.currentArtist && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>featuring {venue.currentArtist}</div>
          )}
          {venue.usesDanceFloor && (
            <div style={{ marginTop: 6, fontSize: 9, color: venue.color, fontWeight: 800 }}>★ NO SEATING — DANCE FLOOR ONLY</div>
          )}
        </div>
        <button
          onClick={() => router.push(`${venue.route}?autoSeat=1`)}
          style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${venue.color}, ${venue.color}AA)`, color: "#000", fontWeight: 900, fontSize: 12, cursor: "pointer", letterSpacing: "0.1em", whiteSpace: "nowrap" }}
        >
          ENTER NOW →
        </button>
      </div>
    </div>
  );
}

export default function WorldLobby() {
  const router = useRouter();
  const [venues, setVenues] = useState(() => getWorldVenues());
  const [totalViewers, setTotalViewers] = useState(getTotalViewers);
  const [filter, setFilter] = useState<"all" | "live" | "battle" | "cypher" | "concert" | "dance">("all");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      tickWorldRuntime();
      setVenues(getWorldVenues());
      setTotalViewers(getTotalViewers());
    }, 3000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const featuredVenue = venues.find(v => v.id === "world-concert") ?? venues[0];

  const filteredVenues = venues.filter(v => {
    if (filter === "all") return true;
    if (filter === "live") return v.isLive;
    if (filter === "battle") return v.eventType === "battle";
    if (filter === "cypher") return v.eventType === "cypher";
    if (filter === "concert") return v.eventType === "concert";
    if (filter === "dance") return v.usesDanceFloor;
    return true;
  });

  function enterVenue(venue: WorldVenue) {
    router.push(`${venue.route}?autoSeat=1`);
  }

  const FILTERS = [
    { id: "all", label: "ALL WORLDS" },
    { id: "live", label: "🔴 LIVE NOW" },
    { id: "battle", label: "⚔️ BATTLES" },
    { id: "cypher", label: "🎤 CYPHERS" },
    { id: "concert", label: "🌐 CONCERTS" },
    { id: "dance", label: "💃 DANCE" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes worldLobbyBlink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes worldLobbyFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
      `}</style>

      {/* World header */}
      <div style={{ textAlign: "center", padding: "32px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 700 }}>THE MUSICIAN'S INDEX</div>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#FFD700,#FF2DAA,#00FFFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          THE WORLD IS LIVE
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { label: "VENUES LIVE", value: venues.filter(v => v.isLive).length.toString(), color: "#FF2020" },
            { label: "TOTAL WATCHING", value: totalViewers.toLocaleString(), color: "#FFD700" },
            { label: "ARENAS OPEN", value: venues.length.toString(), color: "#00FFFF" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>

        {/* Featured venue */}
        <FeaturedVenue venue={featuredVenue} />

        {/* Ad */}
        <UnifiedAdSlot venue="home-1" slotKey="homepageBanner" format="horizontal" accentColor="#FFD700" style={{ marginBottom: 20 }} />

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)} style={{
              padding: "5px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, cursor: "pointer", border: "none",
              background: filter === f.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              color: filter === f.id ? "#fff" : "rgba(255,255,255,0.4)",
              outline: filter === f.id ? "1px solid rgba(255,255,255,0.25)" : "none",
              letterSpacing: "0.08em",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Venue grid — ALL WORLDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          {filteredVenues.map((venue, idx) => (
            <VenueCard key={venue.id} venue={venue} idx={idx} onEnter={enterVenue} />
          ))}
        </div>

        {/* Scroll prompt */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/live/rooms" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em" }}>
            📡 FULL BILLBOARD WALL — ALL {WORLD_VENUES.length} LIVE ROOMS →
          </Link>
        </div>

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { href: "/battles", label: "⚔️ BATTLES", color: "#FF2DAA" },
            { href: "/cypher", label: "🎤 CYPHERS", color: "#00FFFF" },
            { href: "/rooms/world-dance-party", label: "💃 DANCE PARTY", color: "#AA2DFF" },
            { href: "/magazine", label: "📖 MAGAZINE", color: "#FFD700" },
            { href: "/rankings", label: "👑 RANKINGS", color: "#00FF88" },
            { href: "/live/go", label: "🔴 GO LIVE", color: "#FF6B35" },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: n.color, border: `1px solid ${n.color}30`, textDecoration: "none", background: `${n.color}08`, letterSpacing: "0.08em" }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
