"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TicketData {
  id: string;
  eventName: string;
  artistName: string;
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
  nftId?: string;
}

// ── Demo seed (real API would return this per ticketId) ───────────────────────

function buildDemoTicket(ticketId: string): TicketData {
  const hash = ticketId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = ["#00FFFF", "#FF2DAA", "#00FF88", "#FFD700", "#AA2DFF"];
  return {
    id: ticketId,
    eventName: "Monthly Idol — Season 2",
    artistName: "Featured Artists",
    venueName: "TMI Main Stage",
    venueAddress: "The Musician's Index Platform · Digital Venue",
    date: "Saturday, May 17 2026",
    doorsOpen: "6:30 PM",
    showTime: "8:00 PM",
    section: "VIP FLOOR",
    row: "A",
    seat: String((hash % 50) + 1),
    holderName: "Ticket Holder",
    ticketType: "VIP Floor Pass",
    price: "$28.00",
    barcode: ticketId.replace(/-/g, "").toUpperCase() + "VIPFLOOR",
    issueDate: "2026-05-03",
    accentColor: colors[hash % colors.length],
    nftId: `nft_${ticketId.toLowerCase()}`,
  };
}

// ── QR Code SVG (deterministic from barcode) ──────────────────────────────────

function QRCode({ value, size = 120 }: { value: string; size?: number }) {
  const cells = 12;
  const cell  = Math.floor(size / cells);
  const grid: boolean[][] = Array.from({ length: cells }, (_, row) =>
    Array.from({ length: cells }, (_, col) => {
      const code = value.charCodeAt((row * cells + col) % value.length);
      return (code + row * 3 + col * 7) % 2 === 0;
    })
  );
  const finderPositions: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    finderPositions.push([i, j], [cells - 3 + i, j], [i, cells - 3 + j]);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", borderRadius: 4 }}>
      <rect width={size} height={size} fill="#fff" />
      {grid.map((rowArr, r) =>
        rowArr.map((on, c) => {
          const isFinder = finderPositions.some(([fr, fc]) => fr === r && fc === c);
          return (on || isFinder) ? (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 1} height={cell - 1} fill={isFinder ? "#000" : "#1a1a2e"} />
          ) : null;
        })
      )}
    </svg>
  );
}

// ── PrintableTicket ───────────────────────────────────────────────────────────

function PrintableTicket({ ticket }: { ticket: TicketData }) {
  const accent = ticket.accentColor;

  return (
    <div
      id="printable-ticket"
      style={{
        width: "100%",
        maxWidth: 680,
        background: "linear-gradient(135deg, #04020a 0%, #09051a 100%)",
        borderRadius: 18,
        border: `1.5px solid ${accent}55`,
        boxShadow: `0 0 40px ${accent}18, 0 0 0 1px rgba(255,255,255,0.05)`,
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Top glow strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, #FF2DAA, ${accent}, transparent)` }} />

      {/* Main body */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>

        {/* Left — event info */}
        <div style={{ flex: 1, minWidth: 280, padding: "22px 22px 22px 24px", borderRight: `1px dashed ${accent}30` }}>

          {/* TMI logo + venue badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}22`, border: `1px solid ${accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎵</div>
            <div>
              <div style={{ fontSize: 7, letterSpacing: "0.28em", color: accent, fontWeight: 900 }}>THE MUSICIAN&apos;S INDEX</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{ticket.venueName}</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 4, border: `1px solid ${accent}55`, fontSize: 7, fontWeight: 900, color: accent, letterSpacing: "0.2em" }}>
              OFFICIAL
            </div>
          </div>

          {/* Event name */}
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{ticket.eventName}</div>
          <div style={{ fontSize: 10, color: accent, fontWeight: 700, marginBottom: 4 }}>{ticket.artistName}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>{ticket.venueAddress}</div>

          {/* Date / time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "DATE", value: ticket.date.split(",")[0] },
              { label: "DOORS", value: ticket.doorsOpen },
              { label: "SHOW", value: ticket.showTime },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "7px 8px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Seat info */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { label: "SECTION", value: ticket.section },
              { label: "ROW", value: ticket.row },
              { label: "SEAT", value: ticket.seat },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "7px 12px", borderRadius: 7, border: `1px solid ${accent}44`, background: `${accent}0a`, textAlign: "center" }}>
                <div style={{ fontSize: 6, letterSpacing: "0.2em", color: accent, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{value}</div>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 80, padding: "7px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 6, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 3 }}>TYPE</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent }}>{ticket.ticketType}</div>
            </div>
          </div>

          {/* Holder + price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 2 }}>TICKET HOLDER</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{ticket.holderName}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 2 }}>FACE VALUE</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{ticket.price}</div>
            </div>
          </div>
        </div>

        {/* Right stub — QR + ID */}
        <div style={{ width: 150, padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, letterSpacing: "0.3em", color: accent, fontWeight: 900, marginBottom: 10 }}>SCAN TO VERIFY</div>
            <div style={{ padding: 5, background: "#fff", borderRadius: 8, display: "inline-block" }}>
              <QRCode value={ticket.barcode} size={100} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 6, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>TICKET ID</div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: accent, wordBreak: "break-all" }}>{ticket.id}</div>
            {ticket.nftId && (
              <div style={{ marginTop: 6, fontSize: 6, color: "rgba(170,45,255,0.7)", letterSpacing: "0.1em" }}>
                NFT: {ticket.nftId.slice(0, 16)}…
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 6, color: "rgba(255,255,255,0.2)" }}>Issued: {ticket.issueDate}</div>
          </div>
        </div>
      </div>

      {/* Barcode strip */}
      <div style={{ borderTop: `1px dashed ${accent}30`, padding: "8px 22px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, display: "flex", gap: 1, alignItems: "center" }}>
          {ticket.barcode.split("").map((char, i) => (
            <div key={i} style={{ width: char.charCodeAt(0) % 2 === 0 ? 2 : 1, height: 22, background: i % 7 === 0 ? "#fff" : `${accent}cc`, borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ fontSize: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{ticket.barcode}</div>
      </div>

      {/* Bottom glow strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, #FF2DAA, ${accent}, #FF2DAA, transparent)` }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TicketPrintByIdPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = use(params);
  const [ticket, setTicket]   = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"digital" | "print">("digital");

  useEffect(() => {
    setLoading(true);
    // Try real API; fall back to demo data
    fetch(`/api/tickets/${encodeURIComponent(ticketId)}/print`, { cache: "no-store" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json() as Partial<TicketData>;
          setTicket({ ...buildDemoTicket(ticketId), ...data });
        } else {
          setTicket(buildDemoTicket(ticketId));
        }
      })
      .catch(() => setTicket(buildDemoTicket(ticketId)))
      .finally(() => setLoading(false));
  }, [ticketId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#03020a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎟️</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>LOADING TICKET…</div>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main style={{ minHeight: "100vh", background: "#03020a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Ticket Not Found</div>
          <Link href="/tickets" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Back to Tickets</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Print media styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket {
            position: fixed !important;
            top: 10mm;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: none !important;
            border-color: #ccc !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#03020a", color: "#fff", paddingBottom: 80 }}>

        {/* Header — hidden on print */}
        <div className="no-print" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/tickets/print" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← PRINT CENTER</Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#c4b5fd", fontWeight: 800 }}>TMI TICKETING</div>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: "2px 0 0" }}>Ticket #{ticketId}</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/tickets/scanner" style={{ padding: "7px 14px", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, color: "#00FFFF", fontSize: 9, fontWeight: 700, textDecoration: "none" }}>
              SCANNER
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>

          {/* View toggle */}
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["digital", "print"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", borderRadius: 8, border: `1px solid ${view === v ? ticket.accentColor : "rgba(255,255,255,0.12)"}`, background: view === v ? `${ticket.accentColor}15` : "transparent", color: view === v ? ticket.accentColor : "rgba(255,255,255,0.4)", cursor: "pointer" }}
              >
                {v === "digital" ? "DIGITAL VIEW" : "PRINT VIEW"}
              </button>
            ))}
          </div>

          {/* Digital view */}
          {view === "digital" && (
            <div className="no-print" style={{ marginBottom: 24 }}>
              {/* Summary card */}
              <div style={{ background: `${ticket.accentColor}08`, border: `1px solid ${ticket.accentColor}30`, borderRadius: 14, padding: "20px 22px", marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.3em", color: ticket.accentColor, fontWeight: 900, marginBottom: 8 }}>EVENT DETAILS</div>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{ticket.eventName}</div>
                  <div style={{ fontSize: 12, color: ticket.accentColor, fontWeight: 700, marginBottom: 8 }}>{ticket.artistName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{ticket.date} · {ticket.showTime}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ticket.venueName} · {ticket.venueAddress}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ padding: 6, background: "#fff", borderRadius: 10 }}>
                    <QRCode value={ticket.barcode} size={110} />
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textAlign: "center" }}>Scan for entry</div>
                </div>
              </div>

              {/* Seat + metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                {[
                  { label: "SECTION", value: ticket.section, color: ticket.accentColor },
                  { label: "ROW", value: ticket.row, color: ticket.accentColor },
                  { label: "SEAT", value: ticket.seat, color: ticket.accentColor },
                  { label: "TYPE", value: ticket.ticketType, color: "#FFD700" },
                  { label: "FACE VALUE", value: ticket.price, color: "#FFD700" },
                  { label: "HOLDER", value: ticket.holderName, color: "#fff" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* NFT link */}
              {ticket.nftId && (
                <div style={{ marginTop: 16, background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.25)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 900, letterSpacing: "0.15em", marginBottom: 3 }}>NFT TICKET</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>This ticket is minted as an NFT. Proof of attendance and tradeable.</div>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(170,45,255,0.7)", marginTop: 4 }}>{ticket.nftId}</div>
                  </div>
                  <Link href="/nft-lab/my-nfts" style={{ padding: "8px 16px", background: "#AA2DFF", borderRadius: 8, color: "#fff", fontSize: 10, fontWeight: 900, textDecoration: "none", flexShrink: 0 }}>VIEW NFT</Link>
                </div>
              )}
            </div>
          )}

          {/* Printable ticket */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <PrintableTicket ticket={ticket} />

            {/* Print controls */}
            <div className="no-print" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handlePrint}
                style={{ padding: "13px 36px", background: ticket.accentColor, border: "none", borderRadius: 8, color: "#050510", fontSize: 11, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}
              >
                🖨️ PRINT TICKET
              </button>
              <Link
                href={`/tickets/print?id=${ticketId}`}
                style={{ display: "inline-block", padding: "13px 20px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textDecoration: "none" }}
              >
                ← LOOKUP ANOTHER
              </Link>
            </div>

            {/* Venue printing note */}
            <div className="no-print" style={{ width: "100%", maxWidth: 680, background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 10, padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              <span style={{ color: "#00FFFF", fontWeight: 800 }}>Brick &amp; Mortar Venues:</span> Print on any standard printer. Barcode is scannable via{" "}
              <Link href="/tickets/scanner" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Ticket Scanner</Link>.
              Customize templates at{" "}
              <Link href="/admin/venue-ticket-templates" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Admin → Venue Ticket Templates</Link>.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
