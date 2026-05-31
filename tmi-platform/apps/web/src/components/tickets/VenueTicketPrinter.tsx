"use client";

/**
 * VenueTicketPrinter — Print-ready ticket component.
 * Generates individual tickets with QR code, venue branding, and seat info.
 * Supports digital display, batch print, and NFT minting trigger.
 *
 * Print: uses window.print() + @media print CSS isolation.
 */

import { useRef, useCallback } from "react";

export interface TicketData {
  ticketId:     string;
  eventName:    string;
  artistName:   string;
  venueName:    string;
  venueAddress?: string;
  date:         string;
  time:         string;
  doorsOpen?:   string;
  seat?:        string;
  row?:         string;
  section?:     string;
  ticketType:   "general" | "vip" | "backstage" | "reserved" | "standing";
  holderName?:  string;
  price?:       string;
  qrData:       string;    // QR code payload (ticketId + secret)
  logoUrl?:     string;    // Venue logo
  bgColor?:     string;    // Ticket background
  accentColor?: string;    // Accent / branding color
  nftMinted?:   boolean;
  barcode?:     string;    // Optional barcode number
}

const TIER_COLORS: Record<string, string> = {
  general:   "#00FFFF",
  vip:       "#FFD700",
  backstage: "#FF2DAA",
  reserved:  "#AA2DFF",
  standing:  "#00FF88",
};

const TIER_LABELS: Record<string, string> = {
  general:   "General Admission",
  vip:       "VIP",
  backstage: "Backstage Pass",
  reserved:  "Reserved Seating",
  standing:  "Standing",
};

interface VenueTicketPrinterProps {
  tickets:   TicketData[];
  onMintNFT?: (ticketId: string) => void;
  showBatchPrint?: boolean;
}

function QRCodeBlock({ data, size = 90 }: { data: string; size?: number }) {
  // Generate QR using a public API — production should use a local lib like qrcode
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=050510&color=ffffff&margin=2`;
  return (
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 6, padding: 4, flexShrink: 0 }}>
      <img
        src={src}
        alt={`QR Code for ${data}`}
        width={size}
        height={size}
        style={{ display: "block", borderRadius: 4 }}
        onError={(e) => {
          // Fallback: render placeholder on load failure (offline / API limit)
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).parentElement!.innerHTML =
            `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#333;border-radius:4px;background:#eee;">QR</div>`;
        }}
      />
    </div>
  );
}

function Ticket({
  t,
  onMintNFT,
}: {
  t: TicketData;
  onMintNFT?: (id: string) => void;
}) {
  const tier   = t.ticketType;
  const accent = t.accentColor ?? TIER_COLORS[tier] ?? "#00FFFF";
  const bg     = t.bgColor     ?? "#050510";

  return (
    <div
      className="tmi-ticket"
      style={{
        width:     350,
        background: bg,
        border:    `2px solid ${accent}44`,
        borderRadius: 14,
        overflow:  "hidden",
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px ${accent}22`,
        fontFamily:"'Inter', Arial, sans-serif",
        color:     "#fff",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Top color bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      {/* Header */}
      <div style={{ padding: "16px 18px 10px", background: `${accent}08`, borderBottom: `1px solid ${accent}22` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {t.logoUrl && <img src={t.logoUrl} alt="venue logo" style={{ height: 28, marginBottom: 6, objectFit: "contain" }} />}
            <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>{t.eventName}</div>
            <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginTop: 2 }}>{t.artistName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ padding: "4px 10px", background: accent, borderRadius: 5, fontSize: 9, fontWeight: 900, color: "#050510", letterSpacing: "0.1em", display: "inline-block" }}>
              {TIER_LABELS[tier]}
            </div>
            {t.price && <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 5 }}>{t.price}</div>}
          </div>
        </div>
      </div>

      {/* Middle section */}
      <div style={{ padding: "14px 18px", display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Event info */}
        <div style={{ flex: 1 }}>
          {[
            ["📅 Date",    t.date],
            ["⏰ Time",    t.time],
            ["🚪 Doors",   t.doorsOpen],
            ["🏛️ Venue",  t.venueName],
            ["📍 Address", t.venueAddress],
          ].filter(([, v]) => !!v).map(([label, value]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{value}</div>
            </div>
          ))}

          {/* Seat info */}
          {(t.seat || t.row || t.section) && (
            <div style={{ display: "flex", gap: 12, marginTop: 6, padding: "8px", background: `${accent}12`, borderRadius: 6 }}>
              {t.section && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SECTION</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>{t.section}</div>
                </div>
              )}
              {t.row && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>ROW</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>{t.row}</div>
                </div>
              )}
              {t.seat && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SEAT</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>{t.seat}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR + ticket ID */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <QRCodeBlock data={t.qrData} size={90} />
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.06em" }}>
            #{t.ticketId.slice(-8).toUpperCase()}
          </div>
          {t.nftMinted && (
            <div style={{ fontSize: 7, fontWeight: 800, color: "#FFD700", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 4, padding: "2px 6px" }}>
              ✦ NFT
            </div>
          )}
        </div>
      </div>

      {/* Holder + barcode */}
      <div style={{ padding: "10px 18px 14px", borderTop: `1px solid ${accent}18`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {t.holderName && (
            <div style={{ fontSize: 11, fontWeight: 700 }}>{t.holderName}</div>
          )}
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {t.barcode ?? t.ticketId}
          </div>
        </div>
        {onMintNFT && !t.nftMinted && (
          <button
            type="button"
            onClick={() => onMintNFT(t.ticketId)}
            style={{ padding: "5px 12px", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6, cursor: "pointer", fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.06em" }}
          >
            Mint NFT ✦
          </button>
        )}
      </div>
    </div>
  );
}

export default function VenueTicketPrinter({ tickets, onMintNFT, showBatchPrint = true }: VenueTicketPrinterProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handlePrintSingle = useCallback((ticketId: string) => {
    const el = printRef.current?.querySelector(`[data-ticket-id="${ticketId}"]`) as HTMLElement | null;
    if (!el) { window.print(); return; }
    // Isolate single ticket for print
    const clone = el.cloneNode(true) as HTMLElement;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>Ticket — ${ticketId}</title>
      <style>body{margin:20px;background:#050510;display:flex;justify-content:center;}</style>
      </head><body>${clone.outerHTML}<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>
    `);
    printWin.document.close();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Print controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>Ticket Manager</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</div>
        </div>
        {showBatchPrint && tickets.length > 0 && (
          <button
            type="button"
            onClick={handlePrint}
            style={{ padding: "10px 20px", background: "#00FF88", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#050510", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 7 }}
          >
            🖨️ Print All Tickets
          </button>
        )}
      </div>

      {/* Ticket grid */}
      <div
        ref={printRef}
        style={{ display: "flex", flexWrap: "wrap", gap: 20 }}
      >
        {tickets.map((t) => (
          <div key={t.ticketId} data-ticket-id={t.ticketId} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Ticket t={t} onMintNFT={onMintNFT} />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handlePrintSingle(t.ticketId)}
                style={{ flex: 1, padding: "7px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                🖨️ Print
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: "7px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                📧 Email
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: "7px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                📱 Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .tmi-ticket, .tmi-ticket * { visibility: visible !important; }
          .tmi-ticket { position: fixed; top: 10px; left: 10px; }
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
}
