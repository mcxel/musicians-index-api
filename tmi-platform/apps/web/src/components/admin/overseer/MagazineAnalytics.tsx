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
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr 1.2fr",
      gap: 12,
      fontFamily: "'Inter', sans-serif",
      height: "100%",
    }}>
      {/* Column 1: Live Billboard Rankings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Live Billboard Rankings
        </div>
        <input
          type="text"
          placeholder="Search Filter..."
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 8,
            color: "#fff",
            outline: "none"
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
          {[
            { rank: 1, name: "Live Performance", views: "57M" },
            { rank: 2, name: "Jay Paul Smith", views: "57M" },
            { rank: 3, name: "Big Ace", views: "1.3B" },
            { rank: 4, name: "SuperHarit41", views: "1.2K" },
            { rank: 5, name: "Pundworthy", views: "3.3B" }
          ].map((item) => (
            <div key={item.rank} style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#fff" }}>
              <span>{item.rank}. {item.name}</span>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>★ {item.views}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: User Engagement Hotmap */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          User Engagement Hotmap
        </div>
        {/* Heatmap Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 3,
          background: "rgba(0,0,0,0.2)",
          padding: 6,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.05)",
          flex: 1,
        }}>
          {/* Renders 32 small color blocks representing heatmap */}
          {[
            1, 2, 5, 8, 9, 7, 3, 2,
            0, 3, 7, 10, 9, 8, 4, 1,
            2, 4, 8, 9, 7, 5, 2, 0,
            1, 2, 4, 6, 5, 3, 1, 0
          ].map((val, idx) => {
            const opacity = val / 10;
            const bg = val > 7 ? `rgba(255, 68, 170, ${opacity})` : `rgba(255, 138, 0, ${opacity})`;
            return (
              <div key={idx} style={{
                aspectRatio: "1",
                background: val === 0 ? "rgba(255,255,255,0.02)" : bg,
                borderRadius: 2,
                boxShadow: val > 8 ? "0 0 5px rgba(255, 68, 170, 0.4)" : "none"
              }} />
            );
          })}
        </div>
      </div>

      {/* Column 3: Profile Deep Dive & Performance */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Profile deep dive */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #FFD700", overflow: "hidden" }}>
            <span style={{ fontSize: 10 }}>👤</span>
          </div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.6)" }}>
            <div>Artist Profile Deep Dive</div>
            <div style={{ fontWeight: 900, color: "#fff" }}>1.22K Followers • 1.9K Interact</div>
          </div>
        </div>

        {/* Content Performance */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Magazine Content Performance</div>
          {[
            { label: "Interaction", value: "20K", pct: 75, color: "#FF2DAA" },
            { label: "Loss", value: "51%", pct: 51, color: "#FF8A00" }
          ].map((bar, idx) => (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#fff" }}>
                <span>{bar.label}</span>
                <span>{bar.value}</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", marginTop: 1 }}>
                <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
