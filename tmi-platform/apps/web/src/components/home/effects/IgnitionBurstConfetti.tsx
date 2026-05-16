'use client';

import { useEffect, useRef, useState } from 'react';
import ConfettiRespawnLoop from '@/components/home/effects/ConfettiRespawnLoop';

type AssetCategory = 'hipHop' | 'rock' | 'jazz' | 'default';

export type IgnitionBurstConfettiProps = {
  assetCategory?: AssetCategory;
  zIndex?: number;
  baseCount?: number;
  burstCount?: number;
  burstDurationMs?: number;
  cycleMs?: number;
  startDelayMs?: number;
};

export default function IgnitionBurstConfetti({
  assetCategory = 'default',
  zIndex = 50,
  baseCount = 24,
  burstCount = 40,
  burstDurationMs = 2200,
  cycleMs = 14000,
  startDelayMs = 700,
}: IgnitionBurstConfettiProps) {
  const [isBursting, setIsBursting] = useState(false);
  const burstTimeoutRef = useRef<number | null>(null);
  const burstIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const triggerBurst = () => {
      setIsBursting(true);
      if (burstTimeoutRef.current) {
        window.clearTimeout(burstTimeoutRef.current);
      }
      burstTimeoutRef.current = window.setTimeout(() => {
        setIsBursting(false);
      }, burstDurationMs);
    };

    const startTimer = window.setTimeout(() => {
      triggerBurst();
      burstIntervalRef.current = window.setInterval(triggerBurst, cycleMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(startTimer);
      if (burstTimeoutRef.current) {
        window.clearTimeout(burstTimeoutRef.current);
      }
      if (burstIntervalRef.current) {
        window.clearInterval(burstIntervalRef.current);
      }
    };
  }, [burstDurationMs, cycleMs, startDelayMs]);

  return (
    <ConfettiRespawnLoop
      active={isBursting}
      zIndex={zIndex}
      count={isBursting ? burstCount : baseCount}
      respawnMs={isBursting ? 1100 : 2200}
      assetCategory={assetCategory}
    />
  );
}