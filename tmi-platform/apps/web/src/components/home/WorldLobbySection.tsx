"use client";

/**
 * WorldLobbySection — The Live World below the Magazine cover on Home 1.
 *
 * Structure:
 *   ┌─────────────────────────────────────────────────┐
 *   │  [Magazine Hero / Home1CoverPage — above]       │
 *   ├─────────────────────────────────────────────────┤
 *   │  LIVE WORLD LOBBY        ← this component       │
 *   │  ├─ World stats bar                             │
 *   │  ├─ Featured venue (full arena preview)         │
 *   │  ├─ All venue cards with revenue hooks          │
 *   │  │    Tip · Book · Subscribe · Ticket           │
 *   │  ├─ Billboard wall link                         │
 *   │  └─ Discovery rails                             │
 *   └─────────────────────────────────────────────────┘
 */

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getWorldVenues,
  getTotalViewers,
  tickWorldRuntime,
  WORLD_VENUES,
  type WorldVenue,
} from "@/lib/world/WorldRuntime";
import AudienceScene from "@/components/live/AudienceScene";

const BPM_MAP: Record<string, number> = {
  concert: 120, battle: 145, cypher: 130, "monday-stage": 118,
  "dirty-dozens": 110, "world-dance-party": 138, challenge: 125, "fan-live": 100,
  "special": 115,
};

// ── Revenue hook buttons per venue ──────────────────────────────────────────
function RevenueHooks({ venue }: { venue: WorldVenue }) {
  const hooks: { label: string; href: string; primary?: boolean }[] = [];

  if (venue.isLive) {
    hooks.push({ label: "💰 Tip", href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+for+${encodeURIComponent(venue.label)}&mode=payment` });
  }
  if (venue.eventType === "concert" || venue.eventType === "special" || venue.eventType === "monday-stage") {
    hooks.push({ label: "🎫 Ticket", href: `/tickets?event=${venue.id}`, primary: true });
    hooks.push({ label: "📅 Book", href: `/venue/${venue.id}/book` });
  }
  if (venue.eventType === "battle" || venue.eventType === "cypher") {
    hooks.push({ label: "🎫 Ticket", href: `/tickets?event=${venue.id}`, primary: true });
    hooks.push({ label: "🤝 Sponsor", href: `/sponsor/battles?venue=${venue.id}` });
  }
  hooks.push({ label: "👑 Subscribe", href: "/subscribe" });

  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
      {hooks.map(h => (
        <Link
          key={h.label}
          href={h.href}
          style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 8, fontWeight: 800,
            textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap",
            background: h.primary ? venue.color : "rgba(255,255,255,0.05)",
            color: h.primary ? "#000" : "rgba(255,255,255,0.6)",
            border: h.primary ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {h.label}
        </Link>
      ))}
    </div>
  );
}

// ── Dance floor preview (no AudienceScene — World Dance Party exception) ────
function DanceFloorPreview({ color }: { color: string }) {
  const EMOJIS = ["🕺","💃","🔥","🎧","⚡","👑","🌊","✨","🙌","🎶","💥","🌈"];
  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #0a0010, ${color}18)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 10 }}>
      <div style={{ fontSize: 7, letterSpacing: "0.2em", color, fontWeight: 900, marginBottom: 4 }}>NO SEATING — DANCE FLOOR ONLY</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ fontSize: 16, textAlign: "center", animation: `wlsBob ${1 + (i % 3) * 0.4}s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.2}s` }}>
            {EMOJIS[i % EMOJIS.length]}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Venue expand modal ───────────────────────────────────────────────────────
function VenueModal({ venue, onClose }: { venue: WorldVenue; onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(2,3,10,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", width: "100%", maxWidth: 580, borderRadius: 20, overflow: "hidden", background: "#080C1A", border: `2px solid ${venue.color}55`, boxShadow: `0 0 60px ${venue.color}33, 0 30px 80px rgba(0,0,0,0.8)` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 14 }}>✕</button>

        {/* Arena preview */}
        <div style={{ height: 240, position: "relative", overflow: "hidden" }}>
          {venue.usesDanceFloor ? (
            <div style={{ height: "100%", background: `linear-gradient(135deg, #0a0010, ${venue.color}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>💃</div>
          ) : (
            <AudienceScene venue={venue.venueIndex} watcherCount={venue.capacity} view="fan" accentColor={venue.color} bpm={BPM_MAP[venue.eventType] ?? 120} screenLabel={venue.currentEvent ?? venue.label} screenSubLabel={venue.currentArtist} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #080C1A 100%)" }} />
          {/* Live badge */}
          <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 5, alignItems: "center", background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "4px 10px", backdropFilter: "blur(4px)" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: venue.isLive ? "#FF2020" : "#FFD700", animation: venue.isLive ? "wlsBlink 1s step-end infinite" : "none", flexShrink: 0 }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>{venue.isLive ? "LIVE NOW" : "COMING SOON"}</span>
          </div>
          <div style={{ position: "absolute", top: 12, right: 50, fontSize: 8, fontWeight: 900, color: venue.color, background: `${venue.color}22`, border: `1px solid ${venue.color}44`, padding: "4px 12px", borderRadius: 20 }}>{venue.emoji} {venue.label}</div>
        </div>

        {/* Details */}
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ fontSize: 8, color: venue.color, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 4 }}>{venue.label.toUpperCase()}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{venue.currentEvent ?? venue.label}</div>
          {venue.currentArtist && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>featuring {venue.currentArtist}</div>}
          {venue.usesDanceFloor && <div style={{ fontSize: 9, color: venue.color, fontWeight: 800, marginBottom: 8 }}>★ NO SEATING — DANCE FLOOR ONLY</div>}

          {/* Capacity / format */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>🏟️ Capacity: <span style={{ color: "#fff", fontWeight: 700 }}>{venue.capacity.toLocaleString()}</span></div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>👁 Watching: <span style={{ color: venue.color, fontWeight: 700 }}>{venue.viewers.toLocaleString()}</span></div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>🎭 Format: <span style={{ color: "#fff", fontWeight: 700 }}>{venue.eventType}</span></div>
          </div>

          {/* Revenue hooks */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "🎫 Buy Ticket", href: `/tickets?event=${venue.id}`, primary: true },
              { label: "💰 Tip Artist", href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip&mode=payment` },
              { label: "🤝 Sponsor", href: `/sponsor/battles?venue=${venue.id}` },
              { label: "👑 Subscribe", href: "/subscribe" },
            ].map(h => (
              <Link key={h.label} href={h.href} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 9, fontWeight: 900, textDecoration: "none", letterSpacing: "0.06em", background: h.primary ? venue.color : "rgba(255,255,255,0.06)", color: h.primary ? "#000" : "rgba(255,255,255,0.7)", border: h.primary ? "none" : "1px solid rgba(255,255,255,0.12)" }}>
                {h.label}
              </Link>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push(`${venue.route}?autoSeat=1`)}
              style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${venue.color}, ${venue.color}AA)`, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer", letterSpacing: "0.1em" }}
            >
              {venue.isLive ? "▶ ENTER NOW" : "📅 VIEW SCHEDULE"} →
            </button>
            <button onClick={onClose} style={{ padding: "13px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single venue card ────────────────────────────────────────────────────────
function VenueCard({ venue, idx, onExpand }: { venue: WorldVenue; idx: number; onExpand: (v: WorldVenue) => void }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [viewers, setViewers] = useState(venue.viewers);

  useEffect(() => {
    const id = setInterval(() => {
      setViewers(v => Math.max(5, v + Math.floor((Math.random() - 0.38) * 28)));
    }, 3000 + idx * 300);
    return () => clearInterval(id);
  }, [idx]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 14,
        border: `1.5px solid ${hovered ? venue.color : venue.color + "28"}`,
        background: hovered ? `${venue.color}0C` : "rgba(255,255,255,0.015)",
        overflow: "hidden", transition: "all 0.18s ease",
        boxShadow: hovered ? `0 0 20px ${venue.color}28` : "none",
      }}
    >
      {/* Mini arena preview — click to expand */}
      <div style={{ height: 110, position: "relative", overflow: "hidden", background: "#050510", cursor: "pointer" }} onClick={() => onExpand(venue)}>
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, #050510 100%)" }} />

        {/* Expand hint */}
        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 7px", fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.06em" }}>⤢ EXPAND</div>

        {/* Live / Soon badge */}
        <div style={{ position: "absolute", top: 7, left: 8, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 7px", backdropFilter: "blur(4px)" }}>
          <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: venue.isLive ? "#FF2020" : "#FFD700", animation: venue.isLive ? "wlsBlink 1s step-end infinite" : "none", flexShrink: 0 }} />
          <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>{venue.isLive ? "LIVE" : "SOON"}</span>
        </div>
        <div style={{ position: "absolute", top: 7, right: 8, fontSize: 7, color: "rgba(255,255,255,0.55)", background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4 }}>
          {viewers.toLocaleString()} 👁
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{venue.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: venue.isLive ? venue.color : "#fff", lineHeight: 1.2 }}>{venue.label}</div>
            {venue.currentEvent && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{venue.currentEvent}</div>
            )}
          </div>
        </div>

        {/* Revenue hooks — Tip / Book / Subscribe / Ticket / Sponsor */}
        <RevenueHooks venue={venue} />

        {/* Enter button */}
        <button
          onClick={() => router.push(`${venue.route}?autoSeat=1`)}
          style={{
            marginTop: 8, width: "100%", padding: "7px 0", borderRadius: 8, border: "none",
            background: hovered ? venue.color : `${venue.color}20`,
            color: hovered ? "#000" : venue.color, fontSize: 9, fontWeight: 900,
            cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.15s",
          }}
        >
          {venue.isLive ? "▶ ENTER + SIT" : "📅 SCHEDULE"}
        </button>
      </div>
    </div>
  );
}

// ── Featured venue (top of section) ─────────────────────────────────────────
function FeaturedVenueBanner({ venue }: { venue: WorldVenue }) {
  const router = useRouter();
  const [viewers, setViewers] = useState(venue.viewers);

  useEffect(() => {
    const id = setInterval(() => setViewers(v => Math.max(5, v + Math.floor((Math.random() - 0.3) * 55))), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `2px solid ${venue.color}44`, marginBottom: 20 }}>
      {/* Arena preview */}
      <div style={{ height: 220, position: "relative" }}>
        {venue.usesDanceFloor ? (
          <div style={{ height: "100%", background: `linear-gradient(135deg, #0a0010, ${venue.color}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>💃</div>
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

        <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#FF2020", animation: "wlsBlink 1s step-end infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>LIVE NOW — {viewers.toLocaleString()} watching</span>
        </div>
        <div style={{ position: "absolute", top: 12, right: 14, fontSize: 8, fontWeight: 900, color: venue.color, background: `${venue.color}22`, border: `1px solid ${venue.color}44`, padding: "3px 10px", borderRadius: 20 }}>
          FEATURED VENUE
        </div>
      </div>

      <div style={{ padding: "14px 18px 16px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 8, color: venue.color, fontWeight: 800, letterSpacing: "0.22em", marginBottom: 4 }}>{venue.label.toUpperCase()}</div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{venue.currentEvent ?? venue.label}</div>
          {venue.currentArtist && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{venue.currentArtist}</div>}
          {venue.usesDanceFloor && <div style={{ marginTop: 6, fontSize: 9, color: venue.color, fontWeight: 800 }}>★ NO SEATING — DANCE FLOOR ONLY</div>}

          {/* All revenue hooks on featured */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {[
              { label: "🎫 Buy Ticket", href: `/tickets?event=${venue.id}`, primary: true },
              { label: "💰 Tip Artist", href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip&mode=payment` },
              { label: "🤝 Sponsor Slot", href: `/sponsor/battles?venue=${venue.id}` },
              { label: "👑 Subscribe", href: "/subscribe" },
              { label: "🛒 Merch", href: "/store" },
            ].map(h => (
              <Link key={h.label} href={h.href} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 9, fontWeight: 900, textDecoration: "none", letterSpacing: "0.06em", background: h.primary ? venue.color : "rgba(255,255,255,0.06)", color: h.primary ? "#000" : "rgba(255,255,255,0.7)", border: h.primary ? "none" : "1px solid rgba(255,255,255,0.12)" }}>
                {h.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={() => router.push(`${venue.route}?autoSeat=1`)}
          style={{ padding: "13px 28px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${venue.color}, ${venue.color}AA)`, color: "#000", fontWeight: 900, fontSize: 12, cursor: "pointer", letterSpacing: "0.1em", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          ENTER NOW →
        </button>
      </div>
    </div>
  );
}

// ── Main section export ──────────────────────────────────────────────────────
export default function WorldLobbySection() {
  const [venues, setVenues] = useState(() => getWorldVenues());
  const [totalViewers, setTotalViewers] = useState(getTotalViewers);
  const [filter, setFilter] = useState<"all" | "live" | "battle" | "cypher" | "concert">("all");
  const [expandedVenue, setExpandedVenue] = useState<WorldVenue | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleExpand = useCallback((v: WorldVenue) => setExpandedVenue(v), []);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      tickWorldRuntime();
      setVenues(getWorldVenues());
      setTotalViewers(getTotalViewers());
    }, 3000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const featuredVenue = venues.find(v => v.id === "world-concert") ?? venues[0];
  const filtered = venues.filter(v => {
    if (filter === "live") return v.isLive;
    if (filter === "battle") return v.eventType === "battle";
    if (filter === "cypher") return v.eventType === "cypher";
    if (filter === "concert") return v.eventType === "concert";
    return true;
  });

  return (
    <section style={{ background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes wlsBlink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes wlsBob   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
      `}</style>

      {/* Section header */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "rgba(255,255,255,0.35)", marginBottom: 10, fontWeight: 700 }}>THE MUSICIAN'S INDEX — LIVE NOW</div>
        <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900 }}>THE WORLD IS LIVE</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {[
            { v: venues.filter(v => v.isLive).length.toString(), l: "VENUES LIVE",    c: "#FF2020" },
            { v: totalViewers.toLocaleString(),                   l: "TOTAL WATCHING", c: "#FFD700" },
            { v: WORLD_VENUES.length.toString(),                  l: "WORLDS OPEN",   c: "#00FFFF" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.16em", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>

        {/* Featured venue */}
        <FeaturedVenueBanner venue={featuredVenue} />

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {([
            { id: "all",     label: "ALL WORLDS" },
            { id: "live",    label: "🔴 LIVE NOW" },
            { id: "battle",  label: "⚔️ BATTLES" },
            { id: "cypher",  label: "🎤 CYPHERS" },
            { id: "concert", label: "🌐 CONCERTS" },
          ] as const).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 9, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: filter === f.id ? "#fff" : "rgba(255,255,255,0.4)", outline: filter === f.id ? "1px solid rgba(255,255,255,0.2)" : "none", letterSpacing: "0.08em" }}>
              {f.label}
            </button>
          ))}
          <Link href="/live/rooms" style={{ marginLeft: "auto", fontSize: 9, color: "#00FFFF", textDecoration: "none", fontWeight: 700, alignSelf: "center", letterSpacing: "0.08em" }}>
            VIEW ALL ROOMS →
          </Link>
        </div>

        {/* Venue grid — with revenue hooks on each card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, marginBottom: 32 }}>
          {filtered.map((venue, idx) => (
            <VenueCard key={venue.id} venue={venue} idx={idx} onExpand={handleExpand} />
          ))}
        </div>

        {/* Discovery rail — profiles */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>ARTIST PROFILES</div>
            <Link href="/rankings" style={{ fontSize: 9, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>FULL RANKINGS →</Link>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {[
              { name: "Wavetek",     rank: 1, genre: "Hip-Hop", color: "#FF2DAA", emoji: "🎤", slug: "wavetek" },
              { name: "Nova Cipher", rank: 2, genre: "R&B",     color: "#FFD700", emoji: "👑", slug: "nova-cipher" },
              { name: "Krypt",       rank: 3, genre: "Drill",   color: "#AA2DFF", emoji: "🔥", slug: "krypt" },
              { name: "Bar God",     rank: 4, genre: "Lyrical", color: "#00FFFF", emoji: "⚔️", slug: "bar-god" },
              { name: "FlowMaster", rank: 5, genre: "Gospel",  color: "#00FF88", emoji: "🙌", slug: "flowmaster" },
            ].map(a => (
              <Link key={a.slug} href={`/rankings/${a.slug}`} style={{ flexShrink: 0, width: 120, textDecoration: "none", background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}22`, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{a.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{a.name}</div>
                <div style={{ fontSize: 9, color: a.color, marginTop: 2 }}>#{a.rank} · {a.genre}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 4, justifyContent: "center" }}>
                  <Link href={`/api/stripe/checkout?priceId=price_tip&amount=500&productName=${encodeURIComponent("Tip for " + a.name)}&mode=payment`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", padding: "2px 7px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>💰 TIP</Link>
                  <span style={{ fontSize: 7, color: "#00FFFF", background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.25)", padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>👁 VIEW</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom quick links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { href: "/battles",             label: "⚔️ BATTLES",      color: "#FF2DAA" },
            { href: "/cypher",              label: "🎤 CYPHERS",      color: "#00FFFF" },
            { href: "/rooms/world-dance-party", label: "💃 DANCE PARTY", color: "#AA2DFF" },
            { href: "/magazine",            label: "📖 MAGAZINE",    color: "#FFD700" },
            { href: "/auction",             label: "🏛️ AUCTION",     color: "#FF9500" },
            { href: "/subscribe",           label: "👑 SUBSCRIBE",   color: "#00FF88" },
            { href: "/live/go",             label: "🔴 GO LIVE",     color: "#FF6B35" },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: n.color, border: `1px solid ${n.color}30`, textDecoration: "none", background: `${n.color}08`, letterSpacing: "0.08em" }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Venue expand modal */}
      {expandedVenue && <VenueModal venue={expandedVenue} onClose={() => setExpandedVenue(null)} />}
    </section>
  );
}
