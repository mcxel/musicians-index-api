'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TmiBadgeOverlay from '@/components/overlays/TmiBadgeOverlay';
import TmiPaperNoise from '@/components/underlays/TmiPaperNoise';
import TmiGridFog from '@/components/underlays/TmiGridFog';
import Home12RankingDensityRail from '@/components/home/Home12RankingDensityRail';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

const IMG_A: [string, string, string] = [
  '/artists/artist-07.jpg',
  '/artists/artist-08.jpg',
  '/artists/artist-09.jpg',
];

const IMG_B: [string, string, string] = [
  '/artists/artist-10.jpg',
  '/artists/artist-01.png',
  '/artists/artist-02.png',
];

interface SpreadItem {
  id: string;
  rank: number;
  name: string;
  genre: string;
  color: string;
  images: [string, string, string];
}

const DJS: SpreadItem[] = [
  { id: 'dj-1', rank: 1, name: 'Neon Vibe', genre: 'Electronic', color: '#00FFFF', images: IMG_A },
  { id: 'dj-2', rank: 2, name: 'DJ Phantom', genre: 'Hip-Hop', color: '#FF2DAA', images: IMG_B },
  { id: 'dj-3', rank: 3, name: 'Voltage', genre: 'Drum & Bass', color: '#FFD700', images: IMG_A },
  { id: 'dj-4', rank: 4, name: 'Bass Temple', genre: 'House', color: '#AA2DFF', images: IMG_B },
  { id: 'dj-5', rank: 5, name: 'DJ Lumi', genre: 'Afrobeats', color: '#00FF88', images: IMG_A },
  { id: 'dj-6', rank: 6, name: 'Wavetek', genre: 'Electronic', color: '#00FFFF', images: IMG_B },
  { id: 'dj-7', rank: 7, name: 'Night Pulse', genre: 'Hip-Hop', color: '#FF2DAA', images: IMG_A },
  { id: 'dj-8', rank: 8, name: 'Skyline Beat', genre: 'House', color: '#FFD700', images: IMG_B },
  { id: 'dj-9', rank: 9, name: 'Circuit Monk', genre: 'Trap', color: '#AA2DFF', images: IMG_A },
  { id: 'dj-10', rank: 10, name: 'Metro Echo', genre: 'Electronic', color: '#00FF88', images: IMG_B },
];

const MVPS: SpreadItem[] = [
  { id: 'mvp-1', rank: 1, name: 'Luna Star', genre: 'Hip-Hop', color: '#FFD700', images: IMG_A },
  { id: 'mvp-2', rank: 2, name: 'Verse Nova', genre: 'R&B', color: '#00FFFF', images: IMG_B },
  { id: 'mvp-3', rank: 3, name: 'Drift King', genre: 'Trap', color: '#FF2DAA', images: IMG_A },
  { id: 'mvp-4', rank: 4, name: 'Echo Saint', genre: 'House', color: '#AA2DFF', images: IMG_B },
  { id: 'mvp-5', rank: 5, name: 'Pulse Hero', genre: 'Electronic', color: '#00FF88', images: IMG_A },
  { id: 'mvp-6', rank: 6, name: 'Golden Mic', genre: 'Hip-Hop', color: '#FFD700', images: IMG_B },
  { id: 'mvp-7', rank: 7, name: 'Sky Rhyme', genre: 'Trap', color: '#FF2DAA', images: IMG_A },
  { id: 'mvp-8', rank: 8, name: 'FlowMaster', genre: 'R&B', color: '#FFD700', images: IMG_B },
  { id: 'mvp-9', rank: 9, name: 'Verse Knight', genre: 'Jazz Rap', color: '#AA2DFF', images: IMG_A },
  { id: 'mvp-10', rank: 10, name: 'Echo Dynasty', genre: 'Drill', color: '#00FF88', images: IMG_B },
];

function AvatarRotator({ images, color }: { images: [string, string, string]; color: string }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % 3), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <ImageSlotWrapper
      imageId={`home12-avatar-${idx}`}
      roomId="home-12"
      priority="normal"
      fallbackUrl={images[idx]}
      altText="Home 12 spread avatar"
      className="w-full h-full object-cover"
      containerStyle={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `2px solid ${color}55`,
        boxShadow: `0 0 10px ${color}30`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    />
  );
}

function BigSpreadCard({ item }: { item: SpreadItem }) {
  const isTop3 = item.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: item.rank * 0.035 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 10,
        background: isTop3 ? `${item.color}0F` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${item.color}${isTop3 ? '45' : '1F'}`,
        boxShadow: isTop3 ? `0 0 16px ${item.color}18` : undefined,
      }}
    >
      <div
        style={{
          fontSize: isTop3 ? 20 : 15,
          fontWeight: 900,
          color: item.color,
          minWidth: 28,
          textShadow: isTop3 ? `0 0 12px ${item.color}90` : undefined,
        }}
      >
        #{item.rank}
      </div>
      <AvatarRotator images={item.images} color={item.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#fff',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{item.genre}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link
          href={`/profile/${item.id}`}
          style={{
            fontSize: 7,
            fontWeight: 800,
            color: item.color,
            background: `${item.color}18`,
            padding: '3px 8px',
            borderRadius: 3,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          PROFILE
        </Link>
        <Link
          href={`/vote/${item.id}`}
          style={{
            fontSize: 7,
            fontWeight: 800,
            color: '#050510',
            background: item.color,
            padding: '3px 8px',
            borderRadius: 3,
            textDecoration: 'none',
            textAlign: 'center',
            boxShadow: isTop3 ? `0 0 8px ${item.color}70` : undefined,
          }}
        >
          VOTE ▲
        </Link>
      </div>
    </motion.div>
  );
}

export default function Home12SpreadSurface() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const genres = ['All', 'Hip-Hop', 'Electronic', 'R&B', 'House', 'Trap'];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050510',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: 80,
      }}
    >
      <TmiPaperNoise opacity={0.02} />
      <TmiGridFog color="#FFD700" opacity={0.012} gridSize={50} />

      <div
        style={{
          borderBottom: '2px solid #FFD70025',
          background: 'linear-gradient(90deg, rgba(5,5,16,0.9) 0%, rgba(26,5,40,0.95) 50%, rgba(5,5,16,0.9) 100%)',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 4 }}>
            TMI — THE MUSICIAN&apos;S INDEX
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.8rem)', fontWeight: 900, margin: 0, color: '#fff' }}>
            Top 10 Double Spread
          </h1>
        </div>
      </div>

      <Home12RankingDensityRail />

      <div style={{ maxWidth: 1200, margin: '20px auto 0', padding: '0 24px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g === 'All' ? null : g)}
            style={{
              padding: '5px 14px',
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderRadius: 14,
              border: `1px solid ${activeGenre === g || (!activeGenre && g === 'All') ? '#FFD700' : 'rgba(255,215,0,0.2)'}`,
              background: activeGenre === g || (!activeGenre && g === 'All') ? '#FFD70020' : 'transparent',
              color: activeGenre === g || (!activeGenre && g === 'All') ? '#FFD700' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '24px auto 0',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
      >
        <div style={{ border: '1px solid rgba(0,255,255,0.15)', borderRadius: 14, padding: '22px 18px' }}>
          <TmiBadgeOverlay badge="TOP 10" position="top-right" size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {DJS.filter((d) => !activeGenre || d.genre === activeGenre).map((dj) => (
              <BigSpreadCard key={dj.id} item={dj} />
            ))}
          </div>
        </div>

        <div style={{ border: '1px solid rgba(255,215,0,0.15)', borderRadius: 14, padding: '22px 18px' }}>
          <TmiBadgeOverlay badge="TOP 10" position="top-right" size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {MVPS.filter((m) => !activeGenre || m.genre === activeGenre).map((mvp) => (
              <BigSpreadCard key={mvp.id} item={mvp} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
