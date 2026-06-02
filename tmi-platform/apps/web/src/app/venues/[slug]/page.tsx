"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudienceScene from "@/components/live/AudienceScene";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import SeatUpgradeWidget from "@/components/venue/SeatUpgradeWidget";
import TipBar from "@/components/hud/TipBar";

const VENUES: Record<string, {
  name: string; type: "theater" | "arena" | "club" | "outdoor" | "studio";
  city: string; capacity: number; venueIndex: 0 | 1 | 2 | 3 | 4;
  description: string; accentColor: string; emoji: string;
  priceGA: number; priceVIP: number; priceFrontRow: number; priceBackstage: number;
  genres: string[]; amenities: string[];
  currentEvent?: string; currentArtist?: string; isLive: boolean; viewers: number;
}> = {
  "main-stage": {
    name: "Main Stage", type: "arena", city: "Los Angeles",
    capacity: 18500, venueIndex: 1, accentColor: "#FF2DAA",
    emoji: "🏟️", isLive: true, viewers: 3400,
    description: "The flagship TMI arena. 18,500 seats, stadium-wrap seating, full production broadcast capability.",
    currentEvent: "World Concert Live", currentArtist: "Nova Cipher",
    priceGA: 5, priceVIP: 20, priceFrontRow: 10, priceBackstage: 50,
    genres: ["Hip-Hop", "R&B", "Pop", "EDM"],
    amenities: ["Full stage production", "18,500-seat stadium", "360° video walls", "VIP lounge", "Backstage access", "Meet & Greet area"],
  },
  "cypher-theater": {
    name: "Cypher Theater", type: "theater", city: "New York",
    capacity: 2730, venueIndex: 0, accentColor: "#00FFFF",
    emoji: "🎭", isLive: true, viewers: 841,
    description: "Intimate 2,730-seat theater designed for cyphers, open mics, and live showcases.",
    currentEvent: "Monday Cypher", currentArtist: "Open Floor",
    priceGA: 3, priceVIP: 12, priceFrontRow: 7, priceBackstage: 30,
    genres: ["Rap", "Freestyle", "Spoken Word", "Gospel"],
    amenities: ["Theater seating", "Stage lighting", "Green room", "Recording booth", "Audience voting system"],
  },
  "underground-club": {
    name: "Underground Club", type: "club", city: "Atlanta",
    capacity: 420, venueIndex: 2, accentColor: "#AA2DFF",
    emoji: "🎪", isLive: false, viewers: 0,
    description: "420-capacity intimate club. DJ booth, dance floor, VIP booths. The most exclusive room on TMI.",
    priceGA: 2, priceVIP: 15, priceFrontRow: 8, priceBackstage: 40,
    genres: ["Trap", "Drill", "House", "Reggae"],
    amenities: ["DJ booth", "Dance floor", "VIP booths", "Bar area", "Private room access"],
  },
  "festival-grounds": {
    name: "Festival Grounds", type: "outdoor", city: "Miami",
    capacity: 8200, venueIndex: 3, accentColor: "#00FF88",
    emoji: "🎪", isLive: false, viewers: 0,
    description: "Outdoor festival stage. 8,200 capacity. Challenges, live events, and special shows.",
    priceGA: 4, priceVIP: 18, priceFrontRow: 9, priceBackstage: 45,
    genres: ["Reggaeton", "Afrobeats", "Latin", "Hip-Hop"],
    amenities: ["Main stage + side stages", "GA pit", "VIP viewing area", "Food vendors", "Full production"],
  },
};

const TICKET_TIERS = [
  { id: "ga",         label: "General Admission", emoji: "🎫", color: "#00FFFF",  key: "priceGA"        as const },
  { id: "front_row",  label: "Front Row",          emoji: "🎯", color: "#FFD700",  key: "priceFrontRow"  as const },
  { id: "vip",        label: "VIP",                emoji: "💎", color: "#AA2DFF",  key: "priceVIP"       as const },
  { id: "backstage",  label: "Backstage",          emoji: "🎪", color: "#FF2DAA",  key: "priceBackstage" as const },
];

export default function VenuePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const venue = VENUES[params.slug] ?? VENUES["main-stage"]!;
  const [activeTab, setActiveTab] = useState<"entrance" | "tickets" | "seats" | "sponsors">("entrance");
  const [ticketQty, setTicketQty] = useState(1);
  const [selectedTier, setSelectedTier] = useState("ga");
  const [buyingTicket, setBuyingTicket] = useState(false);
  const [viewers, setViewers] = useState(venue.viewers);

  useEffect(() => {
    if (!venue.isLive) return;
    const id = setInterval(() => setViewers(v => Math.max(5, v + Math.floor((Math.random() - 0.35) * 40))), 3000);
    return () => clearInterval(id);
  }, [venue.isLive]);

  const tier = TICKET_TIERS.find(t => t.id === selectedTier)!;
  const tierPrice = venue[tier.key];
  const total = tierPrice * ticketQty;

  function handleTicketBuy() {
    setBuyingTicket(true);
    const qs = new URLSearchParams({
      priceId: `price_ticket_${selectedTier}`,
      amount: String(total * 100),
      productName: `${venue.name} — ${tier.label} ×${ticketQty}`,
      mode: "payment",
    });
    router.push(`/api/stripe/checkout?${qs.toString()}`);
  }

  const TABS = [
    { id: "entrance", label: "🏛️ Entrance" },
    { id: "tickets",  label: "🎫 Tickets" },
    { id: "seats",    label: "💺 Seats" },
    { id: "sponsors", label: "🤝 Sponsors" },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes vBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes vPulse { 0%,100%{box-shadow:0 0 10px ${venue.accentColor}44} 50%{box-shadow:0 0 28px ${venue.accentColor}88} }
      `}</style>

      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(14px)", zIndex: 50 }}>
        <Link href="/venues" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Venues</Link>
        <span style={{ fontSize: 11, fontWeight: 700, color: venue.accentColor }}>{venue.emoji} {venue.name}</span>
        {venue.isLive && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2020", display: "inline-block", animation: "vBlink 1s step-end infinite" }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: "#FF2020", letterSpacing: "0.12em" }}>LIVE</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{viewers.toLocaleString()} watching</span>
          </div>
        )}
      </nav>

      {/* HERO — full 3D arena preview */}
      <div style={{ height: 340, position: "relative", overflow: "hidden" }}>
        <AudienceScene
          venue={venue.venueIndex}
          watcherCount={venue.capacity}
          view="fan"
          accentColor={venue.accentColor}
          bpm={120}
          screenLabel={venue.currentEvent ?? venue.name}
          screenSubLabel={venue.currentArtist ?? venue.city}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 25%, #050510 100%)" }} />
        <div style={{ position: "absolute", top: 16, left: 20, background: `${venue.accentColor}CC`, color: "#000", fontSize: 9, fontWeight: 900, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.12em" }}>
          {venue.type.toUpperCase()}
        </div>
        {venue.isLive && (
          <div style={{ position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)" }}>
            <Link href={`/rooms/${params.slug}?autoSeat=1`} style={{ padding: "14px 36px", background: `linear-gradient(90deg, ${venue.accentColor}, ${venue.accentColor}88)`, color: "#000", borderRadius: 12, fontWeight: 900, fontSize: 13, textDecoration: "none", letterSpacing: "0.12em", whiteSpace: "nowrap", boxShadow: `0 0 40px ${venue.accentColor}55`, display: "block", animation: "vPulse 2.5s ease-in-out infinite" }}>
              ▶ ENTER VENUE + SIT
            </Link>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.3em", color: venue.accentColor, fontWeight: 800, marginBottom: 4 }}>{venue.city.toUpperCase()} · {venue.capacity.toLocaleString()} CAPACITY</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900 }}>{venue.name}</h1>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 600 }}>{venue.description}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {venue.genres.map(g => (
              <span key={g} style={{ fontSize: 8, fontWeight: 800, color: venue.accentColor, background: `${venue.accentColor}12`, border: `1px solid ${venue.accentColor}30`, padding: "3px 10px", borderRadius: 20 }}>{g}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: activeTab === t.id ? venue.accentColor : "rgba(255,255,255,0.35)", borderBottom: activeTab === t.id ? `2px solid ${venue.accentColor}` : "2px solid transparent", transition: "color 0.15s", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ENTRANCE TAB */}
        {activeTab === "entrance" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
            <div>
              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Fans Seated", value: Math.floor(venue.capacity * 0.72).toLocaleString(), color: "#00FFFF" },
                  { label: "Viewers", value: venue.isLive ? viewers.toLocaleString() : "—", color: "#FFD700" },
                  { label: "Capacity", value: venue.capacity.toLocaleString(), color: venue.accentColor },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${s.color}20` }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Amenities */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px", marginBottom: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>VENUE FEATURES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {venue.amenities.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: venue.accentColor, fontWeight: 900 }}>✓</span>{a}
                    </div>
                  ))}
                </div>
              </div>
              <UnifiedAdSlot venue="shows" slotKey="showSidebar" format="rectangle" accentColor={venue.accentColor} label="SPONSOR" />
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: `${venue.accentColor}0C`, border: `1px solid ${venue.accentColor}33`, borderRadius: 16, padding: "18px", textAlign: "center" }}>
                {venue.isLive ? (
                  <>
                    <div style={{ fontSize: 8, color: "#FF2020", fontWeight: 800, letterSpacing: "0.14em", marginBottom: 8 }}>● LIVE NOW</div>
                    <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{venue.currentEvent}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>{venue.currentArtist}</div>
                    <Link href={`/rooms/${params.slug}?autoSeat=1`} style={{ display: "block", padding: "12px", background: venue.accentColor, color: "#000", borderRadius: 10, fontWeight: 900, fontSize: 11, textDecoration: "none", marginBottom: 8 }}>ENTER + SIT →</Link>
                    <button onClick={() => setActiveTab("tickets")} style={{ width: "100%", padding: "10px", background: "transparent", border: `1px solid ${venue.accentColor}44`, color: venue.accentColor, borderRadius: 10, fontWeight: 800, fontSize: 10, cursor: "pointer" }}>🎫 GET TICKET</button>
                    {venue.currentArtist && (
                      <div style={{ marginTop: 12 }}>
                        <TipBar performerId={params.slug} performerName={venue.currentArtist} roomId={params.slug} accentColor={venue.accentColor} compact />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 800, letterSpacing: "0.14em", marginBottom: 8 }}>NEXT EVENT SOON</div>
                    <button onClick={() => setActiveTab("tickets")} style={{ width: "100%", padding: "12px", background: venue.accentColor, color: "#000", borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>🎫 BOOK TICKETS</button>
                  </>
                )}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px" }}>
                {[
                  { href: "/hub/venue", label: "🏟️ Venue Dashboard", color: venue.accentColor },
                  { href: "/hub/promoter", label: "📢 Promote Event", color: "#FF6B35" },
                  { href: `/sponsor/battles?venue=${params.slug}`, label: "🤝 Sponsor Venue", color: "#AA2DFF" },
                  { href: "/live/rooms", label: "📡 Billboard Wall", color: "#00FFFF" },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ display: "block", fontSize: 11, color: l.color, textDecoration: "none", fontWeight: 700, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>CHOOSE YOUR TICKET</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {TICKET_TIERS.map(t => (
                  <button key={t.id} onClick={() => setSelectedTier(t.id)} style={{ padding: "16px", borderRadius: 14, border: `1.5px solid ${selectedTier === t.id ? t.color : t.color + "28"}`, background: selectedTier === t.id ? `${t.color}14` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: t.color, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>${venue[t.key]}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/person</span></div>
                  </button>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 10 }}>PHYSICAL TICKETS</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Print-at-home and thermal printer support for brick-and-mortar venues.</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/tickets/print" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🖨️ Print Ticket</Link>
                  <Link href="/tickets" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(0,255,255,0.08)", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📱 My Tickets</Link>
                </div>
              </div>
            </div>
            <div style={{ background: `${venue.accentColor}08`, border: `1px solid ${venue.accentColor}33`, borderRadius: 18, padding: "22px", position: "sticky", top: 64 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: venue.accentColor, fontWeight: 800, marginBottom: 14 }}>ORDER SUMMARY</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>TICKET TYPE</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: tier.color }}>{tier.emoji} {tier.label}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>QTY</span>
                <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 14 }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 900, minWidth: 20, textAlign: "center" }}>{ticketQty}</span>
                <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>TOTAL</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: tier.color }}>${total}</span>
              </div>
              <button onClick={handleTicketBuy} disabled={buyingTicket} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`, color: "#000", fontWeight: 900, fontSize: 12, cursor: buyingTicket ? "not-allowed" : "pointer", letterSpacing: "0.1em" }}>
                {buyingTicket ? "REDIRECTING…" : "BUY TICKETS →"}
              </button>
              <div style={{ marginTop: 8, fontSize: 8, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>Secured by Stripe · Instant delivery</div>
            </div>
          </div>
        )}

        {/* SEATS TAB */}
        {activeTab === "seats" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
            <div>
              <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 16, background: "#050510" }}>
                <AudienceScene venue={venue.venueIndex} watcherCount={venue.capacity} view="fan" accentColor={venue.accentColor} bpm={120} screenLabel="YOUR SEAT VIEW" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>SEAT SECTIONS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { s: "Back Row", c: "rgba(255,255,255,0.4)" },
                    { s: "Middle",   c: "#00FFFF" },
                    { s: "Front",    c: "#FFD700" },
                    { s: "VIP",      c: "#AA2DFF" },
                  ].map(x => (
                    <div key={x.s} style={{ textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                      <div style={{ fontSize: 8, fontWeight: 800, color: x.c, letterSpacing: "0.08em" }}>{x.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SeatUpgradeWidget roomId={params.slug} accentColor={venue.accentColor} currentSeat="Row G · Seat 14" />
          </div>
        )}

        {/* SPONSORS TAB */}
        {activeTab === "sponsors" && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 16 }}>SPONSOR THIS VENUE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { slot: "Arena Sponsor",  price: "$99/wk",  desc: "Brand on all arena video walls during events", color: "#FF2DAA" },
                { slot: "Lobby Sponsor",  price: "$49/wk",  desc: "Featured placement on the lobby billboard wall", color: "#FFD700" },
                { slot: "Ticket Sponsor", price: "$25/wk",  desc: "Logo on every digital and physical ticket", color: "#00FFFF" },
                { slot: "Stage Sponsor",  price: "$149/wk", desc: "Brand displayed on the stage backdrop", color: "#AA2DFF" },
              ].map(s => (
                <div key={s.slot} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}22`, borderRadius: 14, padding: "16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.slot}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 10, lineHeight: 1.5 }}>{s.desc}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color, marginBottom: 10 }}>{s.price}</div>
                  <Link href={`/sponsor/battles?venue=${params.slug}`} style={{ display: "block", padding: "8px", background: `${s.color}18`, border: `1px solid ${s.color}40`, color: s.color, borderRadius: 8, fontSize: 9, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>
                    CLAIM SLOT →
                  </Link>
                </div>
              ))}
            </div>
            <UnifiedAdSlot venue="shows" slotKey="roomLeaderboard" format="horizontal" accentColor={venue.accentColor} label="ADVERTISEMENT" />
          </div>
        )}
      </div>
    </main>
  );
}
