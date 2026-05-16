"use client";

import { useEffect, useRef, useState } from "react";

interface RevenueStream {
  id: string;
  label: string;
  todayCents: number;
  weekCents: number;
  monthCents: number;
  trend: "up" | "down" | "flat";
  accentClass: string;
  barClass: string;
}

const STREAMS: RevenueStream[] = [
  { id: "tickets",       label: "Ticket Sales",    todayCents: 420_00,  weekCents: 1_840_00,  monthCents: 7_200_00,  trend: "up",   accentClass: "border-amber-400/40",   barClass: "bg-amber-400" },
  { id: "nft",           label: "NFT Commerce",    todayCents: 21_00,   weekCents: 105_00,    monthCents: 420_00,    trend: "flat", accentClass: "border-blue-400/40",    barClass: "bg-blue-400" },
  { id: "beats",         label: "Beat Licensing",  todayCents: 88_00,   weekCents: 440_00,    monthCents: 1_760_00,  trend: "up",   accentClass: "border-violet-400/40",  barClass: "bg-violet-400" },
  { id: "tips",          label: "Artist Tips",     todayCents: 118_00,  weekCents: 620_00,    monthCents: 2_480_00,  trend: "up",   accentClass: "border-cyan-400/40",    barClass: "bg-cyan-400" },
  { id: "sponsors",      label: "Sponsor Revenue", todayCents: 300_00,  weekCents: 1_500_00,  monthCents: 6_000_00,  trend: "up",   accentClass: "border-green-400/40",   barClass: "bg-green-400" },
  { id: "ads",           label: "Ad Revenue",      todayCents: 42_00,   weekCents: 210_00,    monthCents: 840_00,    trend: "down", accentClass: "border-rose-400/40",    barClass: "bg-rose-400" },
];

const TREND_ICON = { up: "▲", down: "▼", flat: "—" };
const TREND_COLOR = { up: "text-green-400", down: "text-red-400", flat: "text-zinc-400" };

function fmt(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${dollars.toFixed(0)}`;
}

const maxMonth = Math.max(...STREAMS.map((s) => s.monthCents));

export default function RevenueMonitor() {
  const [streams, setStreams] = useState(STREAMS);
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      setStreams((prev) =>
        prev.map((s) => {
          if (s.trend === "down") return s;
          const delta = Math.round((Math.random() * 0.4 + 0.05) * 100);
          return { ...s, todayCents: s.todayCents + delta };
        })
      );
    }, 6_000);
    return () => clearInterval(id);
  }, []);

  const totalToday = streams.reduce((acc, s) => acc + s.todayCents, 0);
  const totalMonth = streams.reduce((acc, s) => acc + s.monthCents, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-green-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-400">Revenue Monitor</p>
          <p className="text-[11px] font-black uppercase text-white">Live Money Streams</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] uppercase text-zinc-500">Today</p>
          <p className="text-[14px] font-black text-green-300">{fmt(totalToday)}</p>
        </div>
      </header>

      {/* Summary row */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded border border-amber-400/30 bg-amber-500/10 p-2 text-center">
          <p className="text-[8px] uppercase text-zinc-500">This Month</p>
          <p className="text-[12px] font-black text-amber-300">{fmt(totalMonth)}</p>
        </div>
        <div className="rounded border border-cyan-400/30 bg-cyan-500/10 p-2 text-center">
          <p className="text-[8px] uppercase text-zinc-500">Streams Live</p>
          <p className="text-[12px] font-black text-cyan-300">{streams.filter((s) => s.trend !== "down").length}</p>
        </div>
      </div>

      {/* Stream rows */}
      <div className="flex flex-col gap-1.5 overflow-y-auto">
        {streams.map((s) => {
          const barPct = Math.round((s.monthCents / maxMonth) * 100);
          return (
            <div key={s.id} className={`rounded border bg-black/40 px-2 py-1.5 ${s.accentClass}`}>
              <div className="mb-1 flex items-center justify-between gap-1">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-200">{s.label}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black ${TREND_COLOR[s.trend]}`}>
                    {TREND_ICON[s.trend]}
                  </span>
                  <span className="text-[9px] font-black text-white">{fmt(s.todayCents)}</span>
                  <span className="text-[8px] text-zinc-500">/ {fmt(s.weekCents)} wk</span>
                </div>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${s.barClass}`} style={{ width: `${barPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
