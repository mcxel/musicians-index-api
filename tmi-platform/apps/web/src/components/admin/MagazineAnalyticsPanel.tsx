"use client";

import { useEffect, useReducer } from "react";

interface ArticleStat {
  id: string;
  title: string;
  issue: string;
  views: number;
  readThrough: number;
  clicks: number;
  ctr: number;
  trending: "up" | "down" | "flat";
}

interface IssueStat {
  id: string;
  label: string;
  articles: number;
  totalViews: number;
  avgReadThrough: number;
  publishedAt: string;
}

const SEED_ARTICLES: ArticleStat[] = [
  { id: "ar1", title: "The Crown Architecture",      issue: "Issue 01", views: 14200, readThrough: 74, clicks: 1840, ctr: 12.9, trending: "up"   },
  { id: "ar2", title: "Julius.B: Sound of Pressure", issue: "Issue 01", views: 12800, readThrough: 81, clicks: 2210, ctr: 17.3, trending: "up"   },
  { id: "ar3", title: "Beat Lab Vol. 3",              issue: "Issue 01", views:  9400, readThrough: 62, clicks:  880, ctr:  9.4, trending: "flat" },
  { id: "ar4", title: "NFT: The Artist's Index",      issue: "Issue 01", views:  7700, readThrough: 55, clicks:  640, ctr:  8.3, trending: "down" },
  { id: "ar5", title: "Cypher Chronicles — Fall",     issue: "Issue 02", views:  4100, readThrough: 68, clicks:  510, ctr: 12.4, trending: "up"   },
  { id: "ar6", title: "Venue Zero: Full Feature",     issue: "Issue 02", views:  3200, readThrough: 71, clicks:  420, ctr: 13.1, trending: "up"   },
];

const SEED_ISSUES: IssueStat[] = [
  { id: "iss1", label: "Issue 01 — LIVE",  articles: 8, totalViews: 44100, avgReadThrough: 68, publishedAt: "Jan 2026" },
  { id: "iss2", label: "Issue 02 — DRAFT", articles: 4, totalViews:  7300, avgReadThrough: 70, publishedAt: "Apr 2026" },
];

type Action = { type: "tick" };

function statsReducer(state: ArticleStat[], action: Action): ArticleStat[] {
  if (action.type === "tick") {
    return state.map((a) => ({
      ...a,
      views:  a.views + Math.floor(Math.random() * 80),
      clicks: a.clicks + Math.floor(Math.random() * 8),
    }));
  }
  return state;
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const TREND_ICON: Record<ArticleStat["trending"], string> = { up: "▲", down: "▼", flat: "—" };
const TREND_COLOR: Record<ArticleStat["trending"], string> = { up: "text-green-400", down: "text-red-400", flat: "text-zinc-600" };

export default function MagazineAnalyticsPanel() {
  const [articles, dispatch] = useReducer(statsReducer, SEED_ARTICLES);
  const [tab, setTab] = useReducer((_: "articles" | "issues", next: "articles" | "issues") => next, "articles");

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "tick" }), 9000);
    return () => clearInterval(id);
  }, []);

  const totalViews  = articles.reduce((s, a) => s + a.views, 0);
  const avgReadThru = Math.round(articles.reduce((s, a) => s + a.readThrough, 0) / articles.length);

  return (
    <section className="flex h-full flex-col rounded-xl border border-amber-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">Magazine Analytics</p>
          <p className="text-[11px] font-black uppercase text-white">Content Performance</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
            {fmtNum(totalViews)} VIEWS
          </span>
          <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
            {avgReadThru}% READ
          </span>
        </div>
      </header>

      {/* Tab selector */}
      <div className="mb-3 flex gap-1">
        <button
          type="button"
          onClick={() => setTab("articles")}
          className={`rounded border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${tab === "articles" ? "border-amber-400/50 bg-amber-500/10 text-amber-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
        >
          Articles
        </button>
        <button
          type="button"
          onClick={() => setTab("issues")}
          className={`rounded border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${tab === "issues" ? "border-amber-400/50 bg-amber-500/10 text-amber-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
        >
          Issues
        </button>
      </div>

      {tab === "articles" && (
        <>
          <div className="mb-1.5 grid grid-cols-[1fr_44px_44px_44px_20px] items-center gap-1.5 px-2 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-600">
            <span>Article</span>
            <span className="text-right">Views</span>
            <span className="text-right">Read%</span>
            <span className="text-right">CTR%</span>
            <span />
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {articles.map((a) => (
              <div key={a.id} className="grid grid-cols-[1fr_44px_44px_44px_20px] items-center gap-1.5 rounded-lg border border-white/5 bg-black/40 px-2 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-black uppercase text-white">{a.title}</p>
                  <p className="text-[7px] text-zinc-600">{a.issue}</p>
                </div>
                <p className="text-right text-[9px] font-black text-amber-300">{fmtNum(a.views)}</p>
                <div className="text-right">
                  <p className="text-[9px] font-black text-cyan-300">{a.readThrough}%</p>
                  <div className="mt-0.5 h-1 w-full rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-cyan-500/60 transition-all" style={{ width: `${a.readThrough}%` }} />
                  </div>
                </div>
                <p className="text-right text-[9px] font-black text-green-300">{a.ctr.toFixed(1)}%</p>
                <span className={`text-center text-[8px] font-black ${TREND_COLOR[a.trending]}`}>
                  {TREND_ICON[a.trending]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "issues" && (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {SEED_ISSUES.map((iss) => (
            <div key={iss.id} className="rounded-lg border border-amber-400/20 bg-black/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-white">{iss.label}</p>
                <span className="text-[8px] text-zinc-600">{iss.publishedAt}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-white/5 bg-black/30 p-1.5 text-center">
                  <p className="text-[14px] font-black text-amber-300">{iss.articles}</p>
                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-600">Articles</p>
                </div>
                <div className="rounded border border-white/5 bg-black/30 p-1.5 text-center">
                  <p className="text-[14px] font-black text-cyan-300">{fmtNum(iss.totalViews)}</p>
                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-600">Views</p>
                </div>
                <div className="rounded border border-white/5 bg-black/30 p-1.5 text-center">
                  <p className="text-[14px] font-black text-green-300">{iss.avgReadThrough}%</p>
                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-600">Read-Thru</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
