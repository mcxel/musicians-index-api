"use client";

import Link from "next/link";
import TmiOverlayShapeFrame from "@/components/overlays/TmiOverlayShapeFrame";
import type { TmiResolvedOverlayHotspot } from "@/lib/overlays/tmiUniversalOverlayEngine";

export default function TmiOverlayHotspot({
  hotspot,
  onSystemAction,
}: {
  hotspot: TmiResolvedOverlayHotspot;
  onSystemAction?: (actionId: string) => void;
}) {
  const content = (
    <TmiOverlayShapeFrame
      shapeId={hotspot.shapeId}
      className="h-full w-full rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100"
    >
      <div className="flex h-full items-center justify-between gap-2">
        <span>{hotspot.label}</span>
        <span className="text-[9px] text-cyan-200/90">
          {hotspot.clickability.intent === "locked" ? "LOCKED" : hotspot.clickability.intent}
        </span>
      </div>
    </TmiOverlayShapeFrame>
  );

  const frameClass =
    "absolute transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]";

  const style = {
    left: `${hotspot.frame.x}%`,
    top: `${hotspot.frame.y}%`,
    width: `${hotspot.frame.width}%`,
    height: `${hotspot.frame.height}%`,
  };

  if (hotspot.clickability.intent === "route") {
    return (
      <Link href={hotspot.clickability.resolvedTarget} className={frameClass} style={style}>
        {content}
      </Link>
    );
  }

  if (hotspot.clickability.intent === "system-action") {
    return (
      <button
        type="button"
        className={frameClass}
        style={style}
        onClick={() => onSystemAction?.(hotspot.clickability.resolvedTarget)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`${frameClass} pointer-events-auto`} style={style} title={hotspot.clickability.lockedReason}>
      {content}
    </div>
  );
}
