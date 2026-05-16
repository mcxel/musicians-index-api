'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TmiBadgeOverlay from '@/components/overlays/TmiBadgeOverlay';
import ConfettiLayer from '@/components/effects/ConfettiLayer';
import OrbitBattleAnimationLayer from '@/components/home/OrbitBattleAnimationLayer';
import GovernedOrbitFace from '@/components/home/GovernedOrbitFace';
import { composeLiveMagazineCover } from '@/lib/home/LiveMagazineCoverComposer';
import { getCrownArtistPayload, getOrbitArtistPayloads } from '@/lib/home/OrbitArtistPayloadEngine';
import type { MusicGenre } from '@/engines/home/CoverGenreRotationAuthority';

type Home1MagazineCoverHeroProps = {
  heroImageRef?: string | null;
};

function normalizeGenre(genre?: string): MusicGenre {
  const allowed: MusicGenre[] = ['Hip-Hop', 'R&B', 'Electronic', 'Pop', 'Rock', 'Latin', 'Country', 'Jazz', 'Reggae', 'Gospel', 'Soul', 'Trap', 'Alternative'];
  if (genre && allowed.includes(genre as MusicGenre)) return genre as MusicGenre;
  return 'Hip-Hop';
}

function HeroTelemetryBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div data-telemetry="true" data-governed-slot="home1-hero-boundary" style={{ position: 'relative' }}>
      {children}
    </div>
  );
}

function CrownWinnerCard({
  winner,
  fallbackPoster,
}: {
  winner: {
    name: string;
    route: string;
    voteRoute: string;
    liveScore: number;
    media: { posterFrameUrl?: string | null; status?: string };
  };
  fallbackPoster?: string | null;
}) {
  const poster = winner.media.posterFrameUrl || fallbackPoster || '/artists/artist-01.png';

  return (
    <motion.div
      animate={{ boxShadow: ['0 0 22px rgba(255,215,0,0.25)', '0 0 38px rgba(255,215,0,0.5)', '0 0 22px rgba(255,215,0,0.25)'] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        transform: 'translate(-50%, -50%)',
        width: 220,
        borderRadius: 16,
        border: '2px solid rgba(255,215,0,0.55)',
        overflow: 'hidden',
        background: 'rgba(20,14,4,0.85)',
        zIndex: 5,
      }}
      data-governed-slot="crown-center"
      data-image-id={`crown_${poster.split('/').pop() ?? 'fallback'}`}
      data-telemetry="true"
    >
      <div style={{ height: 160, backgroundImage: `url('${poster}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: '10px 12px', textAlign: 'center', display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.24em', color: '#FFD700', fontWeight: 800 }}>#1 CROWN WINNER</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{winner.name}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>SCORE {winner.liveScore} · {winner.media.status}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
          <Link href={winner.route} style={{ fontSize: 8, fontWeight: 800, color: '#00FFFF', textDecoration: 'none' }}>
            VIEW PROFILE
          </Link>
          <Link href={winner.voteRoute} style={{ fontSize: 8, fontWeight: 800, color: '#050510', background: '#FFD700', padding: '4px 8px', borderRadius: 4, textDecoration: 'none' }}>
            VOTE NOW
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function HeroCTACluster() {
  const ctas = [
    { href: '/rankings/crown', label: 'CROWN BOARD', bg: '#00FFFF', fg: '#050510' },
    { href: '/magazine', label: 'READ MAGAZINE', bg: '#FFD700', fg: '#050510' },
    { href: '/cypher', label: 'JOIN CYPHER', bg: '#AA2DFF', fg: '#fff' },
    { href: '/battles', label: 'OPEN BATTLES', bg: '#FF2DAA', fg: '#fff' },
  ];

  return (
    <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', zIndex: 6 }}>
      {ctas.map((cta) => (
        <Link
          key={cta.href}
          href={cta.href}
          style={{
            padding: '8px 12px',
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: cta.fg,
            background: cta.bg,
            borderRadius: 6,
            textDecoration: 'none',
            boxShadow: '0 0 14px rgba(255,255,255,0.15)',
          }}
        >
          {cta.label}
        </Link>
      ))}
    </div>
  );
}

function OrbitFaceRail({
  orbitArtists,
  orbitRadius,
  frame,
}: {
  orbitArtists: Array<{ artistId: string; name: string; rank: number; score: number; route: string; articleRoute: string }>;
  orbitRadius: number;
  frame: number;
}) {
  return (
    <>
      {orbitArtists.map((artist, idx) => {
        const angle = ((idx / Math.max(orbitArtists.length, 1)) * Math.PI * 2) + frame * 0.02;
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * (orbitRadius * 0.65);

        return (
          <GovernedOrbitFace
            key={artist.artistId}
            artistId={artist.artistId}
            artistName={artist.name}
            rank={artist.rank}
            score={artist.score}
            route={artist.route}
            profileRoute={artist.articleRoute}
            roomId="home-1"
            x={x}
            y={y}
            delayIndex={idx}
          />
        );
      })}
    </>
  );
}

export default function Home1MagazineCoverHero({ heroImageRef }: Home1MagazineCoverHeroProps) {
  const [frame, setFrame] = useState(0);
  const [orbitRadius, setOrbitRadius] = useState(190);

  const cover = useMemo(() => composeLiveMagazineCover(), []);
  const fallbackWinner = useMemo(() => getCrownArtistPayload(), []);
  const fallbackOrbit = useMemo(() => getOrbitArtistPayloads(), []);

  const winner = cover.winner ?? {
    artistId: fallbackWinner.artistId,
    name: fallbackWinner.name,
    rank: 1,
    genre: fallbackWinner.genre,
    liveScore: 0,
    movement: fallbackWinner.movement,
    route: fallbackWinner.articleRoute,
    articleRoute: fallbackWinner.articleRoute,
    voteRoute: `/vote/${fallbackWinner.artistId}`,
    summary: 'Autofilled runtime winner while live crown feed stabilizes.',
    badgeLabel: 'RUNTIME FALLBACK',
    issueNumber: 0,
    weekInSeason: 0,
    media: {
      posterFrameUrl: heroImageRef ?? fallbackWinner.posterFrameUrl,
      status: 'FALLBACK',
    },
  };

  const orbitArtists = cover.orbitArtists.length
    ? cover.orbitArtists
    : fallbackOrbit.map((entry, index) => ({
        artistId: entry.artistId,
        name: entry.name,
        rank: entry.rank,
        genre: entry.genre,
        score: 1000 - index * 13,
        delta: entry.movement === 'rising' ? 6 : entry.movement === 'falling' ? -4 : 0,
        movement: entry.movement,
        badge: entry.stateBadge ?? 'LIVE',
        route: entry.articleRoute,
        articleRoute: entry.articleRoute,
        voteRoute: `/vote/${entry.artistId}`,
        media: {
          posterFrameUrl: entry.posterFrameUrl,
          status: entry.liveStatus,
        },
      }));

  const orbitContenders = useMemo(() => {
    return orbitArtists.slice(0, 9).map((artist, index) => ({
      performerId: artist.artistId,
      name: artist.name,
      avatarUrl: artist.media.posterFrameUrl,
      votes: Math.max(1, artist.score),
      orbitAngle: index * 40,
      orbitRadius,
      isCurrentCrown: false,
      route: artist.route,
      profileRoute: artist.route,
      articleRoute: artist.articleRoute,
      hubRoute: '/hub/artist',
      xpRoute: '/xp',
      battleRoute: '/battles',
    }));
  }, [orbitArtists, orbitRadius]);

  useEffect(() => {
    // Keep the orbit visibly alive; slow ticks made the cover appear frozen.
    const t = setInterval(() => setFrame((p) => p + 1), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setOrbitRadius(102);
      else if (w < 768) setOrbitRadius(132);
      else if (w < 1024) setOrbitRadius(166);
      else setOrbitRadius(206);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const heroPoster = heroImageRef ?? winner.media.posterFrameUrl ?? '/artists/artist-01.png';

  return (
    <section style={{ padding: '32px 24px 40px' }}>
      <HeroTelemetryBoundary>
        <div
          style={{
            position: 'relative',
            borderRadius: 14,
            border: '2px solid #00FFFF30',
            boxShadow: '0 0 40px #00FFFF12, inset 0 0 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            minHeight: 560,
            background:
              'radial-gradient(circle at 20% 20%, rgba(255,45,170,0.18), transparent 38%), radial-gradient(circle at 80% 80%, rgba(0,255,255,0.2), transparent 40%), linear-gradient(170deg, #090018, #050510)',
          }}
        >
          <TmiBadgeOverlay badge="LIVE" position="top-left" size="md" />

          <div
            data-governed-slot="hero-background"
            data-image-id={`hero_${heroPoster.split('/').pop() ?? 'fallback'}`}
            data-telemetry="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${heroPoster}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
            }}
          />

          <ConfettiLayer count={26} style={{ zIndex: 2, opacity: 0.72 }} />

          <div style={{ position: 'relative', zIndex: 4, padding: '40px 24px 30px', minHeight: 560 }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#00FFFF', fontWeight: 800, marginBottom: 10 }}>
                TOP 10 CROWN ENGINE · LIVE VOTING
              </div>
              <h2 className="tmi-masthead" style={{ fontSize: 'clamp(1.8rem,5vw,3.4rem)', margin: 0 }}>
                {cover.headlines[0] ?? 'CROWN UPDATE IN PROGRESS'}
              </h2>
            </div>

            <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 420 }}>
              <OrbitFaceRail orbitArtists={orbitArtists} orbitRadius={orbitRadius} frame={frame} />

              <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', opacity: 0.7 }}>
                <OrbitBattleAnimationLayer
                  contenders={orbitContenders}
                  genre={normalizeGenre(winner.genre)}
                  orbitRadiusPx={orbitRadius}
                  containerSize={520}
                  renderMode="cutout"
                />
              </div>

              <CrownWinnerCard winner={winner} fallbackPoster={heroImageRef} />
              <HeroCTACluster />
            </div>
          </div>
        </div>
      </HeroTelemetryBoundary>
    </section>
  );
}
