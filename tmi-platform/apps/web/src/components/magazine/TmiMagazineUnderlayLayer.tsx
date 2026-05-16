import { getUnderlayPreset } from "@/lib/visual/tmiUnderlayPresets";
import { TMI_MAGAZINE_Z_INDEX } from "@/lib/magazine/tmiMagazineZIndex";

type Props = {
  className?: string;
};

export default function TmiMagazineUnderlayLayer({ className }: Props) {
  const preset = getUnderlayPreset();

  return (
    <div
      className={["pointer-events-none absolute inset-0 overflow-hidden rounded-xl", className ?? ""].join(" ")}
      style={{ zIndex: TMI_MAGAZINE_Z_INDEX.underlay }}
    >
      <div className="absolute inset-0" style={{ background: preset.shadowPool }} />
      <div className="absolute inset-0" style={{ background: preset.colorWash }} />
      <div className="absolute inset-0 opacity-45" style={{ background: preset.texture }} />
    </div>
  );
}
