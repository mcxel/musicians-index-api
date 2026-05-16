'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MagazineRuntimeEngine,
  MASTER_RESET_TIMINGS,
  type MagazineRuntimePhase,
  type MagazineSceneId,
} from '@/engines/magazine/MagazineRuntimeEngine';
import MagazineStarburstTransition from '@/components/magazine/MagazineStarburstTransition';
import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import HomePage012Artifact from '@/components/artifacts/HomePage012.artifact';
import IgnitionBurstConfetti from '@/components/home/effects/IgnitionBurstConfetti';

type SceneConfig = {
  id: MagazineSceneId;
  durationMs: number;
  label: string;
  accent: string;
  isMasterReset?: boolean;
};

const SCENES: SceneConfig[] = [
  { id: 'home-1',   durationMs: 30000, label: 'Crown Cover',    accent: '#00FFFF'  },
  { id: 'home-1-2', durationMs: 30000, label: 'Open Spread',    accent: '#36e4ff'  },
  { id: 'home-2',   durationMs: 60000, label: 'Dashboard Core', accent: '#FF2DAA'  },
  { id: 'home-3',   durationMs: 60000, label: 'Live World',     accent: '#FF4444'  },
  { id: 'home-4',   durationMs: 60000, label: 'Sponsor World',  accent: '#FFD700'  },
  { id: 'home-5',   durationMs: 60000, label: 'Charts & Store', accent: '#AA2DFF', isMasterReset: true },
];

const SESSION_KEY = 'tmi_mag_scene_idx';

function SceneContent({ sceneId }: { sceneId: MagazineSceneId }) {
  switch (sceneId) {
    case 'home-1':
      return (
        <>
          <HomeSurfacePage surfaceId={1} />
          <IgnitionBurstConfetti zIndex={50} assetCategory="hipHop" burstDurationMs={2200} cycleMs={14000} burstCount={44} />
        </>
      );
    case 'home-1-2':
      return (
        <>
          <HomePage012Artifact />
          <IgnitionBurstConfetti zIndex={50} assetCategory="jazz" burstDurationMs={2200} cycleMs={16000} burstCount={36} />
        </>
      );
    case 'home-2': return <HomeSurfacePage surfaceId={2} />;
    case 'home-3': return <HomeSurfacePage surfaceId={3} />;
    case 'home-4': return <HomeSurfacePage surfaceId={4} />;
    case 'home-5': return <HomeSurfacePage surfaceId={5} />;
  }
}

export default function MagazineFullRotationContainer() {
  const [sceneIndex, setSceneIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? Math.min(Number(saved), SCENES.length - 1) : 0;
  });
  const [phase, setPhase] = useState<MagazineRuntimePhase>('holding');
  const [paused, setPaused] = useState(false);

  const advancedRef = useRef(false);
  const paused_ref = useRef(false);

  const scene = SCENES[sceneIndex]!;
  const nextIndex = (sceneIndex + 1) % SCENES.length;
  const isMasterWrap = scene.isMasterReset;

  const advanceScene = useCallback((to: number) => {
    setSceneIndex(to);
    sessionStorage.setItem(SESSION_KEY, String(to));
    setPhase('holding');
    advancedRef.current = false;
  }, []);

  useEffect(() => {
    if (paused) return;
    advancedRef.current = false;

    const engine = new MagazineRuntimeEngine({
      scene: {
        id: scene.id,
        durationMs: scene.durationMs,
        nextSceneId: SCENES[nextIndex]!.id,
      },
      timings: isMasterWrap ? MASTER_RESET_TIMINGS : undefined,
      onPhaseChange: (p) => {
        if (paused_ref.current) return;
        setPhase(p);
      },
      onAdvance: () => {
        if (advancedRef.current || paused_ref.current) return;
        advancedRef.current = true;
        advanceScene(nextIndex);
      },
    });

    engine.start();
    return () => engine.stop();
  }, [sceneIndex, paused, scene, nextIndex, isMasterWrap, advanceScene]);

  const handleMouseEnter = useCallback(() => {
    setPaused(true);
    paused_ref.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPaused(false);
    paused_ref.current = false;
  }, []);

  const goTo = useCallback((idx: number) => {
    advancedRef.current = false;
    advanceScene(idx);
  }, [advanceScene]);

  return (
    <div
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Master reset glow — fires on home-5 → home-1 wrap */}
      {isMasterWrap && phase !== 'holding' && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 110,
            opacity: phase === 'starburst' ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      )}

      {/* Active scene */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          minHeight: '100vh',
          transformOrigin: 'left center',
          transform:
            phase === 'starburst' ? 'perspective(1800px) rotateY(-6deg) scale(0.986) translateX(-8px)'
            : phase === 'flipping'  ? 'perspective(1800px) rotateY(-19deg) rotateX(1deg) translateX(-26px) scale(0.975)'
            : phase === 'settling'  ? 'perspective(1800px) rotateY(8deg) translateX(10px) scale(0.994)'
            : 'perspective(1800px) rotateY(0deg)',
          transition:
            phase === 'starburst' ? 'transform 420ms cubic-bezier(0.18, 0.82, 0.22, 1)'
            : phase === 'flipping'  ? `transform ${isMasterWrap ? 1200 : 820}ms cubic-bezier(0.33, 0.06, 0.08, 1)`
            : phase === 'settling'  ? 'transform 420ms cubic-bezier(0.08, 0.82, 0.2, 1)'
            : 'transform 140ms ease',
          filter: phase === 'starburst' ? 'brightness(1.2) saturate(1.22)' : 'none',
        }}
      >
        <SceneContent key={scene.id} sceneId={scene.id} />
      </div>

      {/* Transition overlay */}
      <MagazineStarburstTransition active={phase !== 'holding'} phase={phase} />

      {/* Scene position dots */}
      <nav
        aria-label="Magazine scene navigation"
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 200,
        }}
      >
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to ${s.label}`}
            onClick={() => goTo(i)}
            style={{
              width: i === sceneIndex ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === sceneIndex ? scene.accent : 'rgba(255,255,255,0.22)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </nav>

      {/* Scene label HUD */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 200,
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: scene.accent,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      >
        {sceneIndex + 1}/{SCENES.length} · {scene.label}
        {paused && ' · PAUSED'}
      </div>
    </div>
  );
}
