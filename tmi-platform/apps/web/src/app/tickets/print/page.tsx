"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Seed ticket data (replace with API fetch per ticketId) ──────────────────
interface TicketData {
  id: string;
  eventName: string;
  venueName: string;
  venueAddress: string;
  date: string;
  doorsOpen: string;
  showTime: string;
  section: string;
  row: string;
  seat: string;
  holderName: string;
  ticketType: string;
  price: string;
  barcode: string;
  issueDate: string;
  accentColor: string;
}

const DEMO_TICKET: TicketData = {
  id: "TMI-2026-001",
  eventName: "Monthly Idol — Season 2 Premiere",
  venueName: "TMI Main Stage",
  venueAddress: "The Musician's Index Platform · Digital Venue",
  date: "Saturday, May 17 2026",
  doorsOpen: "6:30 PM",
  showTime: "8:00 PM",
  section: "VIP FLOOR",
  row: "A",
  seat: "12",
  holderName: "Fan Member",
  ticketType: "VIP Floor Pass",
  price: "$28.00",
  barcode: "TMI2026001A12VIPFLOOR",
  issueDate: "2026-05-03",
  accentColor: "#00FFFF",
};

// ─── QR code SVG (deterministic pattern from barcode string) ─────────────────
function QRCode({ value, size = 120 }: { value: string; size?: number }) {
  const cells = 12;
  const cell = Math.floor(size / cells);
  const grid: boolean[][] = Array.from({ length: cells }, (_, row) =>
    Array.from({ length: cells }, (_, col) => {
      const code = value.charCodeAt((row * cells + col) % value.length);
      return (code + row * 3 + col * 7) % 2 === 0;
    })
  );
  // Force fixed finder patterns
  const finderPositions: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    finderPositions.push([i, j]);
    finderPositions.push([cells - 3 + i, j]);
    finderPositions.push([i, cells - 3 + j]);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", borderRadius: 4 }}>
      <rect width={size} height={size} fill="#fff" />
      {grid.map((row, r) =>
        row.map((on, c) => {
          const isFinder = finderPositions.some(([fr, fc]) => fr === r && fc === c);
          return (on || isFinder) ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell - 1}
              height={cell - 1}
              fill={isFinder ? "#000" : "#1a1a2e"}
            />
          ) : null;
        })
      )}
    </svg>
  );
}

// ─── Ticket visual component ──────────────────────────────────────────────────
function PrintableTicket({ ticket }: { ticket: TicketData }) {
  const accent = ticket.accentColor;

  return (
    <div
      id="printable-ticket"
      style={{
        width: 680,
        background: "linear-gradient(135deg, #04020a 0%, #09051a 100%)",
        borderRadius: 18,
        border: `1.5px solid ${accent}55`,
        boxShadow: `0 0 40px ${accent}18, 0 0 0 1px rgba(255,255,255,0.05)`,
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Neon glow strip — top */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, #FF2DAA, ${accent}, transparent)` }} />

      {/* Main body */}
      <div style={{ display: "flex" }}>

        {/* Left — event info (wide) */}
        <div style={{ flex: 1, padding: "22px 22px 22px 24px", borderRight: `1px dashed ${accent}30` }}>

          {/* Venue badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}22`, border: `1px solid ${accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎵</div>
            <div>
              <div style={{ fontSize: 7, letterSpacing: "0.28em", color: accent, fontWeight: 900, textTransform: "uppercase" }}>THE MUSICIAN'S INDEX</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{ticket.venueName}</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 4, border: `1px solid ${accent}55`, fontSize: 7, fontWeight: 900, color: accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              OFFICIAL TICKET
            </div>
          </div>

          {/* Event name */}
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6, letterSpacing: "0.02em" }}>
            {ticket.eventName}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 18, letterSpacing: "0.08em" }}>
            {ticket.venueAddress}
          </div>

          {/* Date / time grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "DATE", value: ticket.date.split(",")[0] + "," },
              { label: "DOORS", value: ticket.doorsOpen },
              { label: "SHOWTIME", value: ticket.showTime },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid rgba(255,255,255,0.08)`, background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Seat info */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {[
              { label: "SECTION", value: ticket.section },
              { label: "ROW", value: ticket.row },
              { label: "SEAT", value: ticket.seat },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${accent}44`, background: `${accent}0a`, textAlign: "center" }}>
                <div style={{ fontSize: 7, letterSpacing: "0.22em", color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{value}</div>
              </div>
            ))}
            <div style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>TYPE</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: accent }}>{ticket.ticketType}</div>
            </div>
          </div>

          {/* Holder + price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>TICKET HOLDER</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{ticket.holderName}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>FACE VALUE</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{ticket.price}</div>
            </div>
          </div>
        </div>

        {/* Right — stub / QR */}
        <div style={{ width: 160, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, letterSpacing: "0.3em", color: accent, fontWeight: 900, textTransform: "uppercase", marginBottom: 10 }}>SCAN TO VERIFY</div>
            <div style={{ padding: 6, background: "#fff", borderRadius: 10, display: "inline-block" }}>
              <QRCode value={ticket.barcode} size={108} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 6 }}>TICKET ID</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: accent, letterSpacing: "0.1em", wordBreak: "break-all", textAlign: "center" }}>{ticket.id}</div>
            <div style={{ marginTop: 10, fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
              Issued: {ticket.issueDate}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode strip — bottom */}
      <div style={{ borderTop: `1px dashed ${accent}30`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, display: "flex", gap: 1 }}>
          {ticket.barcode.split("").map((char, i) => (
            <div
              key={i}
              style={{
                width: char.charCodeAt(0) % 2 === 0 ? 2 : 1,
                height: 24,
                background: i % 7 === 0 ? "#fff" : `${accent}cc`,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", flexShrink: 0 }}>
          {ticket.barcode}
        </div>
      </div>

      {/* Neon glow strip — bottom */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, #FF2DAA, ${accent}, #FF2DAA, transparent)` }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TicketPrintPage() {
  const [ticketId, setTicketId] = useState("TMI-2026-001");
  const [ticket, setTicket] = useState<TicketData>(DEMO_TICKET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTicket() {
    if (!ticketId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/print`, { cache: "no-store" });
      if (!res.ok) { setError("Ticket not found"); return; }
      // API returns ticketId + outputs; use demo data for now with injected ID
      setTicket({ ...DEMO_TICKET, id: ticketId });
    } catch {
      setError("Network error fetching ticket");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: fixed; top: 20px; left: 20px; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#03020a", color: "#fff", paddingBottom: 80 }}>
        {/* Header */}
        <div className="no-print" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/tickets" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← TICKETS</Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#c4b5fd", fontWeight: 800 }}>TMI TICKETING</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>TICKET PRINT CENTER</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/tickets/print-batch" style={{ padding: "8px 16px", border: "1px solid rgba(196,181,253,0.3)", borderRadius: 6, color: "#c4b5fd", fontSize: 10, fontWeight: 700, textDecoration: "none" }}>
              BATCH PRINT
            </Link>
            <Link href="/admin/ticket-scanner" style={{ padding: "8px 16px", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, color: "#00FFFF", fontSize: 10, fontWeight: 700, textDecoration: "none" }}>
              SCANNER
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>

          {/* Lookup */}
          <div className="no-print" style={{ background: "rgba(196,181,253,0.05)", border: "1px solid rgba(196,181,253,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>TICKET ID</div>
              <input
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. TMI-2026-001"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(196,181,253,0.3)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 13, outline: "none" }}
                onKeyDown={(e) => e.key === "Enter" && fetchTicket()}
              />
            </div>
            <button
              onClick={fetchTicket}
              disabled={loading}
              style={{ padding: "10px 20px", background: "#c4b5fd", border: "none", borderRadius: 8, color: "#050510", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
            >
              {loading ? "LOADING…" : "LOAD TICKET"}
            </button>
            {error && <div style={{ width: "100%", color: "#FF2DAA", fontSize: 11 }}>{error}</div>}
          </div>

          {/* Ticket preview */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <PrintableTicket ticket={ticket} />

            {/* Print controls */}
            <div className="no-print" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handlePrint}
                style={{ padding: "14px 36px", background: "#00FFFF", border: "none", borderRadius: 8, color: "#050510", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}
              >
                🖨️ PRINT TICKET
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("printable-ticket");
                  if (!el) return;
                  const text = `${ticket.eventName}\n${ticket.date} · ${ticket.showTime}\nSection: ${ticket.section} · Row: ${ticket.row} · Seat: ${ticket.seat}\nID: ${ticket.id}`;
                  navigator.clipboard.writeText(text);
                }}
                style={{ padding: "14px 24px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "transparent" }}
              >
                📋 COPY INFO
              </button>
              <Link
                href={`/api/tickets/${ticket.id}/print`}
                target="_blank"
                style={{ display: "inline-block", padding: "14px 24px", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, color: "#00FFFF", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
              >
                📄 RAW DATA
              </Link>
            </div>

            {/* NFT ticket option */}
            <div className="no-print" style={{ width: "100%", maxWidth: 680, background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "#AA2DFF", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>NFT Ticket Option</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Mint this ticket as a collectible NFT — proof of attendance, tradeable on TMI marketplace.</div>
              </div>
              <Link href="/avatar/nft" style={{ display: "inline-block", padding: "10px 20px", background: "#AA2DFF", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none", flexShrink: 0 }}>
                MINT AS NFT →
              </Link>
            </div>

            {/* Venue/Brick & Mortar note */}
            <div className="no-print" style={{ width: "100%", maxWidth: 680, background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 12, padding: "14px 18px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              <span style={{ color: "#00FFFF", fontWeight: 800 }}>Brick & Mortar Venues:</span> Use the Print button above to produce a physical ticket on any printer. Venues can customize the ticket template, add their own logo, seat map, and barcode via{" "}
              <Link href="/admin/venue-ticket-templates" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Admin → Venue Ticket Templates</Link>.
              The barcode is scannable via the{" "}
              <Link href="/tickets/scanner" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Ticket Scanner</Link>.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
