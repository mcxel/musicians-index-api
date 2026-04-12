'use client';

import overlayStyles from '@/styles/home/overlay.module.css';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** All overlay badge types */
export type OverlayBadgeType =
  | 'live'
  | 'new'
  | 'crown'
  | 'genre'
  | 'sponsor'
  | 'watch'
  | 'join'
  | 'hot'
  | 'admin'
  | 'exclusive';

/** Position of the overlay within its card */
export type OverlayPosition =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'center'
  | 'topCenter'
  | 'bottomCenter';

interface HomeOverlayProps {
  /** Badge variant (determines colour / animation) */
  type: OverlayBadgeType;
  /** Text to display — defaults to the type label */
  label?: string;
  /** Position within the parent card (parent must be position:relative) */
  position?: OverlayPosition;
  className?: string;
}

const DEFAULT_LABELS: Record<OverlayBadgeType, string> = {
  live:      'Live',
  new:       'New',
  crown:     '👑 Crown',
  genre:     'Genre',
  sponsor:   'Sponsor',
  watch:     'Watch',
  join:      'Join',
  hot:       '🔥 Hot',
  admin:     'Admin',
  exclusive: '★ Exclusive',
};

/**
 * HomeOverlay — floating badge chip placed absolutely over a card.
 * The parent card must have `position: relative` (HomeCard already sets this).
 */
export default function HomeOverlay({
  type,
  label,
  position = 'topLeft',
  className,
}: Readonly<HomeOverlayProps>) {
  return (
    <span
      className={cn(
        overlayStyles.badge,
        overlayStyles[type as keyof typeof overlayStyles],
        overlayStyles.overlay,
        overlayStyles[position as keyof typeof overlayStyles],
        className,
      )}
    >
      {label ?? DEFAULT_LABELS[type]}
    </span>
  );
}

/** Counter chip (e.g. "1.2K viewers") */
export function CounterChip({ value, className }: Readonly<{ value: string | number; className?: string }>) {
  return (
    <span className={cn(overlayStyles.counter, className)}>{value}</span>
  );
}

/** Timer chip (e.g. "02:34") */
export function TimerChip({ value, className }: Readonly<{ value: string; className?: string }>) {
  return (
    <span className={cn(overlayStyles.timer, className)}>{value}</span>
  );
}

/** Rank number chip */
export function RankChip({ rank, className }: Readonly<{ rank: number; className?: string }>) {
  return (
    <span className={cn(overlayStyles.rank, className)}>{rank}</span>
  );
}

/** Small stat row: label + value */
export function StatTag({
  label,
  value,
  className,
}: Readonly<{ label: string; value: string | number; className?: string }>) {
  return (
    <span className={cn(overlayStyles.stat, className)}>
      {label} <strong>{value}</strong>
    </span>
  );
}

/** Ambient scanning line */
export function ScanLine({ className }: Readonly<{ className?: string }>) {
  return <div className={cn(overlayStyles.scanLine, className)} aria-hidden />;
}
