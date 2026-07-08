import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SIZE = { width: 1200, height: 630 };

type ShareMode = 'still' | 'motion' | 'live' | 'premiere';

function clean(input: string | null, fallback: string, max = 80): string {
  if (!input) return fallback;
  const stripped = input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!stripped) return fallback;
  return stripped.slice(0, max);
}

function normalizeMode(raw: string | null): ShareMode {
  if (raw === 'motion' || raw === 'live' || raw === 'premiere') return raw;
  return 'still';
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;
  const performer = clean(query.get('performer'), 'Featured Performer', 60);
  const headline = clean(query.get('headline'), 'Living Magazine Feature', 100);
  const article = clean(query.get('article'), 'article', 42).toUpperCase();
  const mode = normalizeMode(query.get('mode'));
  const isLive = query.get('live') === '1' || mode === 'live';
  const viewers = Number(query.get('viewers') || '0');

  const modeLabel = isLive ? 'LIVE NOW' : mode === 'motion' ? 'MOTION COVER' : mode === 'premiere' ? 'PREMIERE' : 'STILL COVER';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 18% 20%, #00ffff44 0%, #050510 42%), radial-gradient(circle at 82% 70%, #ff2daa33 0%, transparent 45%), #050510',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(130deg, transparent 0%, #aa2dff20 48%, transparent 100%)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '54px 62px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 25, letterSpacing: 3, color: '#00ffff', border: '2px solid #00ffff77', padding: '9px 14px', textTransform: 'uppercase' }}>
              The Musician&apos;s Index
            </div>
            <div style={{ fontSize: 22, color: isLive ? '#ff4d4d' : '#ffd700', letterSpacing: 2 }}>{modeLabel}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 64, lineHeight: 1, fontWeight: 900, maxWidth: 1020, textTransform: 'uppercase' }}>{performer}</div>
            <div style={{ fontSize: 31, color: '#ff2daa', letterSpacing: 1.2, maxWidth: 1040 }}>{headline}</div>
            {isLive ? (
              <div style={{ fontSize: 24, color: '#ffd700' }}>
                LIVE SESSION · {Number.isFinite(viewers) && viewers > 0 ? `${viewers.toLocaleString()} watching` : 'Join now'}
              </div>
            ) : (
              <div style={{ fontSize: 24, color: '#e7f3ff' }}>Magazine cover experience with motion + article + profile links</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 22, color: '#ffd700', letterSpacing: 1.1 }}>Article #{article}</div>
            <div style={{ fontSize: 21, color: '#050510', background: '#00ffff', padding: '10px 16px', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 800 }}>
              Read Full Story
            </div>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
