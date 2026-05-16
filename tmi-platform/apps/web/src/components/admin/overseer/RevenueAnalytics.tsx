"use client";

type RevenueStream = "tips" | "tickets" | "nft" | "sponsors" | "ads" | "subscriptions" | "bookings";

interface RevenueEntry {
  stream: RevenueStream;
  label: string;
  today: number;
  week: number;
  month: number;
  trend: "up" | "down" | "flat";
  color: string;
}

const REVENUE_DATA: RevenueEntry[] = [
  { stream: "tickets",       label: "Tickets",       today: 4200,  week: 18400, month: 72000,  trend: "up",   color: "bg-amber-400" },
  { stream: "tips",          label: "Tips",          today: 1180,  week: 6200,  month: 24800,  trend: "up",   color: "bg-cyan-400" },
  { stream: "subscriptions", label: "Subscriptions", today: 880,   week: 4400,  month: 17600,  trend: "flat", color: "bg-violet-400" },
  { stream: "sponsors",      label: "Sponsors",      today: 3000,  week: 15000, month: 60000,  trend: "up",   color: "bg-green-400" },
  { stream: "ads",           label: "Ads",           today: 420,   week: 2100,  month: 8400,   trend: "down", color: "bg-rose-400" },
  { stream: "bookings",      label: "Bookings",      today: 1600,  week: 7800,  month: 31200,  trend: "up",   color: "bg-fuchsia-400" },
  { stream: "nft",           label: "NFT",           today: 210,   week: 1050,  month: 4200,   trend: "flat", color: "bg-blue-400" },
];

const TREND_LABEL = { up: "▲", down: "▼", flat: "—" };
const TREND_COLOR = { up: "text-green-400", down: "text-red-400", flat: "text-zinc-400" };

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

const maxMonth = Math.max(...REVENUE_DATA.map((r) => r.month));

export default function RevenueAnalytics() {
  const totalToday = REVENUE_DATA.reduce((s, r) => s + r.today, 0);
  const totalMonth = REVENUE_DATA.reduce((s, r) => s + r.month, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-green-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-400">Revenue Analytics</p>
          <p className="text-[11px] font-black uppercase text-white">Live Money Tracking</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-400">Today</p>
          <p className="text-[13px] font-black text-green-300">{fmt(totalToday)}</p>
        </div>
      </header>

      {/* Summary chips */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1 rounded border border-amber-400/30 bg-amber-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">This Month</p>
          <p className="text-[12px] font-black text-amber-300">{fmt(totalMonth)}</p>
        </div>
        <div className="flex-1 rounded border border-cyan-400/30 bg-cyan-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">Streams</p>
          <p className="text-[12px] font-black text-cyan-300">{REVENUE_DATA.length}</p>
        </div>
        <div className="flex-1 rounded border border-green-400/30 bg-green-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">Up ▲</p>
          <p className="text-[12px] font-black text-green-300">{REVENUE_DATA.filter((r) => r.trend === "up").length}</p>
        </div>
      </div>

      {/* Bar chart rows */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {REVENUE_DATA.map((r) => {
          const pct = Math.round((r.month / maxMonth) * 100);
          return (
            <div key={r.stream}>
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${r.color}`} />
                  <span className="text-[9px] font-black uppercase text-white">{r.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-zinc-400">Today {fmt(r.today)}</span>
                  <span className="text-[9px] font-black text-zinc-200">{fmt(r.month)}/mo</span>
                  <span className={`text-[10px] font-black ${TREND_COLOR[r.trend]}`}>{TREND_LABEL[r.trend]}</span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className={`h-full rounded-full ${r.color} opacity-70`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
