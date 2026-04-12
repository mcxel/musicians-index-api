'use client';

import { type ReactNode } from 'react';
import motionStyles from '@/styles/home/motion.module.css';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface HomeTickerProps {
  items: Array<string | ReactNode>;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * HomeTicker — infinitely scrolling horizontal strip.
 * Duplicates content to create seamless loop.
 */
export default function HomeTicker({ items, className, speed = 'normal' }: Readonly<HomeTickerProps>) {
  let speedClass = motionStyles.tickerTrackNormal;
  if (speed === 'slow') {
    speedClass = motionStyles.tickerTrackSlow;
  } else if (speed === 'fast') {
    speedClass = motionStyles.tickerTrackFast;
  }

  return (
    <div className={cn(motionStyles.tickerShell, className)}>
      <div className={cn(motionStyles.tickerTrack, speedClass)}>
        {[...items, ...items].map((item, idx) => (
          <span key={`${idx}-${typeof item === 'string' ? item : 'node'}`} className={motionStyles.tickerItem}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
