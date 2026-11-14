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

const ZONE_LABEL: Record<PlacementSlot["zone"], string> = {
  "stage-banner":    "Stage Banner",
  "lobby-billboard": "Lobby Billboard",
  "ticket-footer":   "Ticket Footer",
  "digital-overlay": "Digital Overlay",
  "venue-wrap":      "Venue Wrap",
};

export default function SponsorPlacementRail({ sponsorSlug = "my-brand" }: { sponsorSlug?: string }) {
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
      const res = await fetch(`/api/sponsor/placements?slug=${encodeURIComponent(sponsorSlug)}`, { cache: "no-store" });
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

  async function claim(id: string) {
    try {
      setActionError(null);
      setProcessingId(id);
      const res = await fetch("/api/sponsor/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", slotId: id, sponsorSlug }),
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

  async function release(id: string) {
    try {
      setActionError(null);
      setProcessingId(id);
      const res = await fetch("/api/sponsor/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release", slotId: id, sponsorSlug }),
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

  return (
    <section className="rounded-xl border border-violet-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300">Placement Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Ad Placement Slots</h2>
      </header>

      {actionError && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs font-semibold text-red-200">
          ⚠️ {actionError}
        </div>
      )}

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-violet-300/25 bg-violet-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">My Placements</p>
          <p className="text-xl font-black text-violet-200">{loading && slots.length === 0 ? "..." : myPlacementsCount}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Available</p>
          <p className="text-xl font-black text-emerald-200">{loading && slots.length === 0 ? "..." : availableCount}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Avg CPM</p>
          <p className="text-xl font-black text-amber-200">
            {loading && slots.length === 0 ? "..." : avgCpm !== null ? `$${avgCpm.toFixed(2)}` : "Unavailable"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {loading && slots.length === 0 ? (
          <div className="py-6 text-center text-xs uppercase tracking-widest text-zinc-500">Loading placement inventory...</div>
        ) : slots.length === 0 ? (
          <div className="py-6 text-center text-xs uppercase tracking-widest text-zinc-500">No placement inventory available</div>
        ) : (
          slots.map((slot) => {
            const isOwn = slot.takenBy === sponsorSlug;
            const isBusy = processingId === slot.id;
            return (
              <article key={slot.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950/60 p-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{ZONE_LABEL[slot.zone] || slot.zone}</p>
                  <p className="text-xs text-zinc-400">{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {slot.status === "available" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => claim(slot.id)}
                      className="rounded border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-50"
                    >
                      {isBusy ? "Claiming..." : "Claim →"}
                    </button>
                  )}
                  {isOwn && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => release(slot.id)}
                      className="rounded border border-red-400/35 bg-red-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-red-200 hover:bg-red-400/20 disabled:opacity-50"
                    >
                      {isBusy ? "Releasing..." : "Release"}
                    </button>
                  )}
                  {slot.status === "taken" && !isOwn && (
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">TAKEN</span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
