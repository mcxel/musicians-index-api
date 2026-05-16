"use client";

import { useState } from "react";

type FeedCategory = "artist" | "event" | "venue" | "show" | "cypher";

interface FeedItem {
  id: string;
  category: FeedCategory;
  title: string;
  sub: string;
  status: "LIVE" | "UPCOMING" | "ENDED";
  genre?: string;
  location?: string;
  revenue?: string;
  engagement: number; // 0–100
}

const FEED_ITEMS: FeedItem[] = [
  { id: "fi1", category: "artist",  title: "KOVA",             sub: "Afrobeat Fusion · Crown holder",  status: "LIVE",     genre: "Afrobeat",  engagement: 98 },
  { id: "fi2", category: "cypher",  title: "Crown Qualifier",  sub: "KOVA vs Blaze Cartel",            status: "LIVE",     genre: "Trap",      engagement: 94 },
  { id: "fi3", category: "event",   title: "TMI Monthly Idol", sub: "Crown Stage · Sat 8pm",           status: "UPCOMING", location: "NYC",    revenue: "$4,200", engagement: 87 },
  { id: "fi4", category: "venue",   title: "Electric Blue Club",sub: "World Dance Party IV",           status: "UPCOMING", location: "LA",     revenue: "$3,100", engagement: 79 },
  { id: "fi5", category: "show",    title: "Deal or Feud S3",  sub: "Studio Arena · Sun 7pm",          status: "UPCOMING", location: "ATL",    revenue: "$1,800", engagement: 72 },
  { id: "fi6", category: "artist",  title: "Drift Sound",      sub: "Electronic · #5 rising",          status: "LIVE",     genre: "Electronic",engagement: 65 },
  { id: "fi7", category: "cypher",  title: "Rising Star Showcase", sub: "Drift Sound vs Solara",      status: "UPCOMING", genre: "Alt Pop",   engagement: 61 },
  { id: "fi8", category: "venue",   title: "Neo Soul Lounge",  sub: "Asha Wave · Live room",           status: "LIVE",     location: "CHI",    engagement: 54 },
];

const CAT_STYLE: Record<FeedCategory, string> = {
  artist: "border-fuchsia-400/50 text-fuchsia-300",
  event:  "border-amber-400/50 text-amber-300",
  venue:  "border-cyan-400/50 text-cyan-300",
  show:   "border-violet-400/50 text-violet-300",
  cypher: "border-green-400/50 text-green-300",
};

const STATUS_STYLE: Record<FeedItem["status"], string> = {
  LIVE:     "text-green-300 border-green-400/50 bg-green-500/10",
  UPCOMING: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  ENDED:    "text-zinc-400 border-zinc-600/30 bg-zinc-800/20",
};

const GENRES = ["All", "Afrobeat", "Trap", "Electronic", "R&B", "Drill", "Alt Pop"];
const STATUSES: Array<FeedItem["status"] | "ALL"> = ["ALL", "LIVE", "UPCOMING", "ENDED"];

export default function FeedExplorer() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<FeedItem["status"] | "ALL">("ALL");

  const filtered = FEED_ITEMS.filter((item) => {
    const matchQuery = !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase());
    const matchGenre = genre === "All" || item.genre === genre;
    const matchStatus = status === "ALL" || item.status === status;
    return matchQuery && matchGenre && matchStatus;
  });

  return (
    <section className="flex h-full flex-col rounded-xl border border-green-400/30 bg-black/60 p-3">
      <header className="mb-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-400">Live Feed Explorer</p>
        <p className="text-[11px] font-black uppercase text-white">System Activity Search</p>
      </header>

      {/* Search */}
      <input
        type="text"
        placeholder="Search artist, event, venue, show..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-[10px] text-white placeholder-zinc-500 focus:border-green-400/50 focus:outline-none"
      />

      {/* Filters */}
      <div className="mb-2 flex flex-wrap gap-1">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase transition ${
              genre === g ? "border-green-400/60 bg-green-500/15 text-green-200" : "border-white/10 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase transition ${
              status === s ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200" : "border-white/10 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[9px] text-zinc-500">No results</p>
        ) : filtered.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/10 bg-black/45 p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className={`rounded border px-1 py-0.5 text-[7px] font-black uppercase ${CAT_STYLE[item.category]}`}>{item.category}</span>
                  <span className={`rounded border px-1 py-0.5 text-[7px] font-black uppercase ${STATUS_STYLE[item.status]}`}>{item.status}</span>
                </div>
                <p className="text-[10px] font-black uppercase text-white">{item.title}</p>
                <p className="text-[8px] text-zinc-400">{item.sub}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-black text-green-300">{item.engagement}%</p>
                {item.revenue && <p className="text-[8px] text-amber-300">{item.revenue}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
