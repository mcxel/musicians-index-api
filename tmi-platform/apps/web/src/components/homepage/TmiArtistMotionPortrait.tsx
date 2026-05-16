"use client";

import { useMemo, useState } from "react";
import { ImageSlotWrapper } from "@/components/visual-enforcement";
import { useVisualRouting } from "@/lib/hooks/useVisualAuthority";

type Props = {
  stageName: string;
  stillSrc?: string;
  motionSrc?: string;
  className?: string;
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? "T"}${parts[1][0] ?? "M"}`.toUpperCase();
}

export default function TmiArtistMotionPortrait({ stageName, stillSrc, motionSrc, className }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(() => initialsFor(stageName), [stageName]);
  const { assetId: governedMotionAsset } = useVisualRouting(
    `motion-portrait-${stageName.toLowerCase().replace(/\s+/g, "-")}`,
    "performer-motion-portrait",
    "home",
    {
      displayName: stageName,
      sourceRoute: "/home",
      targetSlot: "tmi-artist-motion-portrait",
      telemetry: "visual_authority_applied",
      lineage: "lineage_registered",
      recovery: "degraded",
    }
  );
  const governedMotionSrc = governedMotionAsset || motionSrc;

  const rootClass = [
    "relative overflow-hidden rounded-lg border border-fuchsia-300/35 bg-black/55",
    className ?? "h-28 w-full",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {governedMotionSrc && !videoFailed ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
        >
          <source src={governedMotionSrc} type="video/mp4" />
        </video>
      ) : null}

      {(!motionSrc || videoFailed) && stillSrc && !imageFailed ? (
        <ImageSlotWrapper
          imageId={`still-portrait-${stageName.toLowerCase().replace(/\s+/g, "-")}`}
          roomId="home"
          priority="normal"
          fallbackUrl={stillSrc}
          altText={`${stageName} portrait`}
          className="h-full w-full object-cover"
          containerStyle={{ width: "100%", height: "100%" }}
          onStateChange={(state) => {
            if (state?.error) setImageFailed(true);
          }}
        />
      ) : null}

      {(motionSrc && videoFailed) || !stillSrc || imageFailed ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-600/35 via-cyan-500/30 to-zinc-900 text-xl font-black uppercase text-white">
          {initials}
        </div>
      ) : null}

      <span className="absolute left-2 top-2 rounded-full border border-white/25 bg-black/65 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-cyan-100">
        2-4s motion
      </span>
    </div>
  );
}
