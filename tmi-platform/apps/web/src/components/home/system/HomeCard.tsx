'use client';

import type { ReactNode } from 'react';
import cardStyles from '@/styles/home/card.module.css';
import gridStyles from '@/styles/home/grid.module.css';
import { spanClass } from './HomeGrid';
import MotionCard from '@/components/motion/MotionCard';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** All supported card visual variants */
export type HomeCardVariant =
  | 'hero'
  | 'news'
  | 'feature'
  | 'interview'
  | 'recap'
  | 'genreCluster'
  | 'chart'
  | 'playlist'
  | 'directory'
  | 'liveHero'
  | 'lobbyGrid'
  | 'countdown'
  | 'calendar'
  | 'boost'
  | 'cypherGateway'
  | 'streamWin'
  | 'billboard'
  | 'adCarousel'
  | 'campaign'
  | 'targeting'
  | 'inventory'
  | 'analytics'
  | 'contracts'
  | 'winner'
  | 'audience'
  | 'frontRow'
  | 'gameHero'
  | 'gameGrid'
  | 'watchParty'
  | 'stageView'
  | 'cipherRoom'
  | 'stats'
  | 'map'
  | 'botStatus'
  | 'controls'
  | 'sponsorBanner'
  | 'store'
  | 'booking'
  | 'cta';

interface HomeCardProps {
  children?: ReactNode;
  /** Column span (1–12) within HomeGrid */
  span?: number;
  /** Row span override */
  rowSpan?: 2 | 3;
  /** Card visual/content variant */
  variant?: HomeCardVariant;
  /** Short label shown in card header */
  title?: string;
  /** Whether to show the scanline overlay */
  scanlines?: boolean;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * HomeCard — single magazine card inside `HomeGrid`.
 * Accepts a `span` (1–12) and a `variant` for neon styling.
 */
export default function HomeCard({
  children,
  span = 4,
  rowSpan,
  variant = 'feature',
  title,
  scanlines = false,
  className,
}: Readonly<HomeCardProps>) {
  const variantClass = cardStyles[variant as keyof typeof cardStyles];
  let rowSpanClass: string | undefined;
  if (rowSpan === 2) {
    rowSpanClass = gridStyles.rowSpan2;
  } else if (rowSpan === 3) {
    rowSpanClass = gridStyles.rowSpan3;
  }

  return (
    <MotionCard
      className={cn(spanClass(span), rowSpanClass, cardStyles.card, variantClass, className)}
      glowTone={variant === 'billboard' ? 'orange' : 'cyan'}
      hover
    >
      {title && (
        <div className={cardStyles.cardHeader}>
          <h3 className={cardStyles.cardTitle}>{title}</h3>
        </div>
      )}
      {children && (
        <div className={cardStyles.cardBody}>{children}</div>
      )}
      {scanlines && <div className={cardStyles.scanlines} aria-hidden />}
    </MotionCard>
  );
}

/** Card image/media fill area */
export function CardMedia({
  children,
  placeholder = '🎵',
}: Readonly<{ children?: ReactNode; placeholder?: string }>) {
  return (
    <div className={cardStyles.imageWrap}>
      {children ?? (
        <div className={cardStyles.imagePlaceholder}>{placeholder}</div>
      )}
    </div>
  );
}

/** Card header section */
export function CardHeader({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={cardStyles.cardHeader}>{children}</div>;
}

/** Card footer section */
export function CardFooter({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={cardStyles.cardFooter}>{children}</div>;
}

/** Card inner body */
export function CardBody({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={cardStyles.cardBody}>{children}</div>;
}

// Required for rowSpanStyle
