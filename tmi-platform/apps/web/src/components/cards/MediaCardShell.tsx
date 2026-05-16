"use client";

import Link from "next/link";
import { useImageRotation } from "@/hooks/useImageRotation";
import type { RotationImageInput } from "@/engines/content/ImageRotationAuthorityEngine";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type MediaType = "artist" | "beat" | "article" | "venue" | "nft" | "sponsor" | "battle" | "room";

type MediaCardShellProps = {
  type: MediaType;
  image: string;
  rotateImages?: RotationImageInput[];
  rotationWeights?: number[];
  rotationIntervalMs?: number;
  enableAutoRotate?: boolean;
  showChevronControls?: boolean;
  title: string;
  subtitle: string;
  badge?: string;
  status?: string;
  live?: boolean;
  href?: string;
  ctaLabel?: string;
};

export default function MediaCardShell({
  type,
  image,
  rotateImages,
  rotationWeights,
  rotationIntervalMs = 6500,
  enableAutoRotate = true,
  showChevronControls = true,
  title,
  subtitle,
  badge,
  status,
  live,
  href,
  ctaLabel = "Open",
}: MediaCardShellProps) {
  const weightedInputs: RotationImageInput[] =
    rotateImages && rotateImages.length > 0
      ? rotateImages.map((entry, index) => {
          if (typeof entry === "string") {
            return {
              url: entry,
              weight: rotationWeights?.[index] ?? 1,
              priority: 1,
            };
          }
          return {
            url: entry.url,
            weight: rotationWeights?.[index] ?? entry.weight ?? 1,
            priority: entry.priority ?? 1,
          };
        })
      : [image];

  const { currentImage, hasRotation, rotateNext, rotatePrev } = useImageRotation({
    images: weightedInputs,
    intervalMs: rotationIntervalMs,
    enabled: enableAutoRotate,
    strategy: "weighted-random",
    antiRepeatWindow: 2,
  });

  const resolvedImage = currentImage || image;

  const body = (
    <article className="group relative overflow-hidden rounded-xl border border-white/20 bg-black/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/75 hover:shadow-[0_0_30px_rgba(0,255,255,0.25)]">
      <div className="relative h-36 w-full overflow-hidden">
        <ImageSlotWrapper imageId="img-xnrzqh" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-2 top-2 flex items-center gap-2">
          {badge ? (
            <span className="rounded border border-cyan-200/65 bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em] text-cyan-50">
              {badge}
            </span>
          ) : null}
          {live ? (
            <span className="rounded border border-red-300/70 bg-red-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em] text-red-50 animate-pulse">
              Live
            </span>
          ) : null}
        </div>
        {status ? (
          <span className="absolute right-2 top-2 rounded border border-white/35 bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-100">
            {status}
          </span>
        ) : null}
        {showChevronControls && hasRotation ? (
          <div className="absolute inset-x-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              className="rounded border border-cyan-300/60 bg-black/65 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-50"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                rotatePrev();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="rounded border border-cyan-300/60 bg-black/65 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-50"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                rotateNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan-200">{type}</p>
        <h3 className="mt-1 text-sm font-black uppercase text-white">{title}</h3>
        <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">{subtitle}</p>
        <div className="mt-3">
          <span className="rounded border border-cyan-300/45 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50 transition-colors group-hover:border-cyan-100">
            {ctaLabel}
          </span>
        </div>
      </div>
    </article>
  );

  if (!href || href === "#") return body;
  return <Link href={href}>{body}</Link>;
}
