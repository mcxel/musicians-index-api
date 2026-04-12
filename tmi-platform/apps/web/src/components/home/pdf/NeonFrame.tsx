import type { CSSProperties, ReactNode } from 'react';
import { HOMEPAGE_GLOW, HOMEPAGE_RADIUS } from '@/lib/homepage/design-tokens';

export default function NeonFrame({
  children,
  accent = 'cyan',
  style,
}: Readonly<{
  children: ReactNode;
  accent?: 'cyan' | 'pink' | 'gold';
  style?: CSSProperties;
}>) {
  const glow = accent === 'pink' ? HOMEPAGE_GLOW.pink : accent === 'gold' ? HOMEPAGE_GLOW.gold : HOMEPAGE_GLOW.cyan;

  return (
    <div
      style={{
        borderRadius: HOMEPAGE_RADIUS.card,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: glow,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
