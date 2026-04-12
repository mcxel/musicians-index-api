import type { ReactNode } from 'react';
import NeonFrame from './NeonFrame';

export default function DraggableCard({
  children,
  colSpan = 12,
  accent = 'cyan',
}: Readonly<{
  children: ReactNode;
  colSpan?: number;
  accent?: 'cyan' | 'pink' | 'gold';
}>) {
  return (
    <div style={{ gridColumn: `span ${Math.max(1, Math.min(12, colSpan))}` }}>
      <NeonFrame accent={accent}>
        <div style={{ padding: 12 }}>{children}</div>
      </NeonFrame>
    </div>
  );
}
