"use client";

import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import GlowSweepOverlay from "@/components/atmosphere/GlowSweepOverlay";
import EnergyRibbon from "@/components/atmosphere/EnergyRibbon";
import AmbientParticleField from "@/components/atmosphere/AmbientParticleField";

type MagazineAtmosphereLayerProps = {
  zBase?: number;
  intensity?: number;
  speed?: number;
  primary?: string;
  secondary?: string;
  tertiary?: string;
};

export default function MagazineAtmosphereLayer({
  zBase = 1,
  intensity = 1,
  speed = 1,
  primary = "#00ffff",
  secondary = "#ff2daa",
  tertiary = "#aa2dff",
}: MagazineAtmosphereLayerProps) {
  const alpha = Math.max(0.08, Math.min(0.36, 0.18 * intensity));

  return (
    <>
      <NeonWaveUnderlay
        zIndex={zBase}
        opacity={alpha + 0.06}
        speed={speed}
        colorA={primary}
        colorB={secondary}
        colorC={tertiary}
      />
      <EnergyRibbon
        zIndex={zBase + 1}
        opacity={alpha + 0.02}
        speed={speed}
        color={primary}
      />
      <AmbientParticleField
        zIndex={zBase + 2}
        opacity={alpha - 0.04}
        speed={speed}
        palette={[primary, secondary, tertiary, "#ffd700"]}
      />
      <GlowSweepOverlay
        zIndex={zBase + 3}
        opacity={alpha}
        speed={speed}
        color="#ffffff"
      />
    </>
  );
}
