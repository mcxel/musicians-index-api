'use client';

import { type ReactNode, forwardRef } from 'react';
import styles from '@/styles/home/grid.module.css';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface HomeGridProps {
  children: ReactNode;
  /** 'normal' | 'tight' | 'loose' — controls gap size */
  spacing?: 'normal' | 'tight' | 'loose';
  className?: string;
}

/**
 * HomeGrid — 12-column dense magazine grid.
 * Cards inside should use `HomeCard` with a `span` prop.
 */
export default function HomeGrid({ children, spacing = 'normal', className }: Readonly<HomeGridProps>) {
  return (
    <div
      className={cn(
        styles.grid,
        spacing === 'tight' && styles.gridTight,
        spacing === 'loose' && styles.gridLoose,
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Helper to get the CSS module class for a given column span 1–12 */
export function spanClass(span: number): string {
  const map: Record<number, keyof typeof styles> = {
    1: 'span1', 2: 'span2', 3: 'span3', 4: 'span4',
    5: 'span5', 6: 'span6', 7: 'span7', 8: 'span8',
    9: 'span9', 10: 'span10', 11: 'span11', 12: 'span12',
  };
  return styles[map[span] ?? 'span12'];
}

/** Pre-built span wrapper */
export const GridCell = forwardRef<HTMLDivElement, { span?: number; rowSpan?: 2 | 3; children: ReactNode; className?: string }>(
  function GridCell({ span = 12, rowSpan, children, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          spanClass(span),
          rowSpan === 2 && styles.rowSpan2,
          rowSpan === 3 && styles.rowSpan3,
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
