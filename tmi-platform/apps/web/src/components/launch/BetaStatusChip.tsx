'use client';

import Link from 'next/link';

export default function BetaStatusChip() {
  return (
    <Link
      href="/pricing"
      title="TMI Beta Season — Wave 1 active. Click to upgrade."
      style={{
        position: 'fixed',
        bottom: 96,
        right: 12,
        zIndex: 490,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        background: 'rgba(10,10,26,0.88)',
        border: '1px solid rgba(170,45,255,0.45)',
        borderRadius: 3,
        textDecoration: 'none',
        backdropFilter: 'blur(6px)',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: '#AA2DFF',
        boxShadow: '0 0 5px #AA2DFF',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 7,
        fontWeight: 900,
        letterSpacing: '0.2em',
        color: '#AA2DFF',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontFamily: "'Inter',sans-serif",
      }}>
        BETA · WAVE 1
      </span>
    </Link>
  );
}
