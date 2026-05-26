import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Mic, Flame, Music, Star, Shield, Sword } from 'lucide-react';

type ArtistCard = {
  slug: string;
  name: string;
  genre: string;
  accent: string;
  viewers: number;
  live: boolean;
  iconId: keyof typeof ICON_MAP;
};

const ARTISTS: ArtistCard[] = [
  { slug: 'big-ace', name: 'Big Ace', genre: 'Hip-Hop', accent: '#FFD700', viewers: 2147, live: true, iconId: 'mic' },
  { slug: 'lani-flame', name: 'Lani Flame', genre: 'R&B', accent: '#FF2DAA', viewers: 1863, live: true, iconId: 'flame' },
  { slug: 'dj-blend', name: 'DJ Blend', genre: 'EDM', accent: '#00FFFF', viewers: 1204, live: true, iconId: 'music' },
  { slug: 'charro-ace', name: 'Charro Ace', genre: 'Hip-Hop', accent: '#FF6B35', viewers: 743, live: true, iconId: 'star' },
  { slug: 'bobby-stanley', name: 'Bobby Stanley', genre: 'Rap', accent: '#39FF14', viewers: 398, live: false, iconId: 'shield' },
  { slug: 'nova-cipher', name: 'Nova Cipher', genre: 'Battle', accent: '#AA2DFF', viewers: 1521, live: true, iconId: 'sword' },
];

export default function ArtistProfileHub() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '34px 20px 74px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#00FFFF', fontWeight: 900 }}>ARTIST DISCOVERY</div>
          <h1 style={{ margin: '6px 0', fontSize: 'clamp(30px,4.2vw,58px)', lineHeight: 0.95 }}>Artists & Performers</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
            Open artist profiles, read performer articles, and jump directly into live lobbies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Link href="/live/lobby/performers" style={cta('#FF2DAA', '#fff')}>Performer Lobby</Link>
          <Link href="/battles/new" style={cta('#FFD700', '#050510')}>Challenge Song</Link>
          <Link href="/cypher/stage" style={cta('#AA2DFF', '#fff')}>Cypher Arena</Link>
          <Link href="/articles" style={cta('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.2)')}>News & Articles</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {ARTISTS.map((artist) => {
            const Icon = ICON_MAP[artist.iconId] ?? Mic;
            return (
            <article key={artist.slug} style={{ border: `1px solid ${artist.accent}44`, borderRadius: 12, padding: 14, background: `linear-gradient(145deg, ${artist.accent}10, rgba(5,5,16,0.92))`}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: artist.accent, fontWeight: 800, letterSpacing: '0.08em' }}>{artist.genre.toUpperCase()}</span>
                {artist.live ? <span style={{ fontSize: 9, color: '#FF2020', fontWeight: 900 }}>● LIVE</span> : null}
              </div>

              <div style={{ fontSize: 36, marginBottom: 4, color: artist.accent }}>
                <Icon size={36} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: '0 0 2px', fontSize: 24, lineHeight: 1 }}>{artist.name}</h3>
              <p style={{ margin: '0 0 10px', color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>👁 {artist.viewers.toLocaleString()} watching</p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href={`/articles/performer/${artist.slug}`} style={linkChip(artist.accent)}>Article</Link>
                <Link href={`/performers/${artist.slug}`} style={linkChip('#00FFFF')}>Profile</Link>
                <Link href="/live/lobby/performers" style={linkChip('#FFD700')}>Join Live</Link>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function cta(background: string, color: string, border = '1px solid transparent'): CSSProperties {
  return {
    textDecoration: 'none',
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 900,
    padding: '8px 12px',
    borderRadius: 8,
    border,
    background,
    color,
  };
}

function linkChip(color: string): CSSProperties {
  return {
    textDecoration: 'none',
    fontSize: 10,
    fontWeight: 800,
    color,
    border: `1px solid ${color}55`,
    borderRadius: 7,
    padding: '6px 10px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
}

const ICON_MAP = {
  mic: Mic,
  flame: Flame,
  music: Music,
  star: Star,
  shield: Shield,
  sword: Sword,
};
