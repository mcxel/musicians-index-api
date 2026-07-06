"use client";

import { useMemo } from 'react';
import {
  type BroadcastQueueItem,
  isOnAir,
  sortBroadcastQueue,
} from '@/lib/broadcast/BroadcastQueueRegistry';
import { BroadcastCell } from './BroadcastCell';

// BroadcastQueueWall — the canonical broadcast mosaic grid.
// Every queue surface inherits this layout; on-air cells always surface first.
// Shape-shifting mosaic: on-air cells expand to 2×2 featured frames while
// standby cells stay compact; dense auto-flow backfills so the wall has
// no dead space at any width.
export function BroadcastQueueWall({
  items,
  title,
  onPreview,
}: {
  items: BroadcastQueueItem[];
  title?: string;
  onPreview?: (id: string) => void;
}) {
  const ordered = useMemo(() => sortBroadcastQueue(items), [items]);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <style>{`
        @keyframes tmiCellLive { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
        @keyframes tmiCellWaiting { 0%,100% { transform: scale(1); opacity: 0.5 } 50% { transform: scale(1.02); opacity: 0.6 } }
        @keyframes tmiCellRecDot { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } }
      `}</style>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', color: '#dbd2ff', fontWeight: 800 }}>
        {title ?? `Broadcast Wall — ${ordered.length} performer${ordered.length === 1 ? '' : 's'}`}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gridAutoRows: 112,
          gridAutoFlow: 'dense',
          gap: 3,
        }}
      >
        {ordered.map((item) => {
          const featured = isOnAir(item.state) && ordered.length > 1;
          return (
            <div
              key={item.id}
              style={{
                minHeight: 0,
                minWidth: 0,
                ...(featured ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
              }}
            >
              <BroadcastCell item={item} featured={featured} {...(onPreview ? { onPreview } : {})} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BroadcastQueueWall;
