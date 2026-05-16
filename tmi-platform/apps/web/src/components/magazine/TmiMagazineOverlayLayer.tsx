import { getOverlayPreset } from "@/lib/visual/tmiOverlayPresets";
import { TMI_MAGAZINE_Z_INDEX } from "@/lib/magazine/tmiMagazineZIndex";

type Props = {
  className?: string;
};

export default function TmiMagazineOverlayLayer({ className }: Props) {
  const preset = getOverlayPreset();

  return (
    <div
      className={["pointer-events-none absolute inset-0 overflow-hidden rounded-xl", className ?? ""].join(" ")}
      style={{ zIndex: TMI_MAGAZINE_Z_INDEX.overlay }}
    >
      <div className="absolute inset-0 rounded-xl border border-cyan-300/35" style={{ boxShadow: preset.frameGlow }} />
      <div className="absolute right-4 top-4 rounded-full border border-yellow-200/50 bg-yellow-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-yellow-100" style={{ boxShadow: preset.badgeGlow }}>
        Live Glow
      </div>
      <div className="absolute left-1/3 top-0 h-full w-16 -skew-x-12 opacity-25" style={{ background: preset.motionTrail }} />
    </div>
  );
}
