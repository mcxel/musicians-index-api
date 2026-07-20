'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Real TMI promotional banners (apps/web/public/banners) — Rule 12 tier 1
// (official TMI promo). These are the two vertical "banner wells" flanking
// the magazine hero on wide desktop viewports.
const BANNER_FILES = [
  'Banner1.png',
  'Banner2.png',
  'Banner 2.jpg',
  'Banner 3.jpg',
  'Banner 4.jpg',
  'Banner 5.jpg',
  'Banner 6.jpg',
  'Banner Actors and Streamers.png',
  'Banner Battle.png',
  'Banner Battle of the bands.png',
  'Banner Challenges.png',
  'Banner Comedy.png',
  'Banner Cyhpers.png',
  'Banner Dance Off.png',
  'Banner Fans.png',
  'Banner Games.png',
  'Banner Live Sessions.png',
  'Banner Lobbies.png',
  'Banner Lounges.png',
  'Banner World Dance Party.png',
  'Banner World Karaoke.png',
  'Banner instrument players.png',
].map((name) => `/banners/${encodeURIComponent(name)}`);

const HOLD_MS = 8000;
const FADE_MS = 1100;

function randomOtherIndex(current: number, length: number) {
  if (length <= 1) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

function useDesktopRailVisibility(minWidth = 2100) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.innerWidth >= minWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [minWidth]);

  return visible;
}

// Netflix-style crossfade: two stacked image slots, opposite opacities.
// Advancing swaps the src of the currently-hidden (back) slot to a fresh
// random banner, then flips which slot is "front" — both opacities
// transition simultaneously, so the outgoing and incoming banners overlap
// mid-fade instead of leaving a blank gap. No slide, fade only.
function useCrossfadeBanner(startDelayMs: number) {
  const [first] = useState(() => Math.floor(Math.random() * BANNER_FILES.length));
  const [second] = useState(() => randomOtherIndex(first, BANNER_FILES.length));
  const [slots, setSlots] = useState<[string, string]>(() => [BANNER_FILES[first]!, BANNER_FILES[second]!]);
  const [frontSlot, setFrontSlot] = useState<0 | 1>(0);
  const frontRef = useRef<0 | 1>(0);
  const currentIndexRef = useRef(first);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    (async () => {
      await wait(startDelayMs);
      while (!cancelled) {
        await wait(HOLD_MS);
        if (cancelled) return;

        const nextBannerIndex = randomOtherIndex(currentIndexRef.current, BANNER_FILES.length);
        const backSlot: 0 | 1 = frontRef.current === 0 ? 1 : 0;
        currentIndexRef.current = nextBannerIndex;
        frontRef.current = backSlot;

        setSlots((prev) => {
          const updated: [string, string] = [prev[0], prev[1]];
          updated[backSlot] = BANNER_FILES[nextBannerIndex]!;
          return updated;
        });
        setFrontSlot(backSlot);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [startDelayMs]);

  return { slots, frontSlot };
}

export default function DesktopAtmosphereRails() {
  const isDesktop = useDesktopRailVisibility();
  // Staggered start delays so left/right bathe in and out independently
  // rather than in lockstep.
  const left = useCrossfadeBanner(0);
  const right = useCrossfadeBanner(2600);

  if (!isDesktop) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          // Center zone must stay wider than any real page content that
          // mounts this component (Fan Hub's 220px rail + fluid center +
          // 330px chat rail alone can exceed 1500px) — otherwise this
          // decorative overlay's zIndex:1 dark gradient bleeds over real
          // content instead of staying confined to genuinely empty margin.
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1600px) minmax(0,1fr)',
          gap: 0,
        }}
      >
        <BannerWell side="left" slots={left.slots} frontSlot={left.frontSlot} />
        <div />
        <BannerWell side="right" slots={right.slots} frontSlot={right.frontSlot} />
      </div>
    </div>
  );
}

function BannerWell({
  side,
  slots,
  frontSlot,
}: {
  side: 'left' | 'right';
  slots: [string, string];
  frontSlot: 0 | 1;
}) {
  return (
    <div style={{ position: 'relative', minWidth: 0, height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [side === 'left' ? 'left' : 'right']: '6%',
          transform: 'translateY(-50%)',
          // Never larger than the frame it lives in — capped both by a
          // percentage of the available column and an absolute ceiling —
          // and always proportionally contained, never cropped/stretched.
          width: 'min(230px, 82%)',
          height: 'min(340px, 56vh)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'rgba(8,6,20,0.55)',
          border: side === 'left' ? '1px solid rgba(255,45,170,0.3)' : '1px solid rgba(255,215,0,0.3)',
          boxShadow: side === 'left' ? '0 0 40px rgba(255,45,170,0.14)' : '0 0 40px rgba(255,215,0,0.14)',
        }}
      >
        {slots.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt=""
            fill
            sizes="20vw"
            style={{
              objectFit: 'contain',
              padding: 10,
              position: 'absolute',
              inset: 0,
              opacity: frontSlot === i ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
            priority={false}
          />
        ))}
      </div>
    </div>
  );
}
