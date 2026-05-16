"use client";

import React, { useState, useEffect } from "react";
import { getAllVenues, subscribeToVenue, type VenueState, type VenuePhase } from "@/lib/venue/VenueStateEngine";
import { getAllVenueRevenue } from "@/lib/venue/VenueEconomicEngine";

function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-green-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,255,100,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const PHASE_COLOR: Record<VenuePhase, string> = {
  "pre-doors":   "text-gray-400",
  "doors-open":  "text-blue-400",
  "warm-up":     "text-yellow-400",
  "main-show":   "text-green-400",
  "battle":      "text-red-400",
  "encore":      "text-fuchsia-400",
  "intermission":"text-cyan-400",
  "post-show":   "text-gray-500",
  "after-party": "text-purple-400",
  "closed":      "text-gray-700",
};

function VenueRow({ venue }: { venue: VenueState }) {
  const occupancyPct = venue.capacity.total > 0
    ? Math.round((venue.capacity.occupied / venue.capacity.total) * 100) : 0;

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-sm">{venue.displayName}</span>
        <span className={`text-xs font-bold uppercase ${PHASE_COLOR[venue.phase]}`}>{venue.phase}</span>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-gray-400">Capacity:</span>
        <div className="flex-1 h-1.5 bg-gray-800 rounded overflow-hidden">
          <div
            className={`h-full rounded transition-all ${venue.capacity.overflow ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
        <span className="text-gray-300">{venue.capacity.occupied}/{venue.capacity.total} ({occupancyPct}%)</span>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-gray-400">Energy:</span>
        <div className="flex-1 h-1.5 bg-gray-800 rounded overflow-hidden">
          <div className="h-full bg-fuchsia-500 rounded" style={{ width: `${venue.energyLevel}%` }} />
        </div>
        <span className="text-gray-300">{venue.energyLevel}</span>
      </div>
      {venue.activePerformers.length > 0 && (
        <div className="text-xs text-cyan-400 font-mono">
          ON STAGE: {venue.activePerformers.map(p => p.displayName).join(", ")}
        </div>
      )}
      <div className="flex gap-2 text-xs font-mono">
        <span className={`px-1.5 py-0.5 rounded ${venue.isLive ? "bg-green-900/50 text-green-400" : "bg-gray-900 text-gray-600"}`}>
          {venue.isLive ? "LIVE" : "OFF"}
        </span>
        <span className="text-gray-500">{venue.venueType}</span>
        <span className="text-gray-500">{venue.lightingPreset}</span>
      </div>
    </div>
  );
}

export default function VenueMonitorPage() {
  const [venues, setVenues] = useState<VenueState[]>(getAllVenues());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVenues(getAllVenues());
      setTick(n => n + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const revenueData = getAllVenueRevenue();
  const liveVenues = venues.filter(v => v.isLive);
  const totalOccupancy = venues.reduce((s, v) => s + v.capacity.occupied, 0);
  const totalRevenueCents = revenueData.reduce((s, r) => s + r.totalCents, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400 tracking-wide">Venue Monitor</h1>
        <span className="text-xs text-gray-500 font-mono">TICK {tick} · {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Venues",   value: venues.length,      color: "text-cyan-400" },
          { label: "Live Now",       value: liveVenues.length,  color: "text-green-400" },
          { label: "Total Occupancy",value: totalOccupancy,     color: "text-yellow-400" },
          { label: "Session Revenue",value: `$${(totalRevenueCents / 100).toFixed(0)}`, color: "text-fuchsia-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      {venues.length === 0 ? (
        <NeonCard>
          <p className="text-gray-600 text-sm text-center py-8">No venues registered yet.</p>
        </NeonCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map(v => <VenueRow key={v.venueId} venue={v} />)}
        </div>
      )}

      {/* Revenue by venue */}
      {revenueData.length > 0 && (
        <NeonCard>
          <div className="text-sm text-fuchsia-300 font-semibold mb-3">Revenue by Venue</div>
          <div className="space-y-1">
            {revenueData.map(r => (
              <div key={r.venueId} className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300">{r.venueId}</span>
                <span className="text-fuchsia-400 font-bold">${(r.totalCents / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </NeonCard>
      )}
    </div>
  );
}
