"use client";

import Link from "next/link";
import { buildBillboardFrames, getBillboardRotationMs } from "@/lib/homepage/tmiHomepageBillboardBridge";

export default function TmiHomepageBillboardPreview() {
  const lanes = buildBillboardFrames();
  return (
    <section className="rounded-2xl border border-emerald-300/35 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Billboard Preview</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">rotate {Math.floor(getBillboardRotationMs() / 1000)}s</p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {lanes.map((lane) => (
          <article key={lane.lane} className="rounded-xl border border-white/15 bg-black/35 p-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{lane.lane}</p>
            <p className="text-xs font-black uppercase text-white">{lane.title}</p>
            <div className="mt-2 flex gap-2">
              <Link href={lane.route} className="rounded-full border border-emerald-300/60 px-2 py-1 text-[10px] font-black uppercase text-emerald-100">Open</Link>
              <Link href={lane.backRoute} className="rounded-full border border-zinc-300/40 px-2 py-1 text-[10px] font-black uppercase text-zinc-200">Back</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
