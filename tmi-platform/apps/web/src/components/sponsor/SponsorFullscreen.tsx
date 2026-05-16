"use client";

import { useVisualRouting } from "@/lib/hooks/useVisualAuthority";

type SponsorFullscreenProps = {
  title: string;
  videoUrl: string;
  onClose: () => void;
};

export default function SponsorFullscreen({ title, videoUrl, onClose }: SponsorFullscreenProps) {
  const { assetId: governedFullscreenAsset } = useVisualRouting(
    `sponsor-fullscreen-${title.toLowerCase().replace(/\s+/g, "-")}`,
    "sponsor-fullscreen-video",
    "home",
    {
      displayName: title,
      sourceRoute: "/sponsors",
      targetSlot: "sponsor-fullscreen",
      telemetry: "visual_authority_applied",
      recovery: "fallback",
    }
  );
  const resolvedVideoUrl = governedFullscreenAsset || videoUrl;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(2,6,23,0.92)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(1100px,100%)", border: "1px solid rgba(56,189,248,0.45)", borderRadius: 14, background: "#020617", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <strong style={{ color: "#93c5fd", letterSpacing: "0.12em", fontSize: 11 }}>{title} · FULLSCREEN</strong>
          <button data-testid="close-fullscreen" type="button" onClick={onClose} style={{ borderRadius: 999, border: "1px solid rgba(148,163,184,0.45)", background: "transparent", color: "#cbd5e1", cursor: "pointer", padding: "6px 10px", fontSize: 11 }}>
            Close
          </button>
        </div>
        <video className="w-full" src={resolvedVideoUrl} autoPlay muted loop playsInline />
      </div>
    </div>
  );
}
