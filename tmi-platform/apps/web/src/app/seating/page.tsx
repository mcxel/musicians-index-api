"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type SeatTier = "standard" | "premium" | "vip" | "sold";

interface Seat {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
}

const TIER_CONFIG: Record<SeatTier, { color: string; bg: string; label: string; price: number }> = {
  vip:      { color: "#FFD700", bg: "rgba(255,215,0,0.18)",    label: "VIP",      price: 150 },
  premium:  { color: "#00FFFF", bg: "rgba(0,255,255,0.15)",    label: "Premium",  price: 75  },
  standard: { color: "#00FF88", bg: "rgba(0,255,136,0.12)",    label: "Standard", price: 35  },
  sold:     { color: "#FF2DAA", bg: "rgba(255,45,170,0.15)",   label: "Sold",     price: 0   },
};

function generateSeats(): Seat[] {
  const rows = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const seats: Seat[] = [];
  for (const row of rows) {
    const seatsInRow = row <= "C" ? 8 : row <= "F" ? 12 : 16;
    for (let n = 1; n <= seatsInRow; n++) {
      const rowIdx = rows.indexOf(row);
      let tier: SeatTier;
      const sold = Math.random() < 0.3;
      if (sold) tier = "sold";
      else if (rowIdx < 2) tier = "vip";
      else if (rowIdx < 5) tier = "premium";
      else tier = "standard";
      seats.push({ id: `${row}${n}`, row, number: n, tier, price: TIER_CONFIG[tier].price });
    }
  }
  return seats;
}

const ALL_SEATS = generateSeats();

export default function SeatingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const rows = [...new Set(ALL_SEATS.map(s => s.row))];

  function toggleSeat(seat: Seat) {
    if (seat.tier === "sold") return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
      return next;
    });
  }

  const selectedSeats = ALL_SEATS.filter(s => selected.has(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  async function handleCheckout() {
    if (selectedSeats.length === 0 || checkingOut) return;
    setCheckingOut(true);
    try {
      const tierOrder: SeatTier[] = ['vip', 'premium', 'standard'];
      const primarySeat = selectedSeats
        .slice()
        .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))[0];
      const tier = (primarySeat?.tier ?? 'standard').toUpperCase();
      const averageFaceValue = Math.max(1, Math.round(totalPrice / selectedSeats.length));

      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: 'seating-event',
          venueSlug: 'tmi-platform',
          tier,
          quantity: selectedSeats.length,
          faceValue: averageFaceValue,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        router.push(data.url);
      } else {
        console.error('[seating] checkout error:', data.error);
        setCheckingOut(false);
      }
    } catch {
      setCheckingOut(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", paddingBottom: 120, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", textDecoration: "none" }}>← Venue Hub</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <Link href="/tickets" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Tickets</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: "#22c55e", marginBottom: 8 }}>SEATING MAP</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 6px" }}>Interactive Seat Selector</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Click any available seat to select it. Multiple selections allowed.</p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {(Object.entries(TIER_CONFIG) as [SeatTier, typeof TIER_CONFIG[SeatTier]][]).map(([tier, cfg]) => (
            <div key={tier} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.color}60` }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{cfg.label}{tier !== "sold" ? ` — $${cfg.price}` : " — Taken"}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          {/* Seat Grid */}
          <div>
            {/* Stage */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display: "inline-block", padding: "10px 60px", background: "linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,215,0,0.06))", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em" }}>
                ★ STAGE ★
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map(row => {
                const rowSeats = ALL_SEATS.filter(s => s.row === row);
                return (
                  <div key={row} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textAlign: "center", flexShrink: 0 }}>{row}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", justifyContent: "center", flex: 1 }}>
                      {rowSeats.map(seat => {
                        const cfg = TIER_CONFIG[seat.tier];
                        const isSelected = selected.has(seat.id);
                        return (
                          <div
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            title={`Row ${seat.row} Seat ${seat.number} — ${cfg.label}${seat.tier !== "sold" ? ` $${seat.price}` : ""}`}
                            style={{
                              width: 22, height: 20, borderRadius: 4,
                              background: isSelected ? cfg.color : cfg.bg,
                              border: `1px solid ${isSelected ? cfg.color : cfg.color + "50"}`,
                              cursor: seat.tier === "sold" ? "not-allowed" : "pointer",
                              transition: "transform 120ms",
                              flexShrink: 0,
                            }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textAlign: "center", flexShrink: 0 }}>{row}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Panel */}
          <div style={{ position: "sticky", top: 24 }}>
            {/* Hovered seat info */}
            <AnimatePresence>
              {hoveredSeat && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "16px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: TIER_CONFIG[hoveredSeat.tier].color, letterSpacing: "0.18em", marginBottom: 6 }}>
                    {TIER_CONFIG[hoveredSeat.tier].label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Row {hoveredSeat.row} · Seat {hoveredSeat.number}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", marginTop: 4 }}>
                    {hoveredSeat.tier === "sold" ? "Sold Out" : `$${hoveredSeat.price}`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.2em", marginBottom: 14 }}>
                SELECTED SEATS ({selectedSeats.length})
              </div>

              {selectedSeats.length === 0 ? (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
                  Click seats to select them
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
                    {selectedSeats.map(seat => (
                      <div key={seat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>Row {seat.row} · #{seat.number}</span>
                          <span style={{ marginLeft: 8, fontSize: 9, color: TIER_CONFIG[seat.tier].color, fontWeight: 700 }}>{TIER_CONFIG[seat.tier].label}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#FFD700" }}>${seat.price}</span>
                          <button onClick={() => toggleSeat(seat)} style={{ background: "none", border: "none", color: "#FF2DAA", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: "#00FF88" }}>${totalPrice}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} disabled={checkingOut}
                    style={{ display: "block", width: "100%", padding: "13px", background: checkingOut ? "rgba(0,255,136,0.5)" : "linear-gradient(135deg,#00FF88,#00FFFF)", color: "#050510", fontWeight: 800, fontSize: 13, borderRadius: 10, border: "none", cursor: checkingOut ? "not-allowed" : "pointer", textAlign: "center", letterSpacing: "0.06em" }}>
                    {checkingOut ? "Redirecting to Stripe..." : `Checkout — $${totalPrice} →`}
                  </button>
                </>
              )}
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/tickets/create" style={{ padding: "10px 14px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#22c55e", fontWeight: 700, fontSize: 12, textDecoration: "none", textAlign: "center" }}>
                🎟️ Create Tickets
              </Link>
              <Link href="/booking" style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 12, textDecoration: "none", textAlign: "center" }}>
                Booking Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
