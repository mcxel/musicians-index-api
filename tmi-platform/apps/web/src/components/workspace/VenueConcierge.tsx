/**
 * VenueConcierge — PERFORMER-only floating workspace module (Pass 8.x).
 * Map/list hybrid: CSS heat canvas (no Leaflet/Mapbox — not in package.json).
 * Heat from real live sessions only; honest "No live activity data" otherwise.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import {
  getVenuesNear,
  type VenueGeoEntry,
} from "@/lib/venues/VenueGeoRegistry";

interface BookingSlotOption {
  label: string;
  dateIso: string;
}

/** Next 3 Saturday/Sunday/Friday labels — request dates only, not fake inventory. */
function upcomingSlotOptions(): BookingSlotOption[] {
  const out: BookingSlotOption[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let i = 0; i < 21 && out.length < 3; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 5 || day === 6 || day === 0) {
      const label = cursor.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      out.push({ label, dateIso: cursor.toISOString().slice(0, 10) });
    }
  }
  return out;
}

function heatDotColor(entry: VenueGeoEntry): string {
  if (entry.heatScore === null) return "rgba(255,255,255,0.28)";
  if (entry.heatScore >= 70) return "#FF2DAA";
  if (entry.heatScore >= 35) return "#FFD700";
  return "#00FFFF";
}

function projectToCanvas(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  width: number,
  height: number
): { x: number; y: number } {
  const pad = 28;
  const spanLat = Math.max(0.01, bounds.maxLat - bounds.minLat);
  const spanLng = Math.max(0.01, bounds.maxLng - bounds.minLng);
  const x = pad + ((lng - bounds.minLng) / spanLng) * (width - pad * 2);
  const y = pad + ((bounds.maxLat - lat) / spanLat) * (height - pad * 2);
  return { x, y };
}

function VenueConciergeInner() {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [geoNote, setGeoNote] = useState<string>(
    "Showing registry venues (no distance ranking — grant location or set performer geo)."
  );
  const [selected, setSelected] = useState<VenueGeoEntry | null>(null);
  const [slotDate, setSlotDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [mountedMap, setMountedMap] = useState(false);

  // Silent: map content mounts only when this module is visible (parent mounts on open).
  useEffect(() => {
    setMountedMap(true);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoNote("Ranked by distance from your location.");
      },
      () => {
        /* keep registry list without distance — Rule 20 honest fallback */
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  const entries = useMemo(() => {
    if (origin) return getVenuesNear(origin.lat, origin.lng, 5000);
    return getVenuesNear(null, null);
  }, [origin]);

  const slots = useMemo(() => upcomingSlotOptions(), []);

  useEffect(() => {
    if (!slotDate && slots[0]) setSlotDate(slots[0].dateIso);
  }, [slots, slotDate]);

  const bounds = useMemo(() => {
    if (!entries.length) {
      return { minLat: 24, maxLat: 49, minLng: -125, maxLng: -70 };
    }
    const lats = entries.map((e) => e.lat);
    const lngs = entries.map((e) => e.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [entries]);

  const requestBooking = useCallback(async () => {
    if (!selected) return;
    setSubmitting(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/venues/booking-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueSlug: selected.venue.slug,
          eventDate: slotDate || slots[0]?.dateIso,
          eventType: "concert",
          notes: "Requested via Venue Concierge",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        bookingId?: string;
      };
      if (!res.ok || !data.ok) {
        setStatusMsg(data.error ?? "Booking request could not be recorded.");
        return;
      }
      setStatusMsg(
        data.message ??
          (data.bookingId
            ? `Booking request ${data.bookingId} recorded.`
            : "Booking request recorded.")
      );
    } catch {
      setStatusMsg("Unable to reach booking service.");
    } finally {
      setSubmitting(false);
    }
  }, [selected, slotDate, slots]);

  const canvasW = 520;
  const canvasH = 220;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, color: "#f4f1ff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "#FFD700",
              textTransform: "uppercase",
            }}
          >
            Venue Concierge
          </div>
          <div style={{ fontSize: 12, color: "rgba(244,241,255,0.65)", marginTop: 4 }}>
            {geoNote}
          </div>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#FFD700",
            border: "1px solid rgba(255,215,0,0.45)",
            borderRadius: 6,
            padding: "4px 8px",
            whiteSpace: "nowrap",
          }}
        >
          FLIGHT DECK
        </span>
      </div>

      {/* Aesthetic dark canvas + CSS heat dots (no map SDK) */}
      {mountedMap && (
        <div
          style={{
            position: "relative",
            height: canvasH,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,215,0,0.28)",
            background:
              "radial-gradient(ellipse at 40% 30%, rgba(255,215,0,0.08), transparent 55%), linear-gradient(160deg, #0a0614 0%, #050510 55%, #12081f 100%)",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.55), 0 0 24px rgba(255,215,0,0.08)",
          }}
          aria-label="Venue heatmap canvas"
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${canvasW} ${canvasH}`} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="concierge-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="rgba(255,215,0,0.06)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width={canvasW} height={canvasH} fill="url(#concierge-grid)" />
            {entries.map((entry) => {
              const { x, y } = projectToCanvas(entry.lat, entry.lng, bounds, canvasW, canvasH);
              const color = heatDotColor(entry);
              const r = entry.heatScore !== null ? 7 + entry.heatScore / 20 : 5;
              const active = selected?.venue.id === entry.venue.id;
              return (
                <g
                  key={entry.venue.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(entry)}
                >
                  {entry.heatScore !== null && (
                    <circle cx={x} cy={y} r={r + 8} fill={color} opacity={0.15} />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? r + 2 : r}
                    fill={color}
                    stroke={active ? "#FFD700" : "rgba(255,255,255,0.35)"}
                    strokeWidth={active ? 2 : 1}
                    opacity={entry.heatScore === null ? 0.55 : 0.95}
                  />
                </g>
              );
            })}
          </svg>
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 8,
              fontSize: 9,
              color: "rgba(244,241,255,0.5)",
              letterSpacing: "0.06em",
            }}
          >
            LIVE heat only · neutral dots = no live activity data
          </div>
        </div>
      )}

      {/* Venue list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
        {entries.length === 0 ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px dashed rgba(255,215,0,0.3)",
              color: "rgba(244,241,255,0.7)",
              fontSize: 12,
            }}
          >
            No venues in registry geo layer yet.
          </div>
        ) : (
          entries.map((entry) => {
            const active = selected?.venue.id === entry.venue.id;
            return (
              <button
                key={entry.venue.id}
                type="button"
                onClick={() => setSelected(entry)}
                style={{
                  textAlign: "left",
                  borderRadius: 12,
                  border: active
                    ? "1px solid rgba(255,215,0,0.55)"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: active ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)",
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#f4f1ff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{entry.venue.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(244,241,255,0.55)" }}>
                    {entry.distanceKm !== null ? `${entry.distanceKm.toFixed(0)} km` : "—"}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(244,241,255,0.6)", marginTop: 2 }}>
                  {entry.venue.city} · {entry.venue.category} · {entry.venue.tier}
                </div>
                <div style={{ fontSize: 10, marginTop: 4, color: heatDotColor(entry) }}>
                  {entry.activityStatus === "LIVE"
                    ? `LIVE · ${entry.liveViewerCount ?? 0} viewers · heat ${entry.heatScore}`
                    : "No live activity data"}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Detail / booking */}
      {selected && (
        <div
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,215,0,0.35)",
            background: "linear-gradient(145deg, rgba(20,14,6,0.95), rgba(8,6,16,0.92))",
            padding: 14,
            boxShadow: "0 0 28px rgba(255,215,0,0.08)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>
            {selected.venue.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,241,255,0.65)", marginTop: 4 }}>
            Capacity {selected.venue.capacity.toLocaleString()} ·{" "}
            <Link href={selected.venue.profileRoute} style={{ color: "#00FFFF" }}>
              Open profile
            </Link>
            {" · "}
            <Link href={selected.venue.ticketRoute} style={{ color: "#00FFFF" }}>
              Tickets
            </Link>
          </div>

          <div style={{ marginTop: 12, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,215,0,0.8)" }}>
            REQUEST SLOT
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {slots.map((s) => (
              <button
                key={s.dateIso}
                type="button"
                onClick={() => setSlotDate(s.dateIso)}
                style={{
                  borderRadius: 8,
                  border:
                    slotDate === s.dateIso
                      ? "1px solid #FFD700"
                      : "1px solid rgba(255,255,255,0.15)",
                  background:
                    slotDate === s.dateIso ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.04)",
                  color: "#f4f1ff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void requestBooking()}
              style={{
                flex: 1,
                minWidth: 140,
                borderRadius: 10,
                border: "1px solid #FFD700",
                background: "linear-gradient(135deg, rgba(255,215,0,0.35), rgba(170,45,255,0.25))",
                color: "#fff",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "10px 14px",
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "SENDING…" : "REQUEST BOOKING"}
            </button>
            <Link
              href={`/venues/${selected.venue.slug}/booking`}
              style={{
                borderRadius: 10,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "rgba(0,255,255,0.08)",
                color: "#00FFFF",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                padding: "10px 14px",
                textDecoration: "none",
              }}
            >
              FULL BOOKING PAGE
            </Link>
          </div>

          {statusMsg && (
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(244,241,255,0.85)" }}>
              {statusMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VenueConcierge() {
  return (
    <RoleGate
      allow={["PERFORMER", "ARTIST", "BAND", "ADMIN", "STAFF"]}
      fallback={
        <div
          style={{
            padding: 18,
            borderRadius: 12,
            border: "1px solid rgba(255,215,0,0.25)",
            color: "rgba(244,241,255,0.7)",
            fontSize: 13,
          }}
        >
          Venue Concierge is available to Performer accounts only.
        </div>
      }
    >
      <VenueConciergeInner />
    </RoleGate>
  );
}
