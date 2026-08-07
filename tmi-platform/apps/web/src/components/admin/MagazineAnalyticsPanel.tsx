"use client";

import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

/**
 * Rule 20: Issue 1 article inventory only — no fabricated views/CTR/ticks.
 * Live analytics wire when a real metrics store exists.
 */
export default function MagazineAnalyticsPanel() {
  const articles = MAGAZINE_ISSUE_1;

  return (
    <section className="flex h-full flex-col rounded-xl border border-amber-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">Magazine Analytics</p>
          <p className="text-[11px] font-black uppercase text-white">Issue 1 Inventory</p>
        </div>
        <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
          {articles.length} ARTICLES
        </span>
      </header>

      <p className="mb-3 text-[8px] leading-relaxed text-zinc-500">
        Read counts and CTR are not connected yet. Showing published Issue 1 titles only.
      </p>

      {articles.length === 0 ? (
        <p className="py-6 text-center text-[10px] text-zinc-600">No Issue 1 articles in magazineIssueData.</p>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/magazine/article/${a.slug}`}
              className="rounded-lg border border-white/5 bg-black/40 px-2 py-1.5 transition hover:border-amber-400/30"
            >
              <p className="truncate text-[9px] font-black uppercase text-white">{a.title}</p>
              <p className="text-[7px] text-zinc-600">
                {a.category} · views unavailable
              </p>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/admin/magazine-analytics"
        className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.12em] text-amber-400/80 hover:text-amber-300"
      >
        Full analytics →
      </Link>
    </section>
  );
}
