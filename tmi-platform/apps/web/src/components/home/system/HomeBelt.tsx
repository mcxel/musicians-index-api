'use client';

import { type ReactNode } from 'react';
import beltStyles from '@/styles/home/belt.module.css';
import themeStyles from '@/styles/home/theme.module.css';
import type { BeltType } from '@/lib/theme/homeTheme';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface HomeBeltProps {
  children: ReactNode;
  /** Belt personality — controls accent colours, background, borders */
  type?: BeltType;
  title?: string;
  subtitle?: string;
  /** Short badge text shown top-right */
  badge?: string;
  id?: string;
  className?: string;
  /** If true, skip the chrome (header/borders) for raw layout belts */
  bare?: boolean;
}

const BELT_BG_MAP: Record<BeltType, keyof typeof themeStyles> = {
  editorial:   'beltEditorial',
  discovery:   'beltDiscovery',
  live:        'beltLive',
  sponsor:     'beltSponsor',
  game:        'beltGame',
  admin:       'beltAdmin',
  booking:     'beltBooking',
  winners:     'beltWinners',
  marketplace: 'beltMarketplace',
  cypher:      'beltCypher',
};

/**
 * HomeBelt — full-width section container with neon chrome.
 * Wraps `HomeGrid` and cards in a themed belt.
 */
export default function HomeBelt({
  children,
  type = 'editorial',
  title,
  subtitle,
  badge,
  id,
  className,
  bare = false,
}: Readonly<HomeBeltProps>) {
  const bgClass = themeStyles[BELT_BG_MAP[type]];

  if (bare) {
    return (
      <section id={id} className={cn(beltStyles.belt, bgClass, className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn(
        beltStyles.belt,
        beltStyles[type as keyof typeof beltStyles],
        bgClass,
        className,
      )}
    >
      {(title || badge) && (
        <div className={beltStyles.beltHeader}>
          <div>
            {title && (
              <h2 className={beltStyles.beltTitle}>{title}</h2>
            )}
            {subtitle && (
              <p className={beltStyles.beltSubtitle}>{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className={beltStyles.beltBadge}>{badge}</span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
