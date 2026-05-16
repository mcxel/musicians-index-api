"use client";

import { useState } from "react";
import type { TicketRecord } from "@/lib/tickets/ticketCore";
import { printTicket, verifyTicket } from "@/lib/tickets/ticketEngine";

type PrintMode = "digital" | "print";

type VenueBranding = {
  venueName: string;
  venueSlug: string;
  primaryColor: string;
  accentColor: string;
  logoText?: string;
};

type VenueTicketPrintShellProps = {
  ticket: TicketRecord;
  branding?: Partial<VenueBranding>;
  faceScanId?: string | null;
  onPrinted?: (mode: PrintMode) => void;
};

const TIER_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  VIP: { bg: "rgba(255,215,0,0.12)", border: "#FFD700", label: "#FFD700" },
  BACKSTAGE: { bg: "rgba(255,45,170,0.1)", border: "#FF2DAA", label: "#FF2DAA" },
  MEET_AND_GREET: { bg: "rgba(170,45,255,0.1)", border: "#AA2DFF", label: "#c4b5fd" },
  STANDARD: { bg: "rgba(0,255,255,0.07)", border: "#00FFFF", label: "#00FFFF" },
  SEASON_PASS: { bg: "rgba(249,115,22,0.1)", border: "#f97316", label: "#fb923c" },
  BATTLE_PASS: { bg: "rgba(239,68,68,0.1)", border: "#ef4444", label: "#f87171" },
  default: { bg: "rgba(255,255,255,0.05)", border: "#334155", label: "#94a3b8" },
};

function QRBlock({ value, size = 80 }: { value: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 4, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, padding: 6, flexShrink: 0 }}>
      {Array.from({ length: 36 }).map((_, i) => {
        const hash = (value.charCodeAt(i % value.length) + i * 7) % 4;
        const dark = hash < 2;
        const corner = (i < 7 || (i >= 28 && i < 35) || (i % 6 === 0 && i < 30));
        return (
          <div key={i} style={{ background: dark || corner ? "#000" : "#fff", borderRadius: 1 }} />
        );
      })}
    </div>
  );
}

export default function VenueTicketPrintShell({ ticket, branding, faceScanId, onPrinted }: VenueTicketPrintShellProps) {
  const [mode, setMode] = useState<PrintMode>("digital");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [printed, setPrinted] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const tier = ticket.template.tier;
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.default;
  const venueName = branding?.venueName ?? ticket.template.venueSlug.replace(/-/g, " ").toUpperCase();
  const primary = branding?.primaryColor ?? tierStyle.border;
  const accent = branding?.accentColor ?? "#e2e8f0";

  function handleVerify() {
    const result = verifyTicket(ticket.id);
    setVerified(!!(result as { valid?: boolean }).valid);
  }

  function handlePrint() {
    printTicket(ticket.id);
    setPrinted(true);
    onPrinted?.(mode);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        {(["digital", "print"] as PrintMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, background: mode === m ? `${primary}22` : "transparent", border: `1px solid ${mode === m ? primary : "#334155"}`, borderRadius: 6, color: mode === m ? primary : "#64748b", fontSize: 10, padding: "5px 0", cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {m === "digital" ? "DIGITAL / WALLET" : "PRINT / PDF"}
          </button>
        ))}
      </div>

      {/* ── Ticket face ── */}
      <div style={{
        background: mode === "print" ? "#fff" : "linear-gradient(135deg, #0a0712 0%, #160d25 100%)",
        border: `2px solid ${primary}`,
        borderRadius: mode === "print" ? 4 : 14,
        overflow: "hidden",
        boxShadow: mode === "print" ? "none" : `0 0 24px ${primary}33`,
        fontFamily: mode === "print" ? "monospace" : "inherit",
        color: mode === "print" ? "#000" : "#e2e8f0",
      }}>
        {/* Venue header band */}
        <div style={{ background: mode === "print" ? primary : `linear-gradient(90deg, ${primary}33, ${primary}11)`, borderBottom: `1px solid ${primary}55`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: mode === "print" ? "#fff" : primary, fontSize: 13, fontWeight: 800, letterSpacing: "0.15em" }}>
              {branding?.logoText ?? venueName}
            </div>
            <div style={{ color: mode === "print" ? "rgba(255,255,255,0.7)" : "#64748b", fontSize: 9, letterSpacing: "0.1em", marginTop: 1 }}>
              THE MUSICIAN&apos;S INDEX · OFFICIAL TICKET
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: `${tierStyle.bg}`, border: `1px solid ${primary}`, borderRadius: 4, color: tierStyle.label, fontSize: 10, fontWeight: 800, padding: "3px 10px", letterSpacing: "0.12em" }}>
              {tier}
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Event info */}
            <div>
              <div style={{ color: mode === "print" ? "#666" : "#64748b", fontSize: 9, letterSpacing: "0.12em", marginBottom: 3 }}>EVENT</div>
              <div style={{ color: mode === "print" ? "#000" : accent, fontSize: 14, fontWeight: 700 }}>
                {ticket.template.eventSlug.replace(/-/g, " ").toUpperCase()}
              </div>
            </div>

            {/* Seat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                ["SECTION", ticket.seat.section],
                ["ROW", ticket.seat.row],
                ["SEAT", ticket.seat.seat],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: mode === "print" ? "#f5f5f5" : "rgba(255,255,255,0.04)", border: `1px solid ${mode === "print" ? "#ddd" : "#1e293b"}`, borderRadius: 6, padding: "6px 8px" }}>
                  <div style={{ color: mode === "print" ? "#888" : "#475569", fontSize: 8, letterSpacing: "0.1em" }}>{lbl}</div>
                  <div style={{ color: mode === "print" ? "#000" : primary, fontSize: 13, fontWeight: 800, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Face ID & Ticket ID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: mode === "print" ? "#f5f5f5" : "rgba(255,255,255,0.03)", border: `1px solid ${mode === "print" ? "#ddd" : "#1e293b"}`, borderRadius: 6, padding: "6px 8px" }}>
                <div style={{ color: mode === "print" ? "#888" : "#475569", fontSize: 8, letterSpacing: "0.1em" }}>FACE ID</div>
                <div style={{ color: mode === "print" ? "#333" : "#64748b", fontSize: 9, fontFamily: "monospace", marginTop: 2, wordBreak: "break-all" }}>
                  {faceScanId ? faceScanId.slice(-12) : "NO SCAN LINKED"}
                </div>
              </div>
              <div style={{ background: mode === "print" ? "#f5f5f5" : "rgba(255,255,255,0.03)", border: `1px solid ${mode === "print" ? "#ddd" : "#1e293b"}`, borderRadius: 6, padding: "6px 8px" }}>
                <div style={{ color: mode === "print" ? "#888" : "#475569", fontSize: 8, letterSpacing: "0.1em" }}>TICKET ID</div>
                <div style={{ color: mode === "print" ? "#333" : "#64748b", fontSize: 9, fontFamily: "monospace", marginTop: 2 }}>{ticket.id.slice(-10)}</div>
              </div>
            </div>

            {/* Price & format badges */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: mode === "print" ? "#000" : "#fcd34d", fontSize: 13, fontWeight: 800 }}>
                ${ticket.template.faceValue}
              </span>
              {ticket.outputFormats.map(fmt => (
                <span key={fmt} style={{ background: mode === "print" ? "#eee" : "rgba(255,255,255,0.06)", border: `1px solid ${mode === "print" ? "#ccc" : "#334155"}`, borderRadius: 4, color: mode === "print" ? "#444" : "#64748b", fontSize: 8, padding: "2px 6px", fontWeight: 700 }}>
                  {fmt}
                </span>
              ))}
              {ticket.outputFormats.includes("NFT") && (
                <span style={{ background: mode === "print" ? "#fff3cd" : "rgba(170,45,255,0.15)", border: `1px solid ${mode === "print" ? "#ffc107" : "rgba(170,45,255,0.4)"}`, borderRadius: 4, color: mode === "print" ? "#856404" : "#c4b5fd", fontSize: 8, padding: "2px 6px", fontWeight: 800 }}>
                  NFT VERIFIED ✓
                </span>
              )}
            </div>
          </div>

          {/* QR */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {showQR ? (
              <QRBlock value={ticket.barcode.qrValue} size={80} />
            ) : (
              <div style={{ width: 80, height: 80, border: `1px dashed ${primary}40`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#475569", textAlign: "center", lineHeight: 1.4 }}>QR<br/>HIDDEN</span>
              </div>
            )}
            <div style={{ color: mode === "print" ? "#888" : "#475569", fontSize: 8, textAlign: "center", fontFamily: "monospace", maxWidth: 80, wordBreak: "break-all" }}>
              {ticket.barcode.barcodeValue.slice(-14)}
            </div>
          </div>
        </div>

        {/* NFT hologram strip */}
        {ticket.outputFormats.includes("NFT") && (
          <div style={{ background: mode === "print" ? "linear-gradient(90deg, #7c3aed, #db2777, #2563eb)" : "linear-gradient(90deg, rgba(170,45,255,0.2), rgba(255,45,170,0.2), rgba(0,255,255,0.2))", borderTop: `1px solid ${mode === "print" ? "transparent" : primary + "44"}`, padding: "5px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: mode === "print" ? "#fff" : "#c4b5fd", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em" }}>TMI NFT VERIFIED · {ticket.branding.hologramNftOverlay.slice(-16)}</span>
            <span style={{ color: mode === "print" ? "#fff" : "#64748b", fontSize: 8 }}>{ticket.mintedAt.slice(0, 10)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <button onClick={handleVerify} style={{ background: verified === null ? "rgba(255,255,255,0.05)" : verified ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)", border: `1px solid ${verified === null ? "#334155" : verified ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.35)"}`, borderRadius: 7, color: verified === null ? "#94a3b8" : verified ? "#22c55e" : "#f87171", fontSize: 11, padding: "9px 0", cursor: "pointer", fontWeight: 700 }}>
          {verified === null ? "VERIFY TICKET" : verified ? "✓ VERIFIED" : "✗ INVALID"}
        </button>
        <button onClick={handlePrint} style={{ background: printed ? "rgba(34,197,94,0.12)" : `${primary}22`, border: `1px solid ${printed ? "rgba(34,197,94,0.4)" : primary + "55"}`, borderRadius: 7, color: printed ? "#22c55e" : primary, fontSize: 11, padding: "9px 0", cursor: "pointer", fontWeight: 700 }}>
          {printed ? "✓ SENT" : mode === "print" ? "PRINT / PDF" : "SAVE TO WALLET"}
        </button>
        <button onClick={() => setShowQR(p => !p)} style={{ background: showQR ? "rgba(0,255,255,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${showQR ? "rgba(0,255,255,0.35)" : "#334155"}`, borderRadius: 7, color: showQR ? "#00FFFF" : "#64748b", fontSize: 11, padding: "9px 0", cursor: "pointer", fontWeight: 700 }}>
          {showQR ? "HIDE QR" : "SHOW QR"}
        </button>
      </div>
    </div>
  );
}
