"use client";

import React from "react";
import { useSharedPreview } from "@/components/preview/SharedPreviewProvider";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

function getStatusTone(status: string) {
  if (status === "live") return "text-emerald-300";
  if (status === "loading") return "text-amber-300";
  if (status === "paused") return "text-violet-300";
  if (status === "ended") return "text-slate-300";
  return "text-slate-400";
}

export default function SharedPreviewWindow() {
  const { isOpen, content, closePreview } = useSharedPreview();

  if (!isOpen || !content) return null;

  return (
    <aside className="pointer-events-auto fixed bottom-6 right-6 z-[70] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-fuchsia-400/40 bg-black/85 shadow-[0_0_24px_rgba(217,70,239,0.25)] backdrop-blur-md">
      <div className="flex items-start justify-between border-b border-fuchsia-400/30 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-fuchsia-200">Shared Preview</p>
          <p className="truncate text-sm font-semibold text-white">{content.title}</p>
          <p className="truncate text-xs text-slate-300">{content.subtitle ?? "No subtitle"}</p>
        </div>
        <button
          type="button"
          onClick={closePreview}
          className="ml-3 rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
          aria-label="Close shared preview"
          title="Close shared preview"
        >
          Close
        </button>
      </div>

      <div className="p-3">
        <div className="relative mb-2 flex h-40 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950">
          {content.thumbnailUrl ? (
            <ImageSlotWrapper imageId="img-uv1he" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          ) : (
            <div className="text-center text-xs text-slate-300">
              <p>Preview Dock Region</p>
              <p className="mt-1 text-slate-400">Media surface scaffold</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="rounded bg-white/10 px-2 py-1 text-slate-200">{content.sourceType}</span>
          <span className={getStatusTone(content.status)}>Status: {content.status}</span>
        </div>
      </div>
    </aside>
  );
}
