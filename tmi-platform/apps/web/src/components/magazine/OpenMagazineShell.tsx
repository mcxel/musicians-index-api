"use client";

import type { ReactNode } from "react";
import MagazineFrameLayer from "@/components/magazine/MagazineFrameLayer";
import PageTurnEngine from "@/components/magazine/PageTurnEngine";
import MagazinePaperTexture from "@/components/magazine/MagazinePaperTexture";
import MagazineSpineCore from "@/components/magazine/MagazineSpineCore";

type MagazineTone = "cyan" | "fuchsia" | "emerald" | "amber" | "violet";

interface OpenMagazineShellProps {
  children: ReactNode;
  pageNumber: number;
  tone?: MagazineTone;
  className?: string;
  contentClassName?: string;
  issueLabel?: string;
  spreadLabel?: string;
}

export default function OpenMagazineShell({
  children,
  pageNumber,
  tone = "cyan",
  className = "",
  contentClassName = "",
  issueLabel = "The Musician's Index · Issue 01",
  spreadLabel,
}: OpenMagazineShellProps) {
  const pageLabel = spreadLabel ?? `Magazine Shell · Page ${pageNumber}`;

  return (
    <div className={`mx-auto w-full max-w-[1580px] px-3 pb-8 ${className}`}>
      <MagazineFrameLayer tone={tone}>
        <PageTurnEngine pageNumber={pageNumber} />
        <div className="relative z-[2]">
          {/* Header strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 md:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">{issueLabel}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{pageLabel}</p>
          </div>

          {/* Post-header shadow gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-[43px] h-[18px] bg-gradient-to-b from-black/40 to-transparent" />

          {/* Spine depth shadow — reinforces center gutter crease */}
          <div className="pointer-events-none absolute inset-y-[72px] left-1/2 w-[96px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.50),rgba(0,0,0,0.20)_58%,transparent_78%)]" />

          {/* Spine highlight line — thin gloss on fold edge */}
          <div className="pointer-events-none absolute inset-y-[72px] left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white/22 to-transparent" />

          {/* Scanline overlay — print halftone texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_3px)] mix-blend-soft-light" />

          <MagazineSpineCore depth={1.05} />
          <MagazinePaperTexture intensity={0.9} />

          <div className={`relative ${contentClassName}`}>{children}</div>
        </div>
      </MagazineFrameLayer>
    </div>
  );
}
