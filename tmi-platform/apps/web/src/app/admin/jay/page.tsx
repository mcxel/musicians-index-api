"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminInboxRail from "@/components/admin/AdminInboxRail";
import AdminAnalyticsRail from "@/components/admin/AdminAnalyticsRail";
import AdminRevenueRail from "@/components/admin/AdminRevenueRail";
import { useEffect, useState } from "react";

const BOOKING_PANELS = [
  { label: "Open Bookings",     value: "34",    color: "#fcd34d" },
  { label: "Pending Approvals", value: "8",     color: "#f97316" },
  { label: "Confirmed Shows",   value: "21",    color: "#22c55e" },
  { label: "Venue Slots Live",  value: "6",     color: "#00FFFF" },
];

type BookingRequest = {
  id: string;
  venueSlug: string;
  artistSlug: string;
  offerAmount: number;
  expectedRevenue: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  accepted: "#22c55e",
  pending:  "#f59e0b",
  rejected: "#ef4444",
};

export default function JayHubPage() {
  const [bookingQueue, setBookingQueue] = useState<BookingRequest[] | null>(null);

  useEffect(() => {
    fetch("/api/booking/requests", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then((d: { requests?: BookingRequest[] }) => setBookingQueue(d.requests ?? []))
      .catch(() => setBookingQueue([]));
  }, []);

  return (
    <AdminShell
      hubId="jay"
      hubTitle="JAY PAUL — BOOKING"
      hubSubtitle="ARTIST + EDITORIAL OPS"
      backHref="/admin"
    >
      {/* Metrics strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {BOOKING_PANELS.map((m) => (
          <div
            key={m.label}
            style={{
              border: `1px solid ${m.color}33`,
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              padding: "8px 10px",
            }}
          >
            <p style={{ margin: 0, fontSize: 9, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {m.label}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 220px) minmax(0, 1fr) minmax(260px, 300px)",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "grid", gap: 10 }}>
          <AdminCommandRail hubRole="jay" />
          <AdminRevenueRail collapsed />
        </div>

        {/* CENTER — artist booking queue */}
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              border: "1px solid rgba(251,191,36,0.35)",
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(40,20,5,0.6), rgba(10,6,2,0.9))",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
              <strong style={{ color: "#fde68a", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                ARTIST BOOKING QUEUE
              </strong>
            </div>
            <div style={{ padding: 10, display: "grid", gap: 6 }}>
              {bookingQueue === null && (
                <p style={{ margin: 0, fontSize: 10, color: "#64748b", textAlign: "center", padding: "12px 0" }}>Loading requests…</p>
              )}
              {bookingQueue !== null && bookingQueue.length === 0 && (
                <p style={{ margin: 0, fontSize: 10, color: "#64748b", textAlign: "center", padding: "12px 0" }}>No booking requests yet.</p>
              )}
              {bookingQueue !== null && bookingQueue.map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 10,
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "7px 10px",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>{req.artistSlug}</p>
                    <p style={{ margin: 0, fontSize: 9, color: "#64748b" }}>Venue: {req.venueSlug} · ${req.offerAmount}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: STATUS_COLOR[req.status] ?? "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    {req.status}
                  </span>
                  <button
                    type="button"
                    style={{
                      borderRadius: 5,
                      border: "1px solid rgba(34,197,94,0.4)",
                      background: "rgba(5,46,22,0.4)",
                      color: "#86efac",
                      fontSize: 9,
                      padding: "3px 8px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    style={{
                      borderRadius: 5,
                      border: "1px solid rgba(239,68,68,0.35)",
                      background: "rgba(69,10,10,0.4)",
                      color: "#fca5a5",
                      fontSize: 9,
                      padding: "3px 8px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    HOLD
                  </button>
                </div>
              ))}
            </div>
          </div>

          <AdminAnalyticsRail defaultTab="magazine" />
        </div>

        {/* RIGHT — inbox */}
        <div style={{ display: "grid", gap: 10 }}>
          <AdminInboxRail />
        </div>
      </div>
    </AdminShell>
  );
}
