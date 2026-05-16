"use client";

import Link from "next/link";
import TmiStatusChip from "./TmiStatusChip";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type Props = {
  title: string;
  subtitle?: string;
  thumbnail?: string;
  status: string;
  route: string;
  backRoute: string;
  reason?: string;
};

export default function TmiHoverPreviewCard({
  title,
  subtitle,
  thumbnail,
  status,
  route,
  backRoute,
  reason,
}: Props) {
  return (
    <article className="group relative rounded-xl border border-white/20 bg-black/55 p-3 transition hover:scale-[1.015] hover:border-cyan-300/50 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-white">{title}</p>
          {subtitle ? <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-zinc-300">{subtitle}</p> : null}
        </div>
        <TmiStatusChip status={status} />
      </div>

      {reason ? <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-zinc-400">{reason}</p> : null}

      <div className="mt-3 flex gap-2">
        <Link href={route} className="rounded border border-cyan-300/40 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
          Open Route
        </Link>
        <Link href={backRoute} className="rounded border border-zinc-500/40 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-200">
          Back Route
        </Link>
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-2 hidden rounded-xl border border-fuchsia-300/40 bg-black/90 p-3 shadow-[0_0_28px_rgba(217,70,239,0.28)] group-hover:block">
        <div className="mb-2 h-20 w-full overflow-hidden rounded-lg border border-white/15 bg-zinc-900">
          {thumbnail ? (
            <ImageSlotWrapper imageId="img-ycv7iy" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-zinc-400">
              Preview
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-200">{title}</p>
      </div>
    </article>
  );
}
