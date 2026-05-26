import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SIZE = { width: 1200, height: 630 };

function clean(input: string | null, fallback: string, max = 80): string {
  if (!input) return fallback;
  const stripped = input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!stripped) return fallback;
  return stripped.slice(0, max);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;
  const title = clean(query.get('title'), 'Viral Playlist Lock', 84);
  const curator = clean(query.get('curator'), 'TMI Curator', 48);
  const playlist = clean(query.get('playlist'), 'playlist', 42).toUpperCase();
  const topLine = clean(query.get('top'), 'Tap in. Share once. Grow forever.', 110);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 20% 20%, #00ffff44 0%, #050510 45%), radial-gradient(circle at 80% 70%, #ff2daa33 0%, transparent 44%), #06070d',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(130deg, transparent 0%, #aa2dff1f 45%, transparent 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '58px 64px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 28,
                letterSpacing: 3,
                color: '#00ffff',
                border: '2px solid #00ffff77',
                padding: '10px 16px',
                textTransform: 'uppercase',
              }}
            >
              The Musician's Index
            </div>
            <div style={{ fontSize: 24, color: '#ffd700', letterSpacing: 2 }}>Playlist #{playlist}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontSize: 68,
                lineHeight: 1,
                fontWeight: 900,
                maxWidth: 1000,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 30, color: '#ff2daa', letterSpacing: 1.8, textTransform: 'uppercase' }}>
              Curated by {curator}
            </div>
            <div style={{ fontSize: 26, color: '#e7f3ff', maxWidth: 980 }}>{topLine}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 24, color: '#ffd700', letterSpacing: 1.2 }}>
              One tap share. One wave of listeners.
            </div>
            <div
              style={{
                fontSize: 22,
                color: '#050510',
                background: '#00ffff',
                padding: '10px 18px',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              tmi viral lock
            </div>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
