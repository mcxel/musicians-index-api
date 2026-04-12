import type { ReactNode } from 'react';

export default function SectionGrid({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}
