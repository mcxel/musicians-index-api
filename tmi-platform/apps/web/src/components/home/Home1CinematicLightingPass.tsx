'use client';

import { useEffect, useMemo, useState } from 'react';
import { HOME1_OBSIDIAN_PROFILE } from '@/lib/cinematic/VenueCinematicProfile';
import { resolveCinematicBudget, type CinematicBudget } from '@/lib/cinematic/PerformanceBudgetGovernor';

function budgetVars(level: CinematicBudget): { haze: number; bloom: number; reflection: number } {
  if (level === 'high') return { haze: 0.62, bloom: 0.2, reflection: 0.56 };
  if (level === 'safe') return { haze: 0.44, bloom: 0.1, reflection: 0.32 };
  return { haze: 0.56, bloom: 0.16, reflection: 0.5 };
}

export default function Home1CinematicLightingPass() {
  const [budget, setBudget] = useState<CinematicBudget>('balanced');

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

    setBudget(resolveCinematicBudget({ reducedMotion, hardwareConcurrency, deviceMemory }));
  }, []);

  const vars = useMemo(() => budgetVars(budget), [budget]);

  return (
    <>
      <style>{`
        .tmi-home1-cinematic-lock {
          --tmi-home1-lut: ${HOME1_OBSIDIAN_PROFILE.lutFilter};
          --tmi-home1-bloom: ${vars.bloom};
          --tmi-home1-haze-opacity: ${vars.haze};
          --tmi-home1-floor-reflection-opacity: ${vars.reflection};
        }

        .tmi-home1-cinematic-lock .tmi-home1-canvas-surface {
          filter: var(--tmi-home1-lut);
        }

        .tmi-home1-cinematic-lock .tmi-canvas-stage {
          box-shadow:
            inset 0 0 96px rgba(0, 0, 0, 0.86),
            0 0 calc(90px * var(--tmi-home1-bloom)) rgba(255, 176, 79, 0.45),
            0 22px 52px rgba(0, 0, 0, 0.64);
        }

        .tmi-home1-cinematic-lock .tmi-collage-emoji,
        .tmi-home1-cinematic-lock .tmi-panel-emoji,
        .tmi-home1-cinematic-lock .tmi-collage-card img,
        .tmi-home1-cinematic-lock .tmi-panel img {
          background-image:
            linear-gradient(180deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.02) 32%, rgba(0, 0, 0, 0.2) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -12px 20px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 255, 255, 0.1);
        }

        @keyframes tmiHome1HazeDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -1.2%, 0) scale(1.02); }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 11,
          pointerEvents: 'none',
          opacity: vars.haze,
          background: HOME1_OBSIDIAN_PROFILE.hazeGradient,
          mixBlendMode: 'screen',
          animation: 'tmiHome1HazeDrift 14s ease-in-out infinite',
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 12,
          pointerEvents: 'none',
          background: HOME1_OBSIDIAN_PROFILE.stageKeyLight,
          mixBlendMode: 'screen',
          opacity: 0.78,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 12,
          pointerEvents: 'none',
          background: HOME1_OBSIDIAN_PROFILE.audienceRimLight,
          mixBlendMode: 'screen',
          opacity: 0.62,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          bottom: '10%',
          height: '35%',
          zIndex: 12,
          pointerEvents: 'none',
          background: HOME1_OBSIDIAN_PROFILE.floorReflection,
          opacity: vars.reflection,
          filter: 'blur(8px)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}
