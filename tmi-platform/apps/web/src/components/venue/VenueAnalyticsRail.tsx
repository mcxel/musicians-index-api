"use client";

import { useMemo, useState } from "react";

export default function VenueAnalyticsRail() {
  const [attendance, setAttendance] = useState(643);
  const [ticketConversion, setTicketConversion] = useState(58);
  const [occupancy, setOccupancy] = useState(74);
  const [revenue, setRevenue] = useState(39210);

  const bars = useMemo(
    () => [
      { id: "attendance", label: "Attendance", value: Math.min(100, Math.round((attendance / 1000) * 100)), tone: "bg-cyan-400" },
      { id: "conversion", label: "Ticket Conversion", value: ticketConversion, tone: "bg-fuchsia-400" },
      { id: "occupancy", label: "Occupancy", value: occupancy, tone: "bg-amber-400" },
      { id: "revenue", label: "Revenue Health", value: Math.min(100, Math.round((revenue / 60000) * 100)), tone: "bg-emerald-400" },
    ],
    [attendance, ticketConversion, occupancy, revenue],
  );

  return (
    <section className="rounded-xl border border-amber-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Analytics Rail</p>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">Venue Performance Monitor</h2>
        </div>
        <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
          Live Heat 82
        </span>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Attendance</p>
          <p className="text-xl font-black text-cyan-200">{attendance}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Conversion</p>
          <p className="text-xl font-black text-fuchsia-200">{ticketConversion}%</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Occupancy</p>
          <p className="text-xl font-black text-amber-200">{occupancy}%</p>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Revenue</p>
          <p className="text-xl font-black text-emerald-200">${revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.id}>
            <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.1em]">
              <span className="text-zinc-300">{bar.label}</span>
              <span className="font-black text-white">{bar.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className={`h-full ${bar.tone} transition-all duration-500`} style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAttendance((v) => v + 12)}
          className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
        >
          Attendance ▲
        </button>
        <button
          type="button"
          onClick={() => setTicketConversion((v) => Math.min(100, v + 2))}
          className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
        >
          Conversion ▶
        </button>
        <button
          type="button"
          onClick={() => setRevenue((v) => v + 1250)}
          className="rounded border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-100"
        >
          Revenue ▲
        </button>
      </div>
    </section>
  );
}
