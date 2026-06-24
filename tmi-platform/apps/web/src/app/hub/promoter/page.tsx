"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";

const ACCENT = "#00FF88";

const STATS = [
  { label: "Events Promoted",  value: "0",    icon: "🎪", color: "#00FF88" },
  { label: "Artists Booked",   value: "0",    icon: "🎤", color: "#00FFFF" },
  { label: "Tickets Sold",     value: "0",    icon: "🎟️", color: "#FFD700" },
  { label: "Gross Revenue",    value: "$0",   icon: "💵", color: "#AA2DFF" },
];

const QUICK_ACTIONS = [
  { label: "PROMOTE EVENT",   icon: "📣", href: "/promoter/dashboard",    color: "#00FF88", desc: "Launch event campaign" },
  { label: "BOOK ARTIST",     icon: "🎤", href: "/booking",            color: "#00FFFF", desc: "Contract performers" },
  { label: "LIVE LOBBY",      icon: "🏟️", href: "/live/rooms",        color: "#AA2DFF", desc: "Open pre-show space" },
  { label: "VENUES",          icon: "🏢", href: "/venues",             color: "#FFD700", desc: "Find partner venues" },
  { label: "ADVERTISING",     icon: "📢", href: "/advertising",        color: "#FF2DAA", desc: "Buy promo placements" },
  { label: "SPONSOR DEALS",   icon: "🤝", href: "/sponsor/campaigns",  color: "#00FFFF", desc: "Attach brands to shows" },
  { label: "LIVE STAGES",     icon: "🎭", href: "/live/stages",        color: "#AA2DFF", desc: "Broadcast stages" },
  { label: "ANALYTICS",       icon: "📊", href: "/dashboard/promoter", color: "#00FF88", desc: "Reach, conversions, revenue" },
  { label: "MESSAGES",        icon: "💌", href: "/messages",           color: "#00FFFF", desc: "Artist & venue inbox" },
  { label: "PRINT TICKETS",   icon: "🖨️", href: "/tickets",           color: "#FFD700", desc: "Print / QR distribution" },
  { label: "SEATING",         icon: "🏛️", href: "/seating",           color: "#FF2DAA", desc: "Configure seat map" },
  { label: "SETTINGS",        icon: "⚙️", href: "/settings",          color: "#555",    desc: "Account preferences" },
];

type TicketTier = { id: string; name: string; price: number; inventory: number; sold: number; };

// Ticket tiers start with no sold tickets — real sales tracked via /api/tickets
const INITIAL_TIERS: TicketTier[] = [];

// Events start empty — real events created via /promoter/events and fetched from API
const EVENTS: { id: string; name: string; date: string; venue: string; status: string }[] = [];

const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  on_sale:  { label: "ON SALE",  color: "#00FF88" },
  upcoming: { label: "UPCOMING", color: "#00FFFF" },
  draft:    { label: "DRAFT",    color: "#64748b" },
};

const PLATFORM_LINKS = [
  { label: "HOME RAIL",    icon: "🏠", href: "/home/1",                desc: "Billboard #1",    color: "#00FF88" },
  { label: "ADMIN PANEL",  icon: "👑", href: "/admin/owner-dashboard", desc: "Owner access",    color: "#FFD700" },
  { label: "STORE HUB",    icon: "🛒", href: "/store",                 desc: "TMI global store", color: "#00FFFF" },
  { label: "GIVEAWAYS",    icon: "🎁", href: "/store/giveaways",       desc: "Contest prizes",  color: "#AA2DFF" },
];

export default function PromoterHubPage() {
  const [tiers, setTiers] = useState<TicketTier[]>(INITIAL_TIERS);
  const [eventName, setEventName] = useState("Neon Summer Bash");
  const [newTierName, setNewTierName] = useState("Balcony");
  const [newTierPrice, setNewTierPrice] = useState(55);
  const [newTierInventory, setNewTierInventory] = useState(200);
  const [activeEvent, setActiveEvent] = useState("ev1");

  const totals = useMemo(() => {
    const inventory = tiers.reduce((a, t) => a + t.inventory, 0);
    const sold = tiers.reduce((a, t) => a + t.sold, 0);
    const gross = tiers.reduce((a, t) => a + t.sold * t.price, 0);
    return { inventory, sold, gross, pct: inventory > 0 ? Math.round((sold / inventory) * 100) : 0 };
  }, [tiers]);

  const addTier = () => {
    setTiers(prev => [
      ...prev,
      {
        id: `t${prev.length + 1}`,
        name: newTierName.trim() || "New Tier",
        price: Math.max(1, newTierPrice),
        inventory: Math.max(1, newTierInventory),
        sold: 0,
      },
    ]);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.88)", borderBottom: "1px solid rgba(0,255,136,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>PROMOTER HUB</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>Event Promoter Command Center</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <PersonaSwitcher currentRole="promoter" compact />
          <Link href="/dashboard/promoter" style={{ fontSize: 10, color: ACCENT, border: "1px solid rgba(0,255,136,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>DASHBOARD</Link>
          <Link href="/booking" style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>BOOK ARTIST</Link>
          <Link href="/hub/venue" style={{ fontSize: 10, color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>VENUE HUB</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Platform Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 32 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA hero */}
        <div style={{ background: "linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,255,0.06))", border: "1.5px solid rgba(0,255,136,0.3)", borderRadius: 16, padding: "24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>📣 BUILD THE MOMENT</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Promote. Book. Sell Out.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Launch event campaigns, coordinate artist bookings, drive ticket sales, and lock in sponsor deals.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/promoter/events" style={{ padding: "13px 28px", background: `linear-gradient(90deg,${ACCENT},#00FFFF)`, borderRadius: 9, color: "#050510", fontWeight: 900, fontSize: 13, textDecoration: "none", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>PROMOTE EVENT</Link>
            <Link href="/booking" style={{ padding: "13px 20px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>BOOK ARTIST</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: a.color, letterSpacing: "0.1em" }}>{a.label}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TICKET SALES ENGINE */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section style={{ background: "rgba(0,255,136,0.04)", border: "1.5px solid rgba(0,255,136,0.25)", borderRadius: 16, padding: "24px", marginBottom: 28 }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>TICKET SALES ENGINE</div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>All tickets sold through TMI · Brick + mortar printable · QR check-in</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/tickets" style={{ padding: "8px 16px", background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, borderRadius: 8, color: ACCENT, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>MANAGE ALL TICKETS →</Link>
              <Link href="/seating" style={{ padding: "8px 16px", background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>SEAT MAP →</Link>
            </div>
          </div>

          {/* Event selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {EVENTS.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: "10px 0" }}>No events created yet. Create an event to add ticket tiers.</div>
            )}
            {EVENTS.map((ev) => {
              const s = EVENT_STATUS[ev.status];
              return (
                <button key={ev.id} onClick={() => setActiveEvent(ev.id)}
                  style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${activeEvent === ev.id ? ACCENT : "rgba(255,255,255,0.1)"}`, background: activeEvent === ev.id ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: activeEvent === ev.id ? ACCENT : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 800, cursor: "pointer", textAlign: "left" }}>
                  <div>{ev.name}</div>
                  <div style={{ fontSize: 9, color: s.color, marginTop: 3, letterSpacing: "0.1em" }}>{s.label} · {ev.date}</div>
                </button>
              );
            })}
            <Link href="/promoter/events" style={{ display: "inline-flex", alignItems: "center", padding: "10px 16px", borderRadius: 10, border: "1px dashed rgba(0,255,136,0.25)", color: "rgba(0,255,136,0.5)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              + NEW EVENT
            </Link>
          </div>

          {/* Sales totals */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Inventory",  value: totals.inventory.toLocaleString(), color: ACCENT },
              { label: "Sold",       value: totals.sold.toLocaleString(),      color: "#00FFFF" },
              { label: "Gross",      value: `$${totals.gross.toLocaleString()}`, color: "#FFD700" },
              { label: "Fill Rate",  value: `${totals.pct}%`,                  color: "#AA2DFF" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${m.color}25`, borderRadius: 10, padding: "14px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Sales mode chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Box Office",       active: true,  icon: "💻" },
              { label: "Printable Ticket", active: true,  icon: "🖨️" },
              { label: "QR Check-In",      active: true,  icon: "📷" },
              { label: "Venue Scan",       active: true,  icon: "🏟️" },
              { label: "Mobile Wallet",    active: false, icon: "📱" },
            ].map((mode) => (
              <div key={mode.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, border: `1px solid ${mode.active ? ACCENT : "rgba(255,255,255,0.08)"}`, background: mode.active ? `${ACCENT}12` : "transparent" }}>
                <span style={{ fontSize: 12 }}>{mode.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: mode.active ? ACCENT : "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{mode.label}</span>
                <span style={{ fontSize: 9, color: mode.active ? "#00FF88" : "#555", fontWeight: 800 }}>{mode.active ? "ON" : "OFF"}</span>
              </div>
            ))}
          </div>

          {/* Ticket tiers */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>TICKET TIERS — {EVENTS.find(e => e.id === activeEvent)?.name ?? "Create an event to add tiers"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tiers.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "12px 0" }}>No ticket tiers yet. Use the form below to add your first tier.</div>
              ) : tiers.map((tier) => {
                const pct = Math.min(100, Math.round((tier.sold / tier.inventory) * 100));
                const revenue = tier.sold * tier.price;
                return (
                  <div key={tier.id} style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{tier.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#FFD700" }}>${tier.price}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tier.sold}/{tier.inventory} sold</span>
                        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>${revenue.toLocaleString()}</span>
                        <Link href="/tickets" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700, border: "1px solid rgba(0,255,255,0.3)", borderRadius: 5, padding: "3px 8px" }}>PRINT</Link>
                        <Link href="/tickets" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", fontWeight: 700, border: "1px solid rgba(170,45,255,0.3)", borderRadius: 5, padding: "3px 8px" }}>QR</Link>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, #00FFFF)`, borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{pct}% capacity · {tier.inventory - tier.sold} remaining</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add tier form */}
          <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10, padding: "14px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>ADD TICKET TIER</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8 }}>
              <input
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                placeholder="Tier name (e.g. Balcony)"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "8px 12px", color: "#fff", fontSize: 12, outline: "none" }}
              />
              <input
                type="number"
                value={newTierPrice}
                onChange={(e) => setNewTierPrice(Number(e.target.value))}
                placeholder="Price"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "8px 12px", color: "#FFD700", fontSize: 12, width: 90, outline: "none" }}
              />
              <input
                type="number"
                value={newTierInventory}
                onChange={(e) => setNewTierInventory(Number(e.target.value))}
                placeholder="Qty"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "8px 12px", color: "#fff", fontSize: 12, width: 90, outline: "none" }}
              />
              <button onClick={addTier}
                style={{ background: `linear-gradient(90deg,${ACCENT},#00FFFF)`, border: "none", borderRadius: 7, padding: "8px 18px", color: "#050510", fontSize: 11, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                ADD TIER →
              </button>
            </div>
          </div>

          {/* Brick & mortar + distribution note */}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/tickets" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🖨️ Print Venue Tickets (Brick & Mortar)
            </Link>
            <Link href="/tickets" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.25)", borderRadius: 8, color: "#AA2DFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              📷 QR Check-In Scanner
            </Link>
            <Link href="/seating" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🏟️ Venue Seating Map
            </Link>
            <Link href="/nft-marketplace" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, color: ACCENT, fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🎴 Mint as NFT Ticket
            </Link>
          </div>
        </section>

        {/* Event Pipeline + Venue Routes + Platform */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Active events list */}
          <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.14)", borderRadius: 14, padding: "18px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 14 }}>ACTIVE EVENTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EVENTS.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No events yet. Create your first event to get started.</div>
              ) : EVENTS.map((ev) => {
                const s = EVENT_STATUS[ev.status];
                return (
                  <div key={ev.id} style={{ padding: "10px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{ev.name}</span>
                      <span style={{ fontSize: 8, fontWeight: 800, color: s.color, letterSpacing: "0.12em" }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{ev.date} · {ev.venue}</div>
                  </div>
                );
              })}
            </div>
            <Link href="/promoter/events" style={{ display: "block", marginTop: 10, textAlign: "center", padding: "8px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, borderRadius: 7, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>
              + CREATE EVENT
            </Link>
          </div>

          {/* Venue routes */}
          <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 14, padding: "18px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>VENUE + LIVE ROUTES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { label: "All Venues",      icon: "🏢", href: "/venues" },
                { label: "Seating Maps",    icon: "🏟️", href: "/seating" },
                { label: "Live Rooms",      icon: "📺", href: "/live/rooms" },
                { label: "Backstage",       icon: "🎪", href: "/live/backstage" },
                { label: "Live Lobby",      icon: "🏟️", href: "/live/rooms" },
                { label: "Live Billboards", icon: "📡", href: "/live/billboards" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.1)", borderRadius: 7, textDecoration: "none" }}>
                  <span style={{ fontSize: 14 }}>{l.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#00FFFF" }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 14, padding: "18px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>PLATFORM CONNECTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PLATFORM_LINKS.map((p) => (
                <Link key={p.href} href={p.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: 8, textDecoration: "none" }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{p.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px", background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: "#FF9500", fontWeight: 800, marginBottom: 4 }}>⭐ INVITE & EARN</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Earn XP for every artist or fan you bring in. 2× launch bonus active.</div>
              <Link href="/account/referrals" style={{ fontSize: 10, color: "#FF9500", fontWeight: 800, textDecoration: "none" }}>GET INVITE LINK →</Link>
            </div>
          </div>

        </div>

        {/* Canisters — Memory Wall + Messaging (Rule 15) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <MemoryWallCanister entityId="promoter" entityType="venue" title="Promoter Events" accentColor="#00FF88" />
          <MessagingCanister height={360} />
        </div>

      </div>
    </main>
  );
}
