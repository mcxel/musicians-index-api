"use client";

/**
 * BookingCanister — Phase 5.4 High-Fidelity Cyberpunk Venue Booking & Stage Directing Deck (Image 1 & 3 Style)
 * 3-Column Glassmorphic Deck:
 *   Left: Venue Offer & Performance Request Form (Offer Amount, Dates, Contract Terms)
 *   Center: Active Booking Pipeline & Incoming Venue Requests (Approved, Pending, Revenue Share)
 *   Right: Stage Tech Specs & Directing Telemetry (Audio Tech, Lighting Package, Security Protocol)
 */

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import Link from "next/link";

interface BookingRequest {
  id: string;
  venueSlug: string;
  artistSlug: string;
  offerAmount: number;
  expectedRevenue: number;
  status: string;
  createdAt?: number;
}

interface BookingCanisterProps {
  entityId: string;
  entityType: "performer" | "venue" | "sponsor";
  accentColor?: string;
  showRequestForm?: boolean;
}

export function BookingCanister({
  entityId,
  entityType,
  accentColor = "#00FF88",
  showRequestForm = true,
}: BookingCanisterProps) {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [offerAmount, setOfferAmount] = useState(2500);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/booking/requests", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { requests?: BookingRequest[] };
        const all = data.requests ?? [];
        setRequests(all.filter((r) => r.artistSlug === entityId || r.venueSlug === entityId).slice(0, 5));
      } else {
        setRequests([]);
        setLoadError(res.status === 401 ? "Sign in to view booking requests." : "Unable to load booking requests.");
      }
    } catch {
      setRequests([]);
      setLoadError("Unable to load booking requests.");
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitRequest() {
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/booking/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          artistSlug: entityType === "performer" ? entityId : "unknown",
          venueSlug: entityType === "venue" ? entityId : "unknown",
          offerAmount: offerAmount * 100,
          expectedRevenue: offerAmount * 300,
          note,
        }),
      });
      if (res.ok) {
        setMsg("Booking request dispatched to Venue Authority.");
        setNote("");
        void load();
      } else {
        setMsg("Could not send request.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  return (
    <div
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 25px ${accentColor}33`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}, #00FFFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            📅
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              VENUE BOOKING & STAGE DIRECTING DECK
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Contract agreements, revenue splits, stage tech specs & dates
            </div>
          </div>
        </div>

        <Link
          href="/booking"
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: accentColor,
            textDecoration: "none",
            letterSpacing: "0.08em",
            border: `1px solid ${accentColor}66`,
            borderRadius: 6,
            padding: "4px 10px",
            background: `${accentColor}18`,
          }}
        >
          OPEN FULL VENUE DIRECTORY ↗
        </Link>
      </div>

      {/* 3-Column Deck */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 260px", gap: 12 }}>
        {/* Left Column: Request Offer Form */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.12em" }}>STAGE OFFER FORM</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>OFFER AMOUNT ($)</div>
          <input
            type="number"
            value={offerAmount}
            min={100}
            onChange={(e) => setOfferAmount(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#00FF88",
              fontSize: 14,
              fontWeight: 900,
            }}
          />
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>CONTRACT NOTE & DATE</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Stage rider requirements, dates, expected crowd size..."
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 10,
              resize: "none",
            }}
          />
          <button
            type="button"
            onClick={() => void submitRequest()}
            disabled={submitting}
            style={{
              fontSize: 9,
              fontWeight: 900,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: `linear-gradient(135deg, ${accentColor}, #00FFFF)`,
              color: "#000",
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            {submitting ? "DISPATCHING..." : "DISPATCH BOOKING OFFER"}
          </button>
          {msg ? <div style={{ fontSize: 9, color: msg.includes("error") || msg.includes("Could not") || msg.includes("Network") ? "#FF6B6B" : "#00FF88", marginTop: 4 }}>{msg}</div> : null}
        </div>

        {/* Center Column: Recent Booking Pipeline */}
        <div style={{ background: "rgba(10,5,25,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>ACTIVE BOOKING PIPELINE</div>
          {loading ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", padding: "12px 4px" }}>Loading bookings…</div>
          ) : loadError ? (
            <div style={{ fontSize: 10, color: "#FF6B6B", padding: "12px 4px" }}>{loadError} <button type="button" onClick={() => void load()} style={{ marginLeft: 8, fontSize: 9, color: "#00FFFF", background: "transparent", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, cursor: "pointer" }}>Retry</button></div>
          ) : requests.length === 0 ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", padding: "12px 4px", lineHeight: 1.5 }}>
              No booking requests yet. Dispatch an offer or open the venue directory to start.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {requests.map((r) => (
                <div key={r.id} style={bookingCard(accentColor)}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900 }}>{r.venueSlug} × {r.artistSlug}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Offer: ${(r.offerAmount / 100).toFixed(0)}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: accentColor }}>{r.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Stage Tech Specs */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, fontSize: 9, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA" }}>STAGE TECH SPECS</div>
          <div>🔊 <strong>Audio Engine:</strong> 3D Spatial Web Audio</div>
          <div>💡 <strong>Lighting Rig:</strong> Automated Strobe & Laser Stack</div>
          <div>🛡 <strong>Security:</strong> Anti-Abuse Mod Bot Active</div>
          <div>📺 <strong>Broadcast:</strong> 1080p 60FPS Low-Latency WebRTC</div>
        </div>
      </div>
    </div>
  );
}

function bookingCard(color: string): CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${color}44`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
}

export default BookingCanister;
