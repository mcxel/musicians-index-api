'use client';

import Link from 'next/link';
import { ShowcaseRoomShell, type ShowcaseFormat } from '@/components/room/ShowcaseRoomShell';

const VALID_FORMATS: ShowcaseFormat[] = [
  'dj', 'singer', 'comedy', 'dance', 'producer',
  'band', 'instrumentalist', 'spoken-word', 'actor', 'magician',
];

export default function ShowcaseFormatPage({ params }: { params: { format: string } }) {
  const format = VALID_FORMATS.includes(params.format as ShowcaseFormat)
    ? (params.format as ShowcaseFormat)
    : 'singer';

  const roomId = `showcase-${format}-main`;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link href="/showcases" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-orbitron, monospace)' }}>
          ← ALL SHOWCASES
        </Link>
      </div>
      <ShowcaseRoomShell roomId={roomId} format={format} />
    </div>
  );
}
