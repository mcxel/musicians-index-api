'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TmiBadgeOverlay from '@/components/overlays/TmiBadgeOverlay';
import { getCrownRankRuntime, type CrownRankRuntimeEntry } from '@/lib/home/CrownRankRuntime';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

function AvatarCard({ image, color }: { image: string; color: string }) {
  return (
    <ImageSlotWrapper
      imageId={`home1-top10-avatar-${image.split('/').pop() ?? 'fallback'}`}
      roomId="home-1-top10"
      priority="normal"
      fallbackUrl={image}
      altText="Top 10 avatar"
      className="w-full h-full object-cover"
      containerStyle={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `2px solid ${color}60`,
        boxShadow: `0 0 8px ${color}30`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    />
  );
}

function accentForRank(rank: number): string {
  const palette = ['#FFD700', '#00FFFF', '#FF2DAA', '#AA2DFF', '#00FF88'];
  return palette[(rank - 1) % palette.length] ?? '#00FFFF';
}

function RankCard({ item, index }: { item: CrownRankRuntimeEntry; index: number }) {
  const isTop3 = item.rank <= 3;
  const color = accentForRank(item.rank);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: isTop3 ? `${color}0D` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${color}${isTop3 ? '40' : '1A'}`,
        boxShadow: isTop3 ? `0 0 12px ${color}1A` : undefined,
        position: 'relative',
      }}
    >
      <div style={{ fontSize: isTop3 ? 16 : 13, fontWeight: 900, color, minWidth: 26, textShadow: isTop3 ? `0 0 8px ${color}80` : undefined }}>
        #{item.rank}
      </div>
      <AvatarCard image={item.media.posterFrameUrl} color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{item.genre} · {item.badge}</div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <Link href={item.route} style={{ fontSize: 7, fontWeight: 800, color, background: `${color}18`, padding: '3px 7px', borderRadius: 3, textDecoration: 'none' }}>
          VIEW
        </Link>
        <Link href={item.articleRoute} style={{ fontSize: 7, fontWeight: 800, color: '#050510', background: color, padding: '3px 7px', borderRadius: 3, textDecoration: 'none', boxShadow: isTop3 ? `0 0 6px ${color}80` : undefined }}>
          READ
        </Link>
      </div>
    </motion.div>
  );
}

function SpreadColumn({ title, icon, accentColor, items, chartRoute }: { title: string; icon: string; accentColor: string; items: CrownRankRuntimeEntry[]; chartRoute: string }) {
  return (
    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.015)', border: `1px solid ${accentColor}20`, borderRadius: 12, padding: '20px 18px', overflow: 'hidden' }}>
      <TmiBadgeOverlay badge="TOP 10" position="top-right" size="sm" />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>TMI RANKINGS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: accentColor, margin: 0 }}>{title}</h2>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => <RankCard key={item.artistId} item={item} index={i} />)}
      </div>
      <Link href={chartRoute} style={{ display: 'inline-block', marginTop: 14, fontSize: 8, fontWeight: 800, color: accentColor, textDecoration: 'none', letterSpacing: '0.1em' }}>
        FULL CHART →
      </Link>
    </div>
  );
}

export default function Home1Top10DoubleSpreaded() {
  const ranks = useMemo(() => getCrownRankRuntime(10), []);
  const frontHalf = ranks.slice(0, 5);
  const backHalf = ranks.slice(5, 10);

  if (ranks.length === 0) return null;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 40px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 18 }}>
        TOP 10 DOUBLE SPREAD · THIS WEEK
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SpreadColumn title="Top Crown Five" icon="👑" accentColor="#FFD700" items={frontHalf} chartRoute="/rankings/crown" />
        <SpreadColumn title="Challenger Ladder" icon="⚡" accentColor="#00FFFF" items={backHalf} chartRoute="/rankings/crown" />
      </div>
    </section>
  );
}
