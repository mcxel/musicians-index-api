"use client";

import { useMemo } from 'react';
import {
  type BroadcastQueueItem,
  sortBroadcastQueue,
} from '@/lib/broadcast/BroadcastQueueRegistry';
import { BroadcastCell } from './BroadcastCell';

// BroadcastQueueWall — the canonical broadcast mosaic grid.
// Every queue surface inherits this layout; on-air cells always surface first.
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 3,
        }}
      >
        {ordered.map((item) => (
          <BroadcastCell key={item.id} item={item} {...(onPreview ? { onPreview } : {})} />
        ))}
      </div>
    </div>
  );
}

export default BroadcastQueueWall;
