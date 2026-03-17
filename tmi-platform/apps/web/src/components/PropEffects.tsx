"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  equippedProp?: string | null;
  active?: boolean; // whether prop is placed on stage
  health?: 'healthy'|'degraded'|'safe-mode' | null;
  small?: boolean; // compact preview
};

export function PropEffects({ equippedProp, active = true, health = 'healthy', small = false }: Props) {
  const [flicker, setFlicker] = useState(1);
  const suppressed = health === 'safe-mode';

  useEffect(() => {
    if (!equippedProp || suppressed) return;
    let id: any;
    if (equippedProp === 'prop-candle') {
      id = setInterval(() => setFlicker(0.85 + Math.random() * 0.3), 350 + Math.random() * 300);
    } else if (equippedProp === 'prop-glow-stick') {
      id = setInterval(() => setFlicker(0.8 + Math.random() * 0.4), 500);
    } else if (equippedProp === 'prop-flashlight') {
      // flashlight steady when active
      setFlicker(1);
    }
    return () => { if (id) clearInterval(id); };
  }, [equippedProp, suppressed]);

  const emoji = useMemo(() => {
    if (!equippedProp) return null;
    if (equippedProp.includes('candle')) return '🕯️';
    if (equippedProp.includes('glow-stick')) return '🟢';
    if (equippedProp.includes('flashlight')) return '🔦';
    return '✨';
  }, [equippedProp]);

  if (!equippedProp) return null;

  // suppressed: show static small icon only
  if (suppressed) {
    return (
      <div className={`inline-flex items-center justify-center ${small ? 'w-8 h-8' : 'w-12 h-12'}`}>
        <div className="text-xl">{emoji}</div>
      </div>
    );
  }

  if (equippedProp === 'prop-candle') {
    const size = small ? 28 : 44;
    return (
      <div className="flex items-center justify-center">
        <div style={{ width: size, height: size, transform: `scale(${flicker})` }} className="rounded-full flex items-center justify-center">
          <div style={{ filter: `drop-shadow(0 0 ${small ? 6 : 12}px rgba(255,200,80,${0.4 * flicker}))` }} className="text-2xl">{emoji}</div>
        </div>
      </div>
    );
  }

  if (equippedProp === 'prop-glow-stick') {
    const color = '#7CFC00';
    const size = small ? 28 : 44;
    return (
      <div className="flex items-center justify-center">
        <div style={{ width: size, height: 6, borderRadius: 6, background: color, boxShadow: `0 0 ${small ? 6 : 18}px ${color}`, transform: `scaleX(${0.9 + (flicker-0.8)})` }} />
      </div>
    );
  }

  if (equippedProp === 'prop-flashlight') {
    const beam = active ? (
      <div style={{ width: small ? 80 : 160, height: small ? 40 : 80, background: 'linear-gradient(90deg, rgba(255,255,220,0.14), rgba(255,255,220,0.02))' }} className="rounded-md -ml-2" />
    ) : null;

    return (
      <div className="flex items-center gap-2">
        <div className="text-2xl">{emoji}</div>
        {beam}
      </div>
    );
  }

  return null;
}
