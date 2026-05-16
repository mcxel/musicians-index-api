"use client";

interface ArticleStat {
  id: string;
  title: string;
  category: "article" | "artist" | "issue" | "ad" | "billboard";
  views: number;
  engagement: number; // 0–100
  adRevenue?: number;
  rank?: number;
  trend: "up" | "down" | "flat";
}

const STATS: ArticleStat[] = [
  { id: "a1", title: "KOVA — Crown Season 3 Feature",      category: "artist",    views: 48200, engagement: 92, trend: "up",   rank: 1 },
  { id: "a2", title: "Drift Sound's Rise",                 category: "article",   views: 31400, engagement: 88, trend: "up" },
  { id: "a3", title: "Issue 01 — Open Cover Spread",       category: "issue",     views: 84100, engagement: 79, trend: "flat", adRevenue: 1200 },
  { id: "a4", title: "Dirty Dozens World Championship",    category: "article",   views: 29800, engagement: 75, trend: "up" },
  { id: "a5", title: "SoundBridge Pro Billboard Slot",     category: "billboard", views: 22400, engagement: 68, adRevenue: 3000, trend: "flat" },
  { id: "a6", title: "Nera Vex — Neo Soul Spotlight",      category: "artist",    views: 18900, engagement: 64, trend: "down", rank: 2 },
  { id: "a7", title: "VoxStream Ad Block — Issue 01",      category: "ad",        views: 16300, engagement: 58, adRevenue: 840,  trend: "flat" },
  { id: "a8", title: "World Dance Party IV — Preview",     category: "article",   views: 14100, engagement: 55, trend: "up" },
];

const CAT_STYLE: Record<ArticleStat["category"], string> = {
  article:   "border-cyan-400/40 text-cyan-300",
  artist:    "border-fuchsia-400/40 text-fuchsia-300",
  issue:     "border-amber-400/40 text-amber-300",
  ad:        "border-green-400/40 text-green-300",
  billboard: "border-violet-400/40 text-violet-300",
};

const TREND_LABEL = { up: "▲", down: "▼", flat: "—" };
const TREND_COLOR = { up: "text-green-400", down: "text-red-400", flat: "text-zinc-500" };

const maxViews = Math.max(...STATS.map((s) => s.views));

export default function MagazineAnalytics() {
  const totalViews = STATS.reduce((acc, s) => acc + s.views, 0);
  const totalAdRev = STATS.reduce((acc, s) => acc + (s.adRevenue || 0), 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-violet-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Magazine Analytics</p>
          <p className="text-[11px] font-black uppercase text-white">TMI Performance Intel</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-zinc-400">Total Views</p>
          <p className="text-[13px] font-black text-violet-300">{(totalViews / 1000).toFixed(1)}k</p>
        </div>
      </header>

      {/* Summary row */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1 rounded border border-amber-400/30 bg-amber-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">Ad Rev</p>
          <p className="text-[12px] font-black text-amber-300">${totalAdRev.toLocaleString()}</p>
        </div>
        <div className="flex-1 rounded border border-cyan-400/30 bg-cyan-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">Pieces</p>
          <p className="text-[12px] font-black text-cyan-300">{STATS.length}</p>
        </div>
        <div className="flex-1 rounded border border-fuchsia-400/30 bg-fuchsia-500/10 p-2 text-center">
          <p className="text-[8px] text-zinc-400">Avg Eng</p>
          <p className="text-[12px] font-black text-fuchsia-300">{Math.round(STATS.reduce((a, s) => a + s.engagement, 0) / STATS.length)}%</p>
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {STATS.map((stat, idx) => {
          const pct = Math.round((stat.views / maxViews) * 100);
          return (
            <div key={stat.id}>
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 text-[8px] font-black text-zinc-500">{idx + 1}</span>
                  <span className={`shrink-0 rounded border px-1 py-0.5 text-[7px] font-black uppercase ${CAT_STYLE[stat.category]}`}>{stat.category}</span>
                  <span className="truncate text-[9px] font-bold text-white">{stat.title}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[8px] text-zinc-400">{(stat.views / 1000).toFixed(1)}k</span>
                  <span className="text-[9px] text-green-300">{stat.engagement}%</span>
                  <span className={`text-[10px] font-black ${TREND_COLOR[stat.trend]}`}>{TREND_LABEL[stat.trend]}</span>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-violet-400/70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
