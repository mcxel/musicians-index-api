'use client';

import Link from 'next/link';
import ArtistStats from '@/components/artist/ArtistStats';
import ArtistBio from '@/components/artist/ArtistBio';
import ArtistMusic from '@/components/artist/ArtistMusic';
import ArtistShows from '@/components/artist/ArtistShows';
import ArtistVideos from '@/components/artist/ArtistVideos';

function titleCase(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function seedArtist(slug: string) {
  const hash = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const genrePool = [['Hip-Hop', 'R&B'], ['Trap', 'Soul'], ['Neo-Soul', 'Hip-Hop'], ['R&B', 'Pop'], ['Hip-Hop', 'Trap']];
  const genres = genrePool[hash % genrePool.length]!;
  const accentColors = ['#00FFFF', '#FF2DAA', '#AA2DFF', '#FFD700'];
  const accent = accentColors[hash % accentColors.length]!;
  return {
    slug,
    displayName: titleCase(slug),
    verified: hash % 3 !== 0,
    genres,
    accent,
    followers: 5000 + (hash % 95000),
    views: 200000 + (hash % 2800000),
    tagline: ['Cypher champion · 8-win streak', 'R&B vocalist · TMI Season 2', 'Trap producer · Beat vault artist', 'Neo-Soul performer · Touring act'][hash % 4]!,
    joinedSeasons: 1 + (hash % 3),
  };
}

interface Props { params: { slug: string } }

export default function ArtistPublicProfile({ params }: Props) {
  const artist = seedArtist(params.slug);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* Top nav */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/artists" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← ARTISTS</Link>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>TMI HOME</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <Link href={`/artists/${params.slug}/analytics`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Analytics</Link>
          <Link href={`/hub/artist`} style={{ fontSize: 11, color: artist.accent, textDecoration: 'none' }}>Artist Hub →</Link>
        </div>
      </div>

      {/* Hero header */}
      <div style={{
        padding: '40px 24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: `radial-gradient(ellipse at top left, ${artist.accent}10 0%, transparent 60%)`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
              background: `${artist.accent}20`, border: `2px solid ${artist.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900, color: artist.accent,
            }}>
              {artist.displayName.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  {artist.displayName}
                </h1>
                {artist.verified && (
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#FFD700', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 4, padding: '2px 8px' }}>
                    VERIFIED
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px' }}>{artist.tagline}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {artist.genres.map((g) => (
                  <span key={g} style={{ fontSize: 10, fontWeight: 700, color: artist.accent, background: `${artist.accent}12`, border: `1px solid ${artist.accent}30`, borderRadius: 20, padding: '3px 10px' }}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 64px' }}>

        {/* Stats */}
        <div style={{ marginBottom: 28 }}>
          <ArtistStats followers={artist.followers} views={artist.views} verified={artist.verified} genres={artist.genres} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          <Link
            href={`/meet/${params.slug}`}
            style={{ padding: '10px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: artist.accent, color: '#060410', textDecoration: 'none' }}
          >
            Meet & Greet →
          </Link>
          <Link
            href={`/shoutout/${params.slug}`}
            style={{ padding: '10px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', textDecoration: 'none' }}
          >
            💬 Shoutout
          </Link>
          <Link
            href={`/booking/artists/${params.slug}`}
            style={{ padding: '10px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            📅 Book Artist
          </Link>
          <Link
            href={`/artists/${params.slug}/article`}
            style={{ padding: '10px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            📰 Artist Article
          </Link>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>About</SectionLabel>
          <ArtistBio bio={`${artist.displayName} is a ${artist.genres.join(' / ')} artist performing on TMI since Season ${artist.joinedSeasons}. Known for high-energy sets, battle victories, and authentic storytelling through music.`} />
        </div>

        {/* Music */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Music</SectionLabel>
          <ArtistMusic musicLinks={[
            { platform: 'spotify', url: '#' },
            { platform: 'apple', url: '#' },
            { platform: 'soundcloud', url: '#' },
          ]} />
        </div>

        {/* Shows */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Shows & Events</SectionLabel>
          <ArtistShows />
        </div>

        {/* Videos */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Videos</SectionLabel>
          <ArtistVideos />
        </div>

        {/* Links */}
        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/artists/${params.slug}/analytics`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Analytics</Link>
          <Link href={`/artists/${params.slug}/lobby`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Artist Lobby</Link>
          <Link href={`/artists/${params.slug}/live`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Go Live</Link>
          <Link href={`/artists/${params.slug}/press-kit`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Press Kit</Link>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
      {children}
    </div>
  );
}
