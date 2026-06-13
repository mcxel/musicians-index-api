"use client";
import { useState, useRef } from "react";
import Link from "next/link";

const ACCENT = "#00FFFF";
const BG = "#050510";

type ValidStatus = "idle" | "loading" | "valid" | "invalid" | "used" | "expired";

interface TicketResult {
  ticketId: string;
  eventName: string;
  holderName: string;
  ticketType: string;
  seat: string;
  date: string;
  vstatus: ValidStatus;
  reason?: string;
  checkedInAt?: string;
}

const DEMO: Record<string, TicketResult> = {
  "TMI2026001A12VIPFLOOR": { ticketId: "TMI2026001A12VIPFLOOR", eventName: "Monthly Idol — Season 2 Premiere", holderName: "Fan Member",  ticketType: "VIP Floor Pass",     seat: "A-12", date: "Sat May 17 2026 · 8:00 PM", vstatus: "valid"   },
  "TMI2026002B03RESERVED":  { ticketId: "TMI2026002B03RESERVED",  eventName: "Battle Night IV",                 holderName: "Jordan King",  ticketType: "Reserved Seating",   seat: "B-03", date: "Sun Jun 22 2026 · 9:00 PM", vstatus: "valid"   },
  "TMI2026000USED":         { ticketId: "TMI2026000USED",         eventName: "Cypher Night Finale",            holderName: "Alex Rivera",  ticketType: "General Admission",  seat: "GA",   date: "Fri Jun 6 2026 · 7:30 PM",  vstatus: "used",   checkedInAt: "Jun 6 2026 · 7:24 PM" },
  "TMI2025EXP001":          { ticketId: "TMI2025EXP001",          eventName: "Season 1 Finale",               holderName: "Morgan Lee",   ticketType: "VIP",                seat: "A-01", date: "Dec 20 2025 · 8:00 PM",     vstatus: "expired",reason: "Event date passed" },
};

function Badge({ s }: { s: ValidStatus }) {
  const map: Record<ValidStatus, [string, string]> = {
    idle:    ["AWAITING INPUT",   "rgba(255,255,255,0.4)"],
    loading: ["CHECKING...",      "#FFD700"              ],
    valid:   ["✓ VALID",          "#00FF88"              ],
    invalid: ["✗ INVALID",        "#FF4444"              ],
    used:    ["⚠ ALREADY USED",   "#FF9500"              ],
    expired: ["✗ EXPIRED",        "#FF4444"              ],
  };
  const [label, color] = map[s];
  return <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 8, background: `${color}15`, border: `1px solid ${color}40`, fontSize: 13, fontWeight: 900, color, letterSpacing: "0.08em" }}>{label}</span>;
}

export default function TicketsValidatePage() {
  const [ticketId, setTicketId] = useState("");
  const [vstatus, setVstatus]   = useState<ValidStatus>("idle");
  const [result, setResult]     = useState<TicketResult | null>(null);
  const [history, setHistory]   = useState<TicketResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = async () => {
    if (!ticketId.trim()) return;
    setVstatus("loading");
    setResult(null);
    await new Promise(r => setTimeout(r, 600));
    const id = ticketId.trim().toUpperCase();
    let r: TicketResult;

    if (DEMO[id]) {
      r = DEMO[id]!;
    } else {
      const res = await fetch("/api/tickets/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: id }) }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json() as { valid?: boolean; reason?: string };
        r = { ticketId: id, eventName: "—", holderName: "—", ticketType: "—", seat: "—", date: "—", vstatus: data.valid ? "valid" : "invalid", reason: data.reason };
      } else {
        r = { ticketId: id, eventName: "—", holderName: "—", ticketType: "—", seat: "—", date: "—", vstatus: "invalid", reason: "Ticket ID not found in system" };
      }
    }

    setResult(r);
    setVstatus(r.vstatus);
    setHistory(prev => [r, ...prev.slice(0, 9)]);
    setTicketId("");
    inputRef.current?.focus();
  };

  const glow = vstatus === "valid" ? "0 0 40px rgba(0,255,136,0.25)" : (vstatus === "invalid" || vstatus === "expired") ? "0 0 40px rgba(255,68,68,0.2)" : vstatus === "used" ? "0 0 40px rgba(255,149,0,0.2)" : "none";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      `}</style>

      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/ticketing" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Ticketing</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Validate</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link href="/tickets/print"   style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Print</Link>
          <Link href="/tickets/scanner" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Scanner</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 50% 30%, ${ACCENT}06, transparent 55%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 900, marginBottom: 8 }}>🎫 TICKET VALIDATION TERMINAL</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, margin: "0 0 8px", background: `linear-gradient(135deg, #fff, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Validate Ticket</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Enter a ticket ID or scan a barcode to verify admission status</p>
        </div>

        <div style={{ padding: "28px", background: "rgba(0,255,255,0.04)", border: `1px solid ${ACCENT}25`, borderRadius: 20, marginBottom: 24, boxShadow: glow, transition: "box-shadow .4s ease" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input ref={inputRef} autoFocus type="text" value={ticketId} onChange={e => setTicketId(e.target.value)} onKeyDown={e => e.key === "Enter" && validate()} placeholder="Enter ticket ID or scan barcode..." style={{ flex: 1, padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}30`, color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }} />
            <button onClick={validate} disabled={vstatus === "loading" || !ticketId.trim()} style={{ padding: "14px 24px", borderRadius: 10, background: vstatus === "loading" ? "rgba(0,255,255,0.1)" : ACCENT, color: "#020810", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer", minWidth: 100, opacity: !ticketId.trim() ? 0.5 : 1 }}>
              {vstatus === "loading" ? "CHECKING..." : "VALIDATE"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge s={vstatus} />
            {vstatus !== "idle" && <button onClick={() => { setVstatus("idle"); setResult(null); inputRef.current?.focus(); }} style={{ padding: "6px 16px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>RESET</button>}
          </div>

          {result && vstatus !== "loading" && (
            <div style={{ marginTop: 20, padding: "20px", background: vstatus === "valid" ? "rgba(0,255,136,0.06)" : "rgba(255,68,68,0.06)", border: `1px solid ${vstatus === "valid" ? "#00FF88" : "#FF4444"}30`, borderRadius: 14, animation: "fadeUp .3s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["TICKET ID", result.ticketId], ["EVENT", result.eventName], ["HOLDER", result.holderName], ["TYPE", result.ticketType], ["SEAT", result.seat], ["DATE", result.date]].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{value}</div>
                  </div>
                ))}
              </div>
              {result.reason       && <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,68,68,0.08)",  borderRadius: 7, fontSize: 11, color: "#FF4444"  }}>⚠ {result.reason}</div>}
              {result.checkedInAt  && <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,149,0,0.08)", borderRadius: 7, fontSize: 11, color: "#FF9500"  }}>Checked in at: {result.checkedInAt}</div>}
            </div>
          )}
        </div>

        <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>DEMO TICKET IDs (click to load)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(DEMO).map(id => (
              <button key={id} onClick={() => setTicketId(id)} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>{id}</button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 14 }}>RECENT VALIDATIONS</div>
            {history.map((h, i) => {
              const c = h.vstatus === "valid" ? "#00FF88" : h.vstatus === "used" ? "#FF9500" : "#FF4444";
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{h.ticketId}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{h.eventName} · {h.holderName}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: c, background: `${c}18`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase" }}>{h.vstatus}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {[
            { href: "/tickets/print",       label: "Print Tickets",  color: ACCENT    },
            { href: "/tickets/scanner",     label: "Camera Scanner", color: "#AA2DFF" },
            { href: "/ticketing",           label: "All Ticketing",  color: "#FFD700" },
            { href: "/admin/ticket-scanner",label: "Admin Scanner",  color: "#FF2DAA" },
            { href: "/hub/venue",           label: "Venue Hub",      color: "#22c55e" },
            { href: "/home/1",              label: "← Home",         color: "rgba(255,255,255,0.35)" },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
