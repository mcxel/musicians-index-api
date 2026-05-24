"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { getMemoryWallStats, listMemoriesForEntity } from "@/lib/profiles/MemoryWallEngine";

const MemoryWallCanvas = dynamic(
  () => import("@/components/memory/MemoryWallCanvas"),
  { ssr: false },
);

const ACCENT = "#FF6B35";
const GOLD   = "#FFD700";
const GREEN  = "#00FF88";
const CYAN   = "#00FFFF";

type Tab = "memories" | "tickets" | "analytics";

// ── Ticket types ──────────────────────────────────────────────────────────────
type TicketTier = "GA" | "VIP" | "PREMIUM" | "BACKSTAGE";

interface TicketListing {
  id: string;
  eventName: string;
  date: string;
  time: string;
  tier: TicketTier;
  price: number;
  capacity: number;
  sold: number;
  status: "on-sale" | "sold-out" | "upcoming" | "ended";
  color: string;
}

const TIER_COLORS: Record<TicketTier, string> = {
  GA:        CYAN,
  VIP:       GOLD,
  PREMIUM:   "#FF2DAA",
  BACKSTAGE: "#AA2DFF",
};

const SEED_TICKETS: TicketListing[] = [
  { id: "t1", eventName: "Friday Night Cypher",   date: "Jun 6, 2026",  time: "8 PM", tier: "GA",        price: 25,  capacity: 300, sold: 218, status: "on-sale",  color: CYAN   },
  { id: "t2", eventName: "Friday Night Cypher",   date: "Jun 6, 2026",  time: "8 PM", tier: "VIP",       price: 75,  capacity: 50,  sold: 50,  status: "sold-out", color: GOLD   },
  { id: "t3", eventName: "Saturday Showcase",     date: "Jun 7, 2026",  time: "7 PM", tier: "GA",        price: 20,  capacity: 400, sold: 95,  status: "on-sale",  color: CYAN   },
  { id: "t4", eventName: "Saturday Showcase",     date: "Jun 7, 2026",  time: "7 PM", tier: "PREMIUM",   price: 120, capacity: 30,  sold: 12,  status: "on-sale",  color: "#FF2DAA" },
  { id: "t5", eventName: "Monthly Idol Finale",   date: "Jun 14, 2026", time: "9 PM", tier: "BACKSTAGE", price: 200, capacity: 20,  sold: 7,   status: "upcoming", color: "#AA2DFF" },
];

type ComposerForm = {
  eventName: string;
  date: string;
  time: string;
  tier: TicketTier;
  price: string;
  capacity: string;
};

const BLANK_FORM: ComposerForm = {
  eventName: "", date: "", time: "", tier: "GA", price: "", capacity: "",
};

// ── Analytics seed ────────────────────────────────────────────────────────────
const WEEKLY_REVENUE = [1200, 1800, 980, 2400, 3100, 2750, 4200];
const WEEKLY_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOP_EVENTS = [
  { name: "Friday Night Cypher",  revenue: 5450, tickets: 218, fill: 73 },
  { name: "Monthly Idol Finale",  revenue: 1400, tickets: 7,   fill: 35 },
  { name: "Saturday Showcase",    revenue: 1900, tickets: 95,  fill: 24 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(sold: number, cap: number) {
  return cap > 0 ? Math.round((sold / cap) * 100) : 0;
}

function totalRevenue(tickets: TicketListing[]) {
  return tickets.reduce((s, t) => s + t.price * t.sold, 0);
}

function totalSold(tickets: TicketListing[]) {
  return tickets.reduce((s, t) => s + t.sold, 0);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VenueMemoryHubPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const stats    = getMemoryWallStats(slug, "venue");
  const memories = listMemoriesForEntity(slug, "venue");

  const [tab, setTab] = useState<Tab>("memories");
  const [tickets, setTickets] = useState<TicketListing[]>(SEED_TICKETS);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState<ComposerForm>(BLANK_FORM);
  const [formError, setFormError] = useState("");

  const handleCreateTicket = useCallback(() => {
    if (!form.eventName.trim() || !form.date || !form.time || !form.price || !form.capacity) {
      setFormError("All fields are required.");
      return;
    }
    const price    = Number(form.price);
    const capacity = Number(form.capacity);
    if (isNaN(price) || price <= 0 || isNaN(capacity) || capacity <= 0) {
      setFormError("Price and capacity must be positive numbers.");
      return;
    }
    const newTicket: TicketListing = {
      id:        `t-${Date.now()}`,
      eventName: form.eventName.trim(),
      date:      form.date,
      time:      form.time,
      tier:      form.tier,
      price,
      capacity,
      sold:      0,
      status:    "upcoming",
      color:     TIER_COLORS[form.tier],
    };
    setTickets(prev => [newTicket, ...prev]);
    setForm(BLANK_FORM);
    setFormError("");
    setComposerOpen(false);
  }, [form]);

  const revenue = totalRevenue(tickets);
  const sold    = totalSold(tickets);
  const maxBar  = Math.max(...WEEKLY_REVENUE);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${ACCENT}22`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href={`/venues/${slug}`} style={{ fontSize: 9, color: ACCENT, textDecoration: "none", fontWeight: 800, letterSpacing: "0.15em" }}>
          ← VENUE PROFILE
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{slug.toUpperCase()}</span>
        <div style={{ flex: 1 }} />
        <Link href={`/venues/${slug}/tickets/create`} style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: `linear-gradient(135deg,${ACCENT},${ACCENT}99)`, padding: "6px 14px", borderRadius: 6, textDecoration: "none" }}>
          + NEW EVENT
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Venue Hub</h1>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{slug.toUpperCase()}</span>
        </div>

        {/* Top stat cards */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {[
            { label: "Memories",      value: stats.totalMemories,    color: ACCENT      },
            { label: "Tickets Sold",  value: sold,                   color: CYAN        },
            { label: "Revenue",       value: `$${revenue.toLocaleString()}`, color: GOLD },
            { label: "Active Events", value: tickets.filter(t => t.status === "on-sale").length, color: GREEN },
            { label: "Achievements",  value: stats.achievementCount, color: "#AA2DFF"   },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}33`,
              borderRadius: 10, padding: "10px 18px", display: "flex", gap: 10, alignItems: "baseline",
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
                {s.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
          {(["memories", "tickets", "analytics"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
                cursor: "pointer", border: "none", background: "none",
                color: tab === t ? ACCENT : "rgba(255,255,255,0.35)",
                borderBottom: `2px solid ${tab === t ? ACCENT : "transparent"}`,
                marginBottom: -1,
              }}
            >
              {t === "memories" ? "🎞 MEMORIES" : t === "tickets" ? "🎫 TICKETS" : "📊 ANALYTICS"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── MEMORIES TAB ── */}
          {tab === "memories" && (
            <motion.div key="memories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MemoryWallCanvas
                entityId={slug}
                entityType="venue"
                initialMemories={memories}
                accentColor={ACCENT}
              />
            </motion.div>
          )}

          {/* ── TICKETS TAB ── */}
          {tab === "tickets" && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Ticket summary bar */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {(["on-sale", "upcoming", "sold-out", "ended"] as TicketListing["status"][]).map(s => {
                  const count = tickets.filter(t => t.status === s).length;
                  const colors: Record<string, string> = { "on-sale": GREEN, upcoming: CYAN, "sold-out": GOLD, ended: "rgba(255,255,255,0.25)" };
                  return (
                    <div key={s} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${colors[s]}33`, borderRadius: 8, padding: "7px 14px", display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: colors[s] }}>{count}</span>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{s.toUpperCase()}</span>
                    </div>
                  );
                })}
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => setComposerOpen(p => !p)}
                  style={{
                    padding: "8px 18px", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer",
                    background: composerOpen ? `${ACCENT}22` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${composerOpen ? `${ACCENT}55` : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 20, color: composerOpen ? ACCENT : "rgba(255,255,255,0.5)",
                  }}
                >
                  {composerOpen ? "✕ Cancel" : "🎫 Create Ticket Listing"}
                </button>
              </div>

              {/* Ticket composer */}
              <AnimatePresence>
                {composerOpen && (
                  <motion.div
                    key="composer"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 20, overflow: "hidden" }}
                  >
                    <div style={{ background: "rgba(255,107,53,0.04)", border: `1px solid ${ACCENT}33`, borderRadius: 14, padding: "20px 22px" }}>
                      <div style={{ fontSize: 9, color: ACCENT, letterSpacing: "0.15em", fontWeight: 800, marginBottom: 16 }}>NEW TICKET LISTING</div>

                      {/* Tier selector */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {(["GA", "VIP", "PREMIUM", "BACKSTAGE"] as TicketTier[]).map(tier => (
                          <button
                            key={tier}
                            onClick={() => setForm(p => ({ ...p, tier }))}
                            style={{
                              padding: "6px 14px", fontSize: 9, fontWeight: 800, cursor: "pointer",
                              background: form.tier === tier ? `${TIER_COLORS[tier]}22` : "rgba(255,255,255,0.04)",
                              border: `1px solid ${form.tier === tier ? TIER_COLORS[tier] : "rgba(255,255,255,0.09)"}`,
                              borderRadius: 6, color: form.tier === tier ? TIER_COLORS[tier] : "rgba(255,255,255,0.45)",
                            }}
                          >
                            {tier === "GA" ? "🎟 GA" : tier === "VIP" ? "⭐ VIP" : tier === "PREMIUM" ? "💎 PREMIUM" : "🎤 BACKSTAGE"}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        {([
                          ["eventName", "Event Name *", "text", "e.g. Friday Night Cypher"],
                          ["date",      "Date *",       "date",  ""],
                          ["time",      "Time *",       "text",  "e.g. 8 PM"],
                          ["price",     "Ticket Price ($) *", "number", "e.g. 25"],
                          ["capacity",  "Capacity *",   "number", "e.g. 300"],
                        ] as [keyof ComposerForm, string, string, string][]).map(([key, label, type, ph]) => (
                          <div key={key}>
                            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 5 }}>
                              {label.toUpperCase()}
                            </label>
                            <input
                              type={type}
                              placeholder={ph}
                              value={form[key]}
                              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", fontSize: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#fff", outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                        ))}
                      </div>

                      {formError && (
                        <div style={{ fontSize: 10, color: "#FF6B6B", marginBottom: 10 }}>{formError}</div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          onClick={handleCreateTicket}
                          style={{
                            padding: "10px 22px", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer",
                            background: `linear-gradient(135deg,${ACCENT},${ACCENT}99)`, border: "none",
                            borderRadius: 8, color: "#050510",
                          }}
                        >
                          🎫 PUBLISH LISTING
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ticket listings */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tickets.map((ticket, i) => {
                  const fill = pct(ticket.sold, ticket.capacity);
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{
                        background: "rgba(255,255,255,0.025)", border: `1px solid ${ticket.color}22`,
                        borderRadius: 12, padding: "16px 18px",
                        display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                        gap: 16, alignItems: "center",
                      }}
                    >
                      {/* Tier badge */}
                      <div style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 8, fontWeight: 800,
                        letterSpacing: "0.1em", background: `${ticket.color}18`,
                        color: ticket.color, border: `1px solid ${ticket.color}44`, whiteSpace: "nowrap",
                      }}>
                        {ticket.tier}
                      </div>

                      {/* Event info + progress */}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{ticket.eventName}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                          {ticket.date} · {ticket.time}
                        </div>
                        {/* Capacity bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${fill}%`, height: "100%", background: ticket.status === "sold-out" ? GOLD : ticket.color, borderRadius: 2, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                            {ticket.sold}/{ticket.capacity} sold ({fill}%)
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: GOLD }}>${ticket.price}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>per ticket</div>
                      </div>

                      {/* Status + revenue */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 9px",
                          borderRadius: 4, marginBottom: 6, display: "inline-block",
                          background: ticket.status === "on-sale" ? `${GREEN}18` :
                                      ticket.status === "sold-out" ? `${GOLD}18` :
                                      ticket.status === "upcoming" ? `${CYAN}18` : "rgba(255,255,255,0.06)",
                          color: ticket.status === "on-sale" ? GREEN :
                                 ticket.status === "sold-out" ? GOLD :
                                 ticket.status === "upcoming" ? CYAN : "rgba(255,255,255,0.3)",
                        }}>
                          {ticket.status.replace("-", " ").toUpperCase()}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: GREEN }}>
                          ${(ticket.price * ticket.sold).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>revenue</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick links */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
                <Link href={`/venues/${slug}/tickets/create`} style={{ padding: "10px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: `${ACCENT}18`, border: `1px solid ${ACCENT}44`, borderRadius: 8, color: ACCENT, textDecoration: "none" }}>
                  Advanced Ticket Builder →
                </Link>
                <Link href={`/venues/${slug}/tickets/validate`} style={{ padding: "10px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  Scan & Validate →
                </Link>
                <Link href={`/venues/${slug}/tickets/print`} style={{ padding: "10px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  Print Batch →
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Revenue chart */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 20px", marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: "0.15em", marginBottom: 18 }}>📈 WEEKLY REVENUE</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
                  {WEEKLY_REVENUE.map((val, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>${(val / 1000).toFixed(1)}k</div>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(val / maxBar) * 90}px` }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        style={{
                          width: "100%", background: i === WEEKLY_REVENUE.length - 1
                            ? `linear-gradient(180deg,${ACCENT},${GOLD})`
                            : `linear-gradient(180deg,${ACCENT}88,${ACCENT}44)`,
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{WEEKLY_LABELS[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-col stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>

                {/* Ticket breakdown */}
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 18px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: CYAN, letterSpacing: "0.15em", marginBottom: 16 }}>🎫 TICKET BREAKDOWN</div>
                  {(["GA", "VIP", "PREMIUM", "BACKSTAGE"] as TicketTier[]).map(tier => {
                    const tierTickets = tickets.filter(t => t.tier === tier);
                    const tierSold    = tierTickets.reduce((s, t) => s + t.sold, 0);
                    const tierRev     = tierTickets.reduce((s, t) => s + t.sold * t.price, 0);
                    const tierCap     = tierTickets.reduce((s, t) => s + t.capacity, 0);
                    return (
                      <div key={tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 28, fontSize: 8, fontWeight: 800, color: TIER_COLORS[tier], letterSpacing: "0.08em" }}>{tier}</div>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct(tierSold, tierCap || 1)}%` }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            style={{ height: "100%", background: TIER_COLORS[tier], borderRadius: 3 }}
                          />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: TIER_COLORS[tier], width: 36, textAlign: "right" }}>{tierSold}</div>
                        <div style={{ fontSize: 9, color: GREEN, width: 52, textAlign: "right" }}>${tierRev.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Capacity utilization */}
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 18px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.15em", marginBottom: 16 }}>🏟 CAPACITY UTILIZATION</div>
                  {TOP_EVENTS.map((ev, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{ev.name}</span>
                        <span style={{ fontSize: 9, color: ev.fill >= 70 ? GREEN : ev.fill >= 40 ? GOLD : ACCENT }}>{ev.fill}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${ev.fill}%` }}
                          transition={{ delay: i * 0.12, duration: 0.6 }}
                          style={{ height: "100%", borderRadius: 3, background: ev.fill >= 70 ? `linear-gradient(90deg,${GREEN},${CYAN})` : ev.fill >= 40 ? `linear-gradient(90deg,${GOLD},${ACCENT})` : `linear-gradient(90deg,${ACCENT}88,${ACCENT})` }}
                        />
                      </div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                        {ev.tickets} tickets · ${ev.revenue.toLocaleString()} revenue
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All-time stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[
                  { label: "Total Revenue",   value: `$${revenue.toLocaleString()}`,  color: GOLD,   icon: "💰" },
                  { label: "Tickets Sold",    value: sold,                             color: CYAN,   icon: "🎫" },
                  { label: "Avg Ticket",      value: sold > 0 ? `$${Math.round(revenue / sold)}` : "$0", color: GREEN, icon: "📊" },
                  { label: "Sell-Through",    value: `${pct(sold, tickets.reduce((s,t) => s + t.capacity, 0))}%`, color: ACCENT, icon: "🔥" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${s.color}22`, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Link to full analytics */}
              <div style={{ marginTop: 18, textAlign: "center" }}>
                <Link href="/venues/dashboard" style={{ fontSize: 10, color: ACCENT, textDecoration: "none", fontWeight: 700 }}>
                  Open Full Venue Dashboard →
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
