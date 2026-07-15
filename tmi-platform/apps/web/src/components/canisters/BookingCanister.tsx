"use client";

/**
 * BookingCanister — Rule 15 canonical canister.
 * Fan-facing: Request Booking form.
 * Venue/Performer-facing: list of incoming booking requests.
 * Calls /api/booking/requests (GET = list, POST = submit request).
 * Empty state: "No booking requests yet."
 */

import { useState, useEffect, useCallback } from "react";
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
  /** The performer or venue slug for whom we're showing bookings. */
  entityId: string;
  entityType: "performer" | "venue" | "sponsor";
  accentColor?: string;
  /** If true, shows the request form; if false, shows the requests list. */
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
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [offerAmount, setOfferAmount] = useState(500);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking/requests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { requests?: BookingRequest[] };
        const all = data.requests ?? [];
        // Filter to requests relevant to this entity
        setRequests(
          all.filter(
            (r) => r.artistSlug === entityId || r.venueSlug === entityId,
          ).slice(0, 5),
        );
      }
    } catch {
      // API may not be wired yet — show empty state
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => { void load(); }, [load]);

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
          venueSlug:  entityType === "venue"     ? entityId : "unknown",
          offerAmount: offerAmount * 100, // convert to cents
          expectedRevenue: offerAmount * 300,
          note,
        }),
      });
      if (res.ok) {
        setMsg("Booking request sent — held for this session (durable storage in progress).");
        setNote("");
        void load();
      } else {
        setMsg("Could not send request — try again.");
      }
    } catch {
      setMsg("Network error — try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  const label: React.CSSProperties = {
    fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)",
    fontWeight: 800, marginBottom: 6, textTransform: "uppercase",
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          📅 BOOKING
        </div>
        <Link
          href="/booking"
          style={{
            fontSize: 9, color: accentColor, fontWeight: 700,
            textDecoration: "none", letterSpacing: "0.08em",
          }}
        >
          VIEW ALL →
        </Link>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {/* Request form */}
        {showRequestForm && (
          <div style={{
            marginBottom: requests.length > 0 ? 20 : 0,
            padding: "14px 16px",
            background: `${accentColor}08`,
            border: `1px solid ${accentColor}22`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: accentColor, marginBottom: 12 }}>
              Request Booking
            </div>
            <div style={label}>Offer Amount ($)</div>
            <input
              type="number"
              value={offerAmount}
              min={50}
              onChange={(e) => setOfferAmount(Math.max(50, Number(e.target.value)))}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 12, marginBottom: 10, boxSizing: "border-box",
              }}
            />
            <div style={label}>Note (optional)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Event details, dates, type of performance…"
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 11, resize: "none", marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => void submitRequest()}
                disabled={submitting}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: accentColor, color: "#050310", fontSize: 10,
                  fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1, letterSpacing: "0.08em",
                }}
              >
                {submitting ? "SENDING…" : "SEND REQUEST"}
              </button>
              {msg && (
                <span style={{
                  fontSize: 11,
                  color: msg.includes("sent") ? "#00FF88" : "#FF4444",
                }}>
                  {msg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Existing requests */}
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "16px 0" }}>
            Loading bookings…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12, padding: "16px 0" }}>
            No booking requests yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 4 }}>
              RECENT REQUESTS
            </div>
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>
                    {r.venueSlug} × {r.artistSlug}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Offer: ${(r.offerAmount / 100).toFixed(0)}
                  </div>
                </div>
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
                  color: r.status === "approved" ? "#00FF88" : r.status === "rejected" ? "#FF4444" : accentColor,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4, padding: "2px 8px",
                }}>
                  {(r.status ?? "PENDING").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCanister;
