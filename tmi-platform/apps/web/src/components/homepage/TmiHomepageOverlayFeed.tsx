"use client";

import Link from "next/link";
import { listHomepageOverlayFeed } from "@/lib/homepage/tmiHomepageOverlayFeedEngine";

export default function TmiHomepageOverlayFeed() {
  const feed = listHomepageOverlayFeed();

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-black/55 p-3 backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Homepage Overlay Feed</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {feed.map((item) => {
          const locked = item.status === "LOCKED" || item.status === "NEEDS_SETUP";
          return (
            <article key={item.id} className="rounded-xl border border-white/15 bg-black/35 p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{item.type}</p>
                {item.status ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                      item.status === "ACTIVE"
                        ? "border border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                        : item.status === "LOCKED"
                        ? "border border-amber-300/60 bg-amber-500/20 text-amber-100"
                        : "border border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-100"
                    }`}
                  >
                    {item.status === "NEEDS_SETUP" ? "Needs Setup" : item.status}
                  </span>
                ) : null}
              </div>
              <p className="text-xs font-black uppercase text-white">{item.title}</p>
              {item.reason ? <p className="mt-1 text-[10px] uppercase text-zinc-400">{item.reason}</p> : null}
              <div className="mt-2 flex gap-2">
                <Link
                  href={locked ? "#" : item.route}
                  aria-disabled={locked}
                  className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${
                    locked
                      ? "pointer-events-none border-zinc-600/50 text-zinc-500"
                      : "border-cyan-300/60 text-cyan-100"
                  }`}
                >
                  Open
                </Link>
                <Link
                  href={item.backRoute}
                  className="rounded-full border border-zinc-300/40 px-2 py-1 text-[10px] font-black uppercase text-zinc-200"
                >
                  Back
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
