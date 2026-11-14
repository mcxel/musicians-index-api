"use client";

import Link from "next/link";
import type { HomeEditorialArticle } from "@/components/home/data/getHomeEditorial";

interface SpotlightArticleRailProps {
  articles?: HomeEditorialArticle[];
}

export default function SpotlightArticleRail({ articles }: SpotlightArticleRailProps) {
  const rows = articles ?? [];

  return (
    <section className="rounded-xl border border-cyan-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Spotlight Article Rail</p>
        <Link href="/articles" className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200 hover:text-cyan-100">Magazine</Link>
      </div>
      {rows.length === 0 && (
        <p className="py-3 text-center text-[10px] text-cyan-400/50">No spotlight articles yet.</p>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {rows.slice(0, 4).map((article) => (
          <Link key={article.id} href={article.slug ? `/articles/${article.slug}` : "/articles"} className="rounded-lg border border-cyan-300/25 bg-cyan-500/10 p-2 hover:border-cyan-100/50">
            <p className="text-[11px] font-black uppercase text-white">{article.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
