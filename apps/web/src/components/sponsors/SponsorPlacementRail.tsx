"use client";

import { useState, useEffect, useCallback } from "react";

type PlacementSlot = {
  id: string;
  zone: "stage-banner" | "lobby-billboard" | "ticket-footer" | "digital-overlay" | "venue-wrap";
  venue: string;
  cpm: number;
  status: "available" | "taken";
  takenBy: string | null;
  capacity?: number;
  format: "banner" | "video" | "static" | "interactive";
};

const ZONE_COLORS: Record<PlacementSlot["zone"], string> = {
  "stage-banner": "#FF2DAA",
  "lobby-billboard": "#00FFFF",
  "ticket-footer": "#fcd34d",
  "digital-overlay": "#AA2DFF",
  "venue-wrap": "#f97316",
};

const ZONE_LABELS: Record<PlacementSlot["zone"], string> = {
  "stage-banner": "STAGE BANNER",
  "lobby-billboard": "LOBBY BILLBOARD",
  "ticket-footer": "TICKET FOOTER",
  "digital-overlay": "DIGITAL OVERLAY",
  "venue-wrap": "VENUE WRAP",
};

export default function SponsorPlacementRail({ sponsorSlug }: { sponsorSlug: string }) {
  const [slots, setSlots] = useState<PlacementSlot[]>([]);
  const [myPlacementsCount, setMyPlacementsCount] = useState<number>(0);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [avgCpm, setAvgCpm] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPlacements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sponsor/placements?slug=${encodeURIComponent(sponsorSlug)}`, { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch placement slots");
      const data = await res.json();
      if (data.ok) {
        setSlots(data.slots || []);
        setMyPlacementsCount(data.myPlacementsCount ?? 0);
        setAvailableCount(data.availableCount ?? 0);
        setAvgCpm(data.avgCpm ?? null);
      }
    } catch (err: any) {
      setActionError(err.message || "Error loading placements");
    } finally {
      setLoading(false);
    }
  }, [sponsorSlug]);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  async function attachSponsorToTicket(slotId: string) {
    try {
      setActionError(null);
      setProcessingId(slotId);
      const res = await fetch("/api/sponsor/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", slotId, sponsorSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setActionError(data.error || "Failed to claim slot");
        await fetchPlacements();
        return;
      }
      setSlots(data.slots || []);
      setMyPlacementsCount(data.myPlacementsCount ?? 0);
      setAvailableCount(data.availableCount ?? 0);
      setAvgCpm(data.avgCpm ?? null);
    } catch (err: any) {
      setActionError(err.message || "Network error claiming slot");
    } finally {
      setProcessingId(null);
    }
  }

  async function releaseSlot(slotId: string) {
    try {
      setActionError(null);
      setProcessingId(slotId);
      const res = await fetch("/api/sponsor/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release", slotId, sponsorSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setActionError(data.error || "Failed to release slot");
        await fetchPlacements();
        return;
      }
      setSlots(data.slots || []);
      setMyPlacementsCount(data.myPlacementsCount ?? 0);
      setAvailableCount(data.availableCount ?? 0);
      setAvgCpm(data.avgCpm ?? null);
    } catch (err: any) {
      setActionError(err.message || "Network error releasing slot");
    } finally {
      setProcessingId(null);
    }
  }

  const mySlots = slots.filter(s => s.takenBy === sponsorSlug);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {actionError && (
        <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.5)", borderRadius: 6, color: "#fca5a5", fontSize: 12 }}>
          ⚠️ {actionError}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "MY PLACEMENTS", value: loading && slots.length === 0 ? "..." : myPlacementsCount, color: "#00FFFF" },
          { label: "AVAILABLE SLOTS", value: loading && slots.length === 0 ? "..." : availableCount, color: "#22c55e" },
          { label: "AVG CPM", value: loading && slots.length === 0 ? "..." : avgCpm !== null ? `$${avgCpm.toFixed(2)}` : "Unavailable", color: "#fcd34d" },
        ].map(m => (
          <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${m.color}33`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: "0.14em", marginBottom: 4 }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {mySlots.length > 0 && (
        <div>
          <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>MY ACTIVE PLACEMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mySlots.map(slot => (
              <div key={slot.id} style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700 }}>{ZONE_LABELS[slot.zone]}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</div>
                </div>
                <button onClick={() => releaseSlot(slot.id)} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 5, color: "#f87171", fontSize: 9, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>
                  RELEASE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>ALL PLACEMENT SLOTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {slots.map(slot => {
            const color = ZONE_COLORS[slot.zone];
            const isOwn = slot.takenBy === sponsorSlug;
            return (
              <div key={slot.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color, fontSize: 11, fontWeight: 700 }}>{ZONE_LABELS[slot.zone]}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {slot.status === "taken" && !isOwn && (
                    <span style={{ color: "#ef4444", fontSize: 9, fontWeight: 700 }}>TAKEN</span>
                  )}
                  {slot.status === "available" && (
                    <button onClick={() => attachSponsorToTicket(slot.id)} style={{ background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 5, color, fontSize: 9, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>
                      CLAIM SLOT
                    </button>
                  )}
                  {isOwn && (
                    <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 700 }}>✓ YOURS</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
