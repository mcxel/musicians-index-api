import type { ReactNode } from 'react';

export default function CardCanvas({
  children,
  showGrid = false,
}: Readonly<{ children: ReactNode; showGrid?: boolean }>) {
  return (
    <section
      style={{
        position: 'relative',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.14)',
        padding: 14,
        background: 'radial-gradient(circle at 0% 0%, rgba(0,212,255,0.08), transparent 40%), rgba(5,10,20,0.6)',
        overflow: 'hidden',
      }}
    >
      {showGrid ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}
