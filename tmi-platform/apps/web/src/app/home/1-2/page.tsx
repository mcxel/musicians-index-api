'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { fetchTrendingArtists, type TrendingArtist } from '@/lib/api/homepage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import { getPerformerById, getTopPerformers, PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import { ACTIVE_SPONSOR_ZONES } from '@/lib/commerce/SponsorRegistry';
import { getActiveSessions, onSessionsChanged, type LiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import BillboardCrownSequence from '@/components/home/BillboardCrownSequence';
import BillboardOpenBookSpread from '@/components/home/BillboardOpenBookSpread';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';

// Sponsor rail uses only real paid sponsors from ACTIVE_SPONSOR_ZONES.
// When no sponsors are purchased, SponsorRail returns null (no fake rows).
const REAL_SPONSORS = Object.entries(ACTIVE_SPONSOR_ZONES).map(([zone, s]) => ({
  id: zone,
  name: s.name,
  tagline: s.tagline,
}));

const GENRE_FILTERS = [
  'Hip Hop', 'R&B', 'Pop', 'EDM', 'Gospel', 'Country', 'Rock', 'Jazz', 'Blues', 'Reggae', 'Latin',
  'Afrobeat', 'Dancehall', 'Classical', 'Folk', 'Indie', 'Alternative', 'Choir', 'Marching Band',
];

const PERFORMANCE_CATEGORIES = [
  'Vocalists', 'Singers', 'Rappers', 'DJs', 'Producers', 'Beatmakers', 'Songwriters', 'Writers',
  'Comedians', 'Dancers', 'Actors', 'Magicians', 'Spoken Word', 'Poets', 'Bands', 'Choirs',
  'Marching Bands', 'Instrumentalists', 'Hosts', 'Venues', 'Promoters', 'Advertisers',
  'Bloggers', 'News Writers', 'Streamers',
];

const GLOBAL_INSTRUMENT_INDEX = [
  'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Violin', 'Viola', 'Cello', 'Harp', 'Flute',
  'Clarinet', 'Oboe', 'Bassoon', 'Saxophone', 'Trumpet', 'Trombone', 'French Horn', 'Tuba',
  'Banjo', 'Mandolin', 'Ukulele', 'Accordion', 'Harmonica', 'Percussion', 'Turntables',
  'Beat Production', 'Electronic Music',
];

const CAT_THEMES = [
  { accent: '#FF2DAA', glow: '#FF2DAA44', badge: '#AA2DFF' },
  { accent: '#00FFFF', glow: '#00FFFF44', badge: '#FF2DAA' },
  { accent: '#FFD700', glow: '#FFD70044', badge: '#00FFFF' },
  { accent: '#AA2DFF', glow: '#AA2DFF44', badge: '#FFD700' },
  { accent: '#00FF88', glow: '#00FF8844', badge: '#FF2DAA' },
];

const GENRE_PERSONALITY: Record<string, {
  accent: string;
  glow: string;
  badge: string;
  surface: string;
  spotlight: string;
}> = {
  'Hip Hop': { accent: '#FFD700', glow: '#FF2DAA66', badge: '#FF2DAA', surface: 'linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,45,170,0.12) 55%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,215,0,0.22), transparent 55%)' },
  'R&B': { accent: '#FF2DAA', glow: '#FFD70055', badge: '#FFD700', surface: 'linear-gradient(135deg, rgba(255,45,170,0.24), rgba(255,215,0,0.12) 60%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,45,170,0.22), transparent 55%)' },
  Pop: { accent: '#00FFFF', glow: '#FF2DAA55', badge: '#FFD700', surface: 'linear-gradient(135deg, rgba(0,255,255,0.18), rgba(255,45,170,0.1) 55%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(0,255,255,0.22), transparent 55%)' },
  EDM: { accent: '#00FFFF', glow: '#AA2DFF66', badge: '#AA2DFF', surface: 'linear-gradient(135deg, rgba(0,255,255,0.18), rgba(170,45,255,0.14) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(0,255,255,0.24), transparent 55%)' },
  Gospel: { accent: '#FFD700', glow: '#00FFFF44', badge: '#00FFFF', surface: 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(0,255,255,0.1) 60%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,215,0,0.2), transparent 55%)' },
  Country: { accent: '#FFB347', glow: '#8B5A2B66', badge: '#8B5A2B', surface: 'linear-gradient(135deg, rgba(255,179,71,0.18), rgba(139,90,43,0.15) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,179,71,0.2), transparent 55%)' },
  Rock: { accent: '#FF4D4D', glow: '#00000088', badge: '#AA2DFF', surface: 'linear-gradient(135deg, rgba(255,77,77,0.18), rgba(0,0,0,0.32) 58%, rgba(5,5,16,0.98))', spotlight: 'radial-gradient(circle at top left, rgba(255,77,77,0.22), transparent 55%)' },
  Jazz: { accent: '#3FA7FF', glow: '#FFD70055', badge: '#FFD700', surface: 'linear-gradient(135deg, rgba(63,167,255,0.18), rgba(255,215,0,0.12) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(63,167,255,0.22), transparent 55%)' },
  Blues: { accent: '#4D7CFE', glow: '#00FFFF44', badge: '#00FFFF', surface: 'linear-gradient(135deg, rgba(77,124,254,0.18), rgba(0,255,255,0.1) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(77,124,254,0.22), transparent 55%)' },
  Reggae: { accent: '#00FF88', glow: '#FFD70055', badge: '#FFD700', surface: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(255,215,0,0.12) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(0,255,136,0.24), transparent 55%)' },
  Latin: { accent: '#FF6B35', glow: '#FFD70055', badge: '#FFD700', surface: 'linear-gradient(135deg, rgba(255,107,53,0.22), rgba(255,215,0,0.1) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,107,53,0.24), transparent 55%)' },
  Afrobeat: { accent: '#FFD700', glow: '#00FF8844', badge: '#00FF88', surface: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,255,136,0.12) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,215,0,0.24), transparent 55%)' },
  Dancehall: { accent: '#00FF88', glow: '#FF2DAA55', badge: '#FF2DAA', surface: 'linear-gradient(135deg, rgba(0,255,136,0.18), rgba(255,45,170,0.12) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(0,255,136,0.24), transparent 55%)' },
  Classical: { accent: '#D4AF37', glow: '#F8F4E366', badge: '#F8F4E3', surface: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(248,244,227,0.18) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(248,244,227,0.22), transparent 55%)' },
  Folk: { accent: '#C08457', glow: '#FFD7A855', badge: '#FFD7A8', surface: 'linear-gradient(135deg, rgba(192,132,87,0.18), rgba(255,215,168,0.14) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(255,215,168,0.2), transparent 55%)' },
  Indie: { accent: '#9B5DE5', glow: '#00FFFF44', badge: '#00FFFF', surface: 'linear-gradient(135deg, rgba(155,93,229,0.18), rgba(0,255,255,0.1) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(155,93,229,0.2), transparent 55%)' },
  Alternative: { accent: '#AA2DFF', glow: '#FF4D4D55', badge: '#FF4D4D', surface: 'linear-gradient(135deg, rgba(170,45,255,0.18), rgba(255,77,77,0.1) 58%, rgba(5,5,16,0.96))', spotlight: 'radial-gradient(circle at top left, rgba(170,45,255,0.22), transparent 55%)' },
};

type BillboardCard = {
  id: string;
  name: string;
  profileImageUrl: string;
  category: string;
  rank: number;
  xp: number | null;
  votes: number | null;
  audience: number | null;
  tips: number | null;
  engagement: number | null;
  challengesWon: number | null;
  battlesWon: number | null;
  cyphersWon: number | null;
  achievements: number | null;
  isLive: boolean;
  tier: string;
  profileHref: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
};

type DisplayTheme = {
  accent: string;
  glow: string;
  badge: string;
  surface?: string;
  spotlight?: string;
};

type BoardView = {
  label: string;
  entries: BillboardCard[];
};

type InstrumentFeature = {
  label: string;
  topRanked: BillboardCard | null;
  risingStar: BillboardCard | null;
  mostActive: BillboardCard | null;
};

const BEST_OF_TMI_LANES = [
  { label: 'Best Singer', route: '/coming-soon/best-singer' },
  { label: 'Best Rapper', route: '/coming-soon/best-rapper' },
  { label: 'Best Guitarist', route: '/coming-soon/best-guitarist' },
  { label: 'Best Drummer', route: '/coming-soon/best-drummer' },
  { label: 'Best DJ', route: '/coming-soon/best-dj' },
  { label: 'Best Comedian', route: '/coming-soon/best-comedian' },
  { label: 'Best Dancer', route: '/coming-soon/best-dancer' },
  { label: 'Best Actor', route: '/coming-soon/best-actor' },
  { label: 'Best Band', route: '/coming-soon/best-band' },
  { label: 'Best Choir', route: '/coming-soon/best-choir' },
  { label: 'Best Marching Band', route: '/coming-soon/best-marching-band' },
  { label: 'Best Streamer', route: '/coming-soon/best-streamer' },
  { label: 'Best Writer', route: '/coming-soon/best-writer' },
  { label: 'Best Blogger', route: '/coming-soon/best-blogger' },
  { label: 'Best News Writer', route: '/coming-soon/best-news-writer' },
  { label: 'Best Fan', route: '/coming-soon/best-fan' },
  { label: 'Best Venue', route: '/coming-soon/best-venue' },
  { label: 'Best Promoter', route: '/coming-soon/best-promoter' },
  { label: 'Best Sponsor', route: '/coming-soon/best-sponsor' },
  { label: 'Best Battle Performer', route: '/coming-soon/best-battle-performer' },
  { label: 'Best Cypher Performer', route: '/coming-soon/best-cypher-performer' },
  { label: 'Best Challenge Performer', route: '/coming-soon/best-challenge-performer' },
  { label: 'Best New Artist', route: '/coming-soon/best-new-artist' },
  { label: 'Best New Band', route: '/coming-soon/best-new-band' },
  { label: 'Rising Star', route: '/coming-soon/rising-star' },
  { label: 'Most Improved', route: '/coming-soon/most-improved' },
] as const;

const PLACEHOLDER_IMAGES = new Set(['/images/tmi-placeholder.jpg', '']);

function hasRealProfileImage(url?: string): boolean {
  if (!url) return false;
  return !PLACEHOLDER_IMAGES.has(url.trim());
}

function matchesBestOfLane(card: BillboardCard, lane: string): boolean {
  const text = `${card.name} ${card.category}`.toLowerCase();
  if (lane.includes('Singer')) return /singer|vocal|r&b|gospel|pop/.test(text);
  if (lane.includes('Rapper')) return /rap|hip-hop|hip hop/.test(text);
  if (lane.includes('Guitarist')) return /guitar|instrumentalist/.test(text);
  if (lane.includes('Drummer')) return /drum|percussion/.test(text);
  if (lane.includes('Best DJ')) return /dj|turntab/.test(text);
  if (lane.includes('Comedian')) return /comedy|comedian/.test(text);
  if (lane.includes('Dancer')) return /dance|dance crew|hip hop dance/.test(text);
  if (lane.includes('Actor')) return /actor/.test(text);
  if (lane.includes('Marching Band')) return /marching/.test(text);
  if (lane.includes('Choir')) return /choir/.test(text);
  if (lane.includes('Best Band') || lane.includes('New Band')) return /band|group|ensemble|orchestra/.test(text);
  if (lane.includes('Streamer')) return /stream|broadcaster|commentator/.test(text);
  if (lane.includes('News Writer')) return /news|journal|writer|editor/.test(text);
  if (lane.includes('Blogger')) return /blog|writer|editor/.test(text);
  if (lane.includes('Writer')) return /writer|journal|editor|critic/.test(text);
  if (lane.includes('Best Fan')) return /fan/.test(text);
  if (lane.includes('Venue')) return /venue|arena|hall|club/.test(text);
  if (lane.includes('Promoter')) return /promoter/.test(text);
  if (lane.includes('Sponsor')) return /sponsor|advertiser/.test(text);
  if (lane.includes('Battle Performer')) return /battle|vs/.test(text);
  if (lane.includes('Cypher Performer')) return /cypher/.test(text);
  if (lane.includes('Challenge Performer')) return /challenge/.test(text);
  if (lane.includes('Rising Star')) return (card.rank >= 5 && card.rank <= 40) || (typeof card.xp === 'number' && card.xp > 15000);
  if (lane.includes('Most Improved')) return (typeof card.engagement === 'number' && card.engagement > 1000) || (typeof card.audience === 'number' && card.audience > 300);
  if (lane.includes('New Artist')) return card.rank <= 50;
  return false;
}

function getTheme(catIndex: number) {
  return CAT_THEMES[catIndex % CAT_THEMES.length]!;
}

function getGenreTheme(label: string, fallback: DisplayTheme) {
  const personality = GENRE_PERSONALITY[label];
  if (personality) return personality;
  return {
    accent: fallback.accent,
    glow: fallback.glow,
    badge: fallback.badge,
    surface: `linear-gradient(135deg, ${fallback.accent}22, rgba(5,5,16,0.96) 60%)`,
    spotlight: `radial-gradient(circle at top left, ${fallback.accent}22, transparent 55%)`,
  };
}

function mapTrending(category: string, rows: TrendingArtist[] | null): BillboardCard[] {
  if (!rows || rows.length === 0) return [];
  return rows.slice(0, 12).map((row, index) => {
    const performer = row.id ? getPerformerById(row.id) : undefined;
    return {
      id: row.id || `${category}-${index}`,
      name: row.stageName,
      profileImageUrl: row.image || performer?.profileImageUrl || '',
      category: row.genres?.[0] || category,
      rank: index + 1,
      xp: typeof performer?.xp === 'number' ? performer.xp : null,
      votes: null,
      audience: typeof performer?.audienceCount === 'number' ? performer.audienceCount : null,
      tips: null,
      engagement: typeof performer?.likes === 'number' ? performer.likes : null,
      challengesWon: null,
      battlesWon: null,
      cyphersWon: null,
      achievements: Array.isArray(performer?.achievementIds) ? performer.achievementIds.length : null,
      isLive: performer?.isLive ?? false,
      tier: performer?.tier ?? 'FREE',
      profileHref: row.slug ? `/performers/${encodeURIComponent(row.slug)}` : `/performers/${encodeURIComponent(row.id)}`,
      introVideoUrl: performer?.introVideoUrl,
      motionPosterUrl: performer?.motionPosterUrl,
    };
  });
}

function getMovementBadge(item: BillboardCard) {
  if (typeof item.votes === 'number' && item.votes > 0) return { label: `▲ +${item.votes}`, color: '#00FF88' };
  if (typeof item.votes === 'number' && item.votes < 0) return { label: `▼ ${item.votes}`, color: '#FF6B6B' };
  if (typeof item.votes === 'number' && item.votes === 0) return { label: '► 0', color: '#FFD700' };
  return { label: 'No History', color: 'rgba(255,255,255,0.62)' };
}

function getPagedEntries(entries: BillboardCard[], pageIndex: number, pageSize: number) {
  if (entries.length === 0) return [];
  if (entries.length <= pageSize) return entries;
  const totalPages = Math.ceil(entries.length / pageSize);
  const start = (pageIndex % totalPages) * pageSize;
  return entries.slice(start, start + pageSize);
}

function matchesRankingCategory(card: BillboardCard, label: string): boolean {
  const category = card.category.toLowerCase();
  const normalized = label.toLowerCase();
  if (normalized === 'vocalists') return category.includes('vocal') || category.includes('singer') || category.includes('r&b') || category.includes('gospel') || category.includes('pop');
  if (normalized === 'rappers') return category.includes('rap') || category.includes('hip-hop') || category.includes('hip hop');
  if (normalized === 'singers') return category.includes('r&b') || category.includes('gospel') || category.includes('pop') || category.includes('singer');
  if (normalized === 'producers') return category.includes('producer') || category.includes('beat') || category.includes('electronic');
  if (normalized === 'beatmakers') return category.includes('beatmaker') || category.includes('beat producer') || category.includes('beat');
  if (normalized === 'songwriters') return category.includes('writer') || category.includes('songwriter');
  if (normalized === 'writers') return category.includes('writer') || category.includes('poet') || category.includes('spoken');
  if (normalized === 'djs') return category.includes('dj') || category.includes('turntab');
  if (normalized === 'bands') return category.includes('band') || category.includes('group');
  if (normalized === 'dancers') return category.includes('dance') || category.includes('ballet') || category.includes('break') || category.includes('hip hop dance');
  if (normalized === 'comedians') return category.includes('comedy') || category.includes('comedian');
  if (normalized === 'actors') return category.includes('actor');
  if (normalized === 'magicians') return category.includes('magician');
  if (normalized === 'spoken word') return category.includes('spoken');
  if (normalized === 'poets') return category.includes('poet') || category.includes('poetry');
  if (normalized === 'choirs') return category.includes('choir') || category.includes('a cappella');
  if (normalized === 'instrumentalists') return category.includes('instrumentalist');
  if (normalized === 'hosts') return category.includes('host');
  if (normalized === 'venues') return category.includes('venue');
  if (normalized === 'promoters') return category.includes('promoter');
  if (normalized === 'advertisers') return category.includes('advertiser') || category.includes('sponsor');
  return category.includes(normalized);
}

function BillboardPortraitCard({ item, theme }: { item: BillboardCard; theme: DisplayTheme }) {
  const tierColors: Record<string, string> = {
    Diamond: '#00FFFF',
    Platinum: '#E5E4E2',
    Gold: '#FFD700',
    Silver: '#C0C0C0',
    RUBY: '#E0115F',
  };
  const tierColor = tierColors[item.tier] || '#fff';
  const movement = getMovementBadge(item);

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${theme.accent}33`,
        background: 'rgba(5,5,16,0.85)',
        boxShadow: `0 0 20px ${theme.glow}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 330,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(event) => {
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (event.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 34px ${theme.glow}`;
      }}
      onMouseLeave={(event) => {
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (event.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${theme.glow}`;
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', minHeight: 220, overflow: 'hidden', background: 'rgba(5,5,16,0.98)', transform: 'translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden' }}>
        <MotionPosterPlayer
          isLive={item.isLive}
          liveRoomRoute={undefined}
          introVideoUrl={item.introVideoUrl}
          motionPosterUrl={item.motionPosterUrl}
          staticImageUrl={item.profileImageUrl || '/images/tmi-placeholder.jpg'}
          alt={item.name}
          audienceCount={undefined}
          showLiveOverlay={false}
          objectFit="cover"
          width="100%"
          height="100%"
          style={{
            background: 'rgba(5,5,16,0.98)',
          }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8, background: `${theme.accent}DD`, color: '#000', fontWeight: 900, fontSize: 11, padding: '3px 7px', borderRadius: 4, fontFamily: 'var(--font-orbitron, monospace)', letterSpacing: '0.05em' }}>
          #{item.rank}
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.75)', color: tierColor, fontWeight: 800, fontSize: 9, padding: '3px 7px', borderRadius: 4, border: `1px solid ${tierColor}55`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {item.tier === 'RUBY' ? 'Ruby' : item.tier}
        </div>
        <div style={{ position: 'absolute', left: 8, bottom: 8, maxWidth: '62%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.75)', color: movement.color, fontWeight: 800, fontSize: 9, padding: '3px 7px', borderRadius: 4, letterSpacing: '0.05em' }}>
          {movement.label}
        </div>
        {item.isLive && (
          <div style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,0.8)', color: '#00FF88', fontWeight: 800, fontSize: 9, padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.05em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            LIVE
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,0.92))', pointerEvents: 'none' }} />
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5, background: 'rgba(5,5,16,0.96)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontWeight: 900, fontSize: 11, color: theme.accent, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' }}>
            {item.name}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{item.category}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.accent}22`, paddingTop: 5, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>XP <strong style={{ color: '#fff' }}>{typeof item.xp === 'number' ? item.xp.toLocaleString() : 'N/A'}</strong></span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Audience <strong style={{ color: '#fff' }}>{typeof item.audience === 'number' ? item.audience.toLocaleString() : 'Not Available Yet'}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Engagement <strong style={{ color: '#fff' }}>{typeof item.engagement === 'number' ? item.engagement.toLocaleString() : 'Not Available Yet'}</strong></span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Votes <strong style={{ color: '#fff' }}>{typeof item.votes === 'number' ? item.votes.toLocaleString() : 'Not Available Yet'}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <Link href={item.profileHref} style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{ width: '100%', background: `${theme.accent}1f`, color: theme.accent, border: `1px solid ${theme.accent}55`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '4px 6px', cursor: 'pointer' }}>
              View Profile
            </button>
          </Link>
          <Link href={`/rankings/vote?candidate=${encodeURIComponent(item.id)}`} style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{ width: '100%', background: 'rgba(255,45,170,0.18)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.45)', borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '4px 6px', cursor: 'pointer' }}>
              Vote
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BillboardFeatureCard({ title, item, theme, kicker }: { title: string; item: BillboardCard | null; theme: ReturnType<typeof getGenreTheme>; kicker: string }) {
  if (!item) {
    return (
      <div style={{ position: 'relative', minHeight: 280, borderRadius: 20, overflow: 'hidden', border: `1px solid ${theme.accent}33`, background: theme.surface, boxShadow: `0 24px 80px ${theme.glow}`, padding: 22 }}>
        <div style={{ position: 'absolute', inset: 0, background: theme.spotlight, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '.3em', color: theme.accent, fontWeight: 800 }}>{kicker}</div>
          <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 26, fontWeight: 900, marginTop: 10 }}>{title}</div>
          <div style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 340 }}>No ranked entries yet. This spread stays honest until performers in this category generate enough activity.</div>
        </div>
      </div>
    );
  }

  const movement = getMovementBadge(item);
  return (
    <Link href={item.profileHref} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ position: 'relative', minHeight: 280, borderRadius: 20, overflow: 'hidden', border: `1px solid ${theme.accent}44`, background: theme.surface, boxShadow: `0 24px 80px ${theme.glow}` }}>
        <div style={{ position: 'absolute', inset: 0, background: theme.spotlight, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.98)', transform: 'translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden' }}>
          <MotionPosterPlayer
            isLive={item.isLive}
            liveRoomRoute={undefined}
            introVideoUrl={item.introVideoUrl}
            motionPosterUrl={item.motionPosterUrl}
            staticImageUrl={item.profileImageUrl || '/images/tmi-placeholder.jpg'}
            alt={item.name}
            audienceCount={item.audience ?? undefined}
            showLiveOverlay={false}
            objectFit="cover"
            width="100%"
            height="100%"
            style={{
              background: 'rgba(5,5,16,0.98)',
            }}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,16,0.12), rgba(5,5,16,0.92))', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, background: `${theme.accent}e6`, color: '#050510', fontWeight: 900, fontSize: 13, borderRadius: 999, padding: '5px 10px', letterSpacing: '.08em' }}>#{item.rank}</div>
        <div style={{ position: 'absolute', top: 16, right: 16, maxWidth: '44%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '5px 10px', borderRadius: 999, background: 'rgba(5,5,16,0.72)', border: `1px solid ${theme.accent}33`, color: movement.color, fontSize: 10, fontWeight: 800, letterSpacing: '.08em' }}>{movement.label}</div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: 280, alignItems: 'end', padding: 22 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.3em', color: theme.accent, fontWeight: 800 }}>{kicker}</div>
            <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 26, fontWeight: 900, marginTop: 10, textShadow: `0 0 20px ${theme.glow}` }}>{title}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 6 }}>{item.category}</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, fontSize: 11 }}>
              <span>XP <strong style={{ color: '#fff' }}>{typeof item.xp === 'number' ? item.xp.toLocaleString() : 'N/A'}</strong></span>
              <span>Audience <strong style={{ color: '#fff' }}>{typeof item.audience === 'number' ? item.audience.toLocaleString() : 'Not Available Yet'}</strong></span>
              <span>Engagement <strong style={{ color: '#fff' }}>{typeof item.engagement === 'number' ? item.engagement.toLocaleString() : 'Not Available Yet'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BillboardCycleBoard({ board, theme, pageIndex }: { board: BoardView; theme: ReturnType<typeof getGenreTheme>; pageIndex: number }) {
  const paged = getPagedEntries(board.entries, pageIndex, 3);

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${theme.accent}2f`, background: theme.surface, boxShadow: `0 14px 40px ${theme.glow}`, padding: 14, minHeight: 250 }}>
      <div style={{ position: 'absolute', inset: 0, background: theme.spotlight, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.22em', color: theme.accent, fontWeight: 800 }}>LIVE BILLBOARD</div>
            <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 15, fontWeight: 900, color: '#fff' }}>{board.label.toUpperCase()}</div>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Auto cycling</div>
        </div>
        {paged.length > 0 ? (
          <div key={`${board.label}-${pageIndex}`} style={{ display: 'grid', gap: 10, animation: 'billboardSlideUp 0.6s cubic-bezier(0.25,1,0.5,1)' }}>
            {paged.map((entry) => {
              const movement = getMovementBadge(entry);
              return (
                <Link key={`${board.label}-${entry.id}`} href={entry.profileHref} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center', padding: 10, borderRadius: 12, background: 'rgba(5,5,16,0.88)', border: `1px solid ${theme.accent}22`, backdropFilter: 'blur(10px)' }}>
                    <div style={{ position: 'relative', width: 56, height: 68, borderRadius: 10, overflow: 'hidden', border: `1px solid ${theme.accent}33` }}>
                      <MotionPosterPlayer
                        isLive={entry.isLive}
                        liveRoomRoute={undefined}
                        introVideoUrl={entry.introVideoUrl}
                        motionPosterUrl={entry.motionPosterUrl}
                        staticImageUrl={entry.profileImageUrl || '/images/tmi-placeholder.jpg'}
                        alt={entry.name}
                        audienceCount={entry.audience ?? undefined}
                        showLiveOverlay={false}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        style={{ background: 'rgba(5,5,16,0.98)' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 14, fontWeight: 900, color: theme.accent }}>#{entry.rank}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.68)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{entry.category}</div>
                      <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.72)' }}>XP {typeof entry.xp === 'number' ? entry.xp.toLocaleString() : 'N/A'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: movement.color }}>{movement.label}</div>
                      {entry.isLive && <div style={{ marginTop: 6, fontSize: 9, color: '#00FF88', letterSpacing: '.1em' }}>LIVE</div>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '28px 10px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>No ranking history available</div>
        )}
      </div>
    </div>
  );
}

function InstrumentBillboardCard({ feature, accent }: { feature: InstrumentFeature; accent: string }) {
  const rows = [
    { label: 'Top Ranked', value: feature.topRanked },
    { label: 'Rising Star', value: feature.risingStar },
    { label: 'Most Active', value: feature.mostActive },
  ];

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${accent}33`, background: `linear-gradient(160deg, ${accent}18, rgba(5,5,16,0.94) 62%)`, boxShadow: `0 16px 44px ${accent}24`, padding: 14, minHeight: 205 }}>
      <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 13, fontWeight: 900, color: accent, letterSpacing: '.08em' }}>{feature.label.toUpperCase()}</div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {rows.map((row) => (
          <div key={`${feature.label}-${row.label}`} style={{ borderRadius: 10, background: 'rgba(5,5,16,0.74)', border: `1px solid ${accent}22`, padding: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: '.12em', color: accent, textTransform: 'uppercase', fontWeight: 800 }}>{row.label}</div>
            {row.value ? (
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <div style={{ position: 'relative', width: 40, height: 48, borderRadius: 8, overflow: 'hidden', border: `1px solid ${accent}33` }}>
                  <MotionPosterPlayer
                    isLive={row.value.isLive}
                    liveRoomRoute={undefined}
                    introVideoUrl={row.value.introVideoUrl}
                    motionPosterUrl={row.value.motionPosterUrl}
                    staticImageUrl={row.value.profileImageUrl || '/images/tmi-placeholder.jpg'}
                    alt={row.value.name}
                    audienceCount={row.value.audience ?? undefined}
                    showLiveOverlay={false}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    style={{ background: 'rgba(5,5,16,0.98)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value.name}</div>
                  <div style={{ marginTop: 3, fontSize: 10, color: 'rgba(255,255,255,0.66)' }}>#{row.value.rank} · {typeof row.value.xp === 'number' ? `${row.value.xp.toLocaleString()} XP` : 'XP N/A'}</div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.62)' }}>No ranking data available yet.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const LEFT_SPOTLIGHT_RAIL = [
  { label: 'Top Bands', match: /band|group|ensemble|orchestra/i, route: '/rankings?category=bands' },
  { label: 'Top Choirs', match: /choir/i, route: '/rankings?category=choirs' },
  { label: 'Top Marching Bands', match: /marching/i, route: '/rankings?category=marching-bands' },
  { label: 'Top Dance Crews', match: /dance crew|dance crews|hip hop dance|break|popping|locking/i, route: '/rankings?category=dance-crews' },
  { label: 'Top Streamers', match: /stream|broadcaster|commentator|interviewer|podcast/i, route: '/coming-soon/streamers' },
  { label: 'Top Writers', match: /writer|blog|journalist|editor|critic|news/i, route: '/rankings?category=writers' },
  { label: 'Top Venues', match: /venue|arena|hall|club/i, route: '/venues' },
  { label: 'Top Fans', match: /fan/i, route: '/coming-soon/fans' },
] as const;

const RIGHT_SPOTLIGHT_RAIL = [
  { label: 'Trending Artists', key: 'trending', route: '/rankings' },
  { label: 'Featured Sponsor', key: 'sponsor', route: '/sponsors/advertise' },
  { label: 'Featured Venue', key: 'venue', route: '/venues' },
  { label: 'Diamond Members', key: 'diamond', route: '/rankings?tier=Diamond' },
  { label: 'Active Rooms', key: 'rooms', route: '/live/lobby' },
  { label: 'Top Fans', key: 'fans', route: '/coming-soon/fans' },
  { label: 'New Members', key: 'members', route: '/coming-soon/new-members' },
] as const;

function matchesRailCategory(card: BillboardCard, matcher: RegExp): boolean {
  return matcher.test(`${card.name} ${card.category}`);
}

function DiscoveryAndCategoryRails({
  topRegistry,
  theme,
  liveSessions,
}: {
  topRegistry: BillboardCard[];
  theme: ReturnType<typeof getTheme>;
  liveSessions: LiveSession[];
}) {
  const [leftRailIdx, setLeftRailIdx] = useState(0);
  const [rightRailIdx, setRightRailIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLeftRailIdx((p) => (p + 1) % LEFT_SPOTLIGHT_RAIL.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRightRailIdx((p) => (p + 1) % RIGHT_SPOTLIGHT_RAIL.length), 5000);
    return () => clearInterval(t);
  }, []);

  const leftSpotlight = LEFT_SPOTLIGHT_RAIL[leftRailIdx]!;
  const leftEntries = topRegistry.filter((card) => matchesRailCategory(card, leftSpotlight.match)).slice(0, 5);

  const rightSpotlight = RIGHT_SPOTLIGHT_RAIL[rightRailIdx]!;

  const sponsors = REAL_SPONSORS.slice(0, 4);
  const venues = topRegistry.filter((c) => /venue|arena|hall|club/i.test(c.category)).slice(0, 4);
  const diamonds = topRegistry.filter((c) => c.tier.toLowerCase() === 'diamond').slice(0, 4);
  const liveCards = topRegistry.filter((c) => c.isLive).slice(0, 4);
  const trendingCards = topRegistry.slice(0, 4);

  // New performers: last 6 in registry (simplest proxy until real signup date sorting exists)
  const newPerformers = PERFORMER_REGISTRY.slice().reverse().slice(0, 5);
  // Live now: pull from real GlobalLiveSessionRegistry instead of static isLive flag
  const liveNow = liveSessions.slice(0, 5).map((session) => {
    const performer = getPerformerById(session.userId);
    return {
      id: session.userId,
      name: performer?.name || session.displayName,
      category: performer?.category || session.category,
      profileRoute: performer?.profileRoute || `/performers/${encodeURIComponent(session.userId)}`,
      profileImageUrl: performer?.profileImageUrl || session.thumbnailUrl || '/images/tmi-placeholder.jpg',
      liveRoomRoute: `/live/rooms/${session.roomId}`,
      timeLive: session.startedAt ? `${Math.floor((Date.now() - session.startedAt) / 60000)}m` : '0m',
    };
  });

  const rightEntries = (() => {
    switch (rightSpotlight.key) {
      case 'sponsor':
        return sponsors.map((s) => ({ id: s.id, name: s.name, category: s.tagline || 'Sponsor', profileHref: '/sponsors/advertise', profileImageUrl: '/images/tmi-placeholder.jpg', introVideoUrl: undefined as string | undefined, motionPosterUrl: undefined as string | undefined, isLive: false }));
      case 'venue':
        return venues.map((v) => ({ id: v.id, name: v.name, category: v.category || 'Venue', profileHref: v.profileHref, profileImageUrl: v.profileImageUrl || '/images/tmi-placeholder.jpg', introVideoUrl: v.introVideoUrl, motionPosterUrl: v.motionPosterUrl, isLive: v.isLive }));
      case 'diamond':
        return diamonds.map((d) => ({ id: d.id, name: d.name, category: 'Diamond Member', profileHref: d.profileHref, profileImageUrl: d.profileImageUrl || '/images/tmi-placeholder.jpg', introVideoUrl: d.introVideoUrl, motionPosterUrl: d.motionPosterUrl, isLive: d.isLive }));
      case 'rooms':
        return liveCards.map((c) => ({ id: c.id, name: c.name, category: 'Live Room', profileHref: c.profileHref, profileImageUrl: c.profileImageUrl || '/images/tmi-placeholder.jpg', introVideoUrl: c.introVideoUrl, motionPosterUrl: c.motionPosterUrl, isLive: true }));
      case 'fans':
        return [];
      case 'members':
        return newPerformers.slice(0, 4).map((m) => ({ id: m.id, name: m.name, category: m.category, profileHref: m.profileRoute, profileImageUrl: m.profileImageUrl || '/images/tmi-placeholder.jpg', introVideoUrl: m.introVideoUrl, motionPosterUrl: m.motionPosterUrl, isLive: m.isLive }));
      case 'trending':
      default:
        return trendingCards.map((c) => ({ id: c.id, name: c.name, category: c.category, profileHref: c.profileHref, profileImageUrl: c.profileImageUrl || '/images/tmi-placeholder.jpg', introVideoUrl: c.introVideoUrl, motionPosterUrl: c.motionPosterUrl, isLive: c.isLive }));
    }
  })();

  const railCardStyle = (accent: string): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '44px 1fr',
    gap: 8,
    alignItems: 'center',
    padding: '9px 10px',
    borderRadius: 10,
    background: 'rgba(5,5,16,0.72)',
    border: `1px solid ${accent}22`,
    backdropFilter: 'blur(10px)',
    transition: 'border-color 0.2s, background 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  });

  return (
    <div className="tmi-rail-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: 18, marginBottom: 28, alignItems: 'start' }}>
      {/* ── LEFT RAIL ─────────────────────────────────────────────── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Discovery Feed */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid rgba(0,255,136,0.2)`, background: 'linear-gradient(160deg, rgba(0,255,136,0.06), rgba(5,5,16,0.9))', padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '.22em', color: '#00FF88', fontWeight: 800, marginBottom: 10 }}>🆕 NEW PERFORMERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {newPerformers.length > 0 ? newPerformers.map((p) => (
              <Link key={p.id} href={p.profileRoute} style={railCardStyle('#00FF88')}>
                <div style={{ position: 'relative', width: 44, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,255,136,0.25)' }}>
                  <Image src={p.profileImageUrl || '/images/tmi-placeholder.jpg'} alt={p.name} fill unoptimized style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.category}</div>
                </div>
              </Link>
            )) : (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px 0' }}>No new performers yet.<br />Be the first to join.</div>
            )}
          </div>
          <Link href="/performers" style={{ display: 'block', marginTop: 10, fontSize: 9, textAlign: 'center', color: '#00FF88', letterSpacing: '.12em', fontWeight: 700, textDecoration: 'none' }}>VIEW ALL PERFORMERS →</Link>
        </div>

        {/* Live Now */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid rgba(255,45,170,0.2)`, background: 'linear-gradient(160deg, rgba(255,45,170,0.06), rgba(5,5,16,0.9))', padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '.22em', color: '#FF2DAA', fontWeight: 800, marginBottom: 10 }}>🔴 LIVE NOW</div>
          {liveNow.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {liveNow.map((p) => (
                <Link key={p.id} href={p.liveRoomRoute} style={railCardStyle('#FF2DAA')}>
                  <div style={{ position: 'relative', width: 44, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,45,170,0.35)' }}>
                    <Image src={p.profileImageUrl || '/images/tmi-placeholder.jpg'} alt={p.name} fill unoptimized style={{ objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: '#FF2DAA', animation: 'pulse 1.5s infinite' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: '#FF2DAA', marginTop: 2, fontWeight: 700 }}>LIVE · {p.timeLive ?? ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px 0' }}>No active streams right now.</div>
          )}
          <Link href="/live/rooms" style={{ display: 'block', marginTop: 10, fontSize: 9, textAlign: 'center', color: '#FF2DAA', letterSpacing: '.12em', fontWeight: 700, textDecoration: 'none' }}>ALL LIVE ROOMS →</Link>
        </div>

        {/* Left Spotlight Rail */}
        <div style={{ borderRadius: 16, border: '1px solid rgba(255,215,0,0.2)', background: 'linear-gradient(160deg, rgba(255,215,0,0.06), rgba(5,5,16,0.9))', padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '.22em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>📣 {leftSpotlight.label.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {leftEntries.length > 0 ? leftEntries.map((entry, idx) => (
              <Link key={entry.id} href={entry.profileHref} style={railCardStyle('#FFD700')}>
                <div style={{ width: 44, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,215,0,0.25)' }}>
                  <MotionPosterPlayer
                    isLive={entry.isLive}
                    liveRoomRoute={undefined}
                    introVideoUrl={entry.introVideoUrl}
                    motionPosterUrl={entry.motionPosterUrl}
                    staticImageUrl={entry.profileImageUrl || '/images/tmi-placeholder.jpg'}
                    alt={entry.name}
                    audienceCount={undefined}
                    showLiveOverlay={false}
                    width="100%"
                    height="100%"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 10, fontWeight: 900, color: '#FFD700' }}>#{idx + 1}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{entry.category}</div>
                </div>
              </Link>
            )) : (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', textAlign: 'center', padding: '16px 0', lineHeight: 1.6 }}>
                No members yet in {leftSpotlight.label}.<br />
                <Link href={leftSpotlight.route} style={{ color: '#FFD700', fontWeight: 800, textDecoration: 'none', fontSize: 10 }}>Explore Category →</Link>
              </div>
            )}
          </div>
          <Link href={leftSpotlight.route} style={{ display: 'block', marginTop: 10, fontSize: 9, textAlign: 'center', color: '#FFD700', letterSpacing: '.12em', fontWeight: 700, textDecoration: 'none' }}>SEE ALL {leftSpotlight.label.replace('Top ', '').toUpperCase()} →</Link>
        </div>
      </aside>

      {/* ── CENTER: Feature Spread placeholder column (content handled below) ─── */}
      <div style={{ minHeight: 200 }} />

      {/* ── RIGHT RAIL ────────────────────────────────────────────── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${theme.accent}22`, background: `linear-gradient(160deg, ${theme.accent}07, rgba(5,5,16,0.9))`, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: '.22em', color: theme.accent, fontWeight: 800 }}>{rightSpotlight.label.toUpperCase()}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em' }}>Auto cycling</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {rightEntries.length > 0 ? rightEntries.map((entry, idx) => (
              <Link key={entry.id} href={entry.profileHref} style={railCardStyle(theme.accent)}>
                <div style={{ width: 44, height: 52, borderRadius: 8, overflow: 'hidden', border: `1px solid ${theme.accent}25` }}>
                  <MotionPosterPlayer
                    isLive={entry.isLive}
                    liveRoomRoute={undefined}
                    introVideoUrl={entry.introVideoUrl}
                    motionPosterUrl={entry.motionPosterUrl}
                    staticImageUrl={entry.profileImageUrl || '/images/tmi-placeholder.jpg'}
                    alt={entry.name}
                    audienceCount={undefined}
                    showLiveOverlay={false}
                    width="100%"
                    height="100%"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 10, fontWeight: 900, color: theme.accent }}>#{idx + 1}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{entry.category}</div>
                </div>
              </Link>
            )) : (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', textAlign: 'center', padding: '16px 0', lineHeight: 1.6 }}>
                Be the first in {rightSpotlight.label} on TMI.<br />
                <Link href={rightSpotlight.route} style={{ color: theme.accent, fontWeight: 800, textDecoration: 'none', fontSize: 10 }}>Explore →</Link>
              </div>
            )}
          </div>
          <Link href={rightSpotlight.route} style={{ display: 'block', marginTop: 10, fontSize: 9, textAlign: 'center', color: theme.accent, letterSpacing: '.12em', fontWeight: 700, textDecoration: 'none' }}>SEE ALL {rightSpotlight.label.toUpperCase()} →</Link>
        </div>

        {/* Quick links */}
        <div style={{ borderRadius: 16, border: '1px solid rgba(170,45,255,0.2)', background: 'rgba(5,5,16,0.7)', padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '.22em', color: '#AA2DFF', fontWeight: 800, marginBottom: 10 }}>🏆 QUICK LINKS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Rankings', href: '/rankings', color: '#AA2DFF' },
              { label: 'Live Battles', href: '/battles', color: '#FF2DAA' },
              { label: 'Cyphers', href: '/cyphers', color: '#00FFFF' },
              { label: 'Beat Marketplace', href: '/marketplace', color: '#FFD700' },
              { label: 'Join Live Room', href: '/live/rooms', color: '#00FF88' },
              { label: 'Advertise With Us', href: '/sponsors/advertise', color: '#FF6B35' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: `${link.color}0a`, border: `1px solid ${link.color}22`, color: link.color, textDecoration: 'none', fontSize: 11, fontWeight: 700, transition: 'background 0.2s' }}>
                {link.label}
                <span style={{ fontSize: 9 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<BillboardCard[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [boardPageIndex, setBoardPageIndex] = useState(0);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  const advanceCat = useCallback((dir: 1 | -1) => {
    setTransitioning(true);
    setTimeout(() => {
      setCatIndex((prev) => (prev + dir + GENRE_FILTERS.length) % GENRE_FILTERS.length);
      setTransitioning(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => advanceCat(1), 8000);
    return () => clearInterval(timer);
  }, [isPaused, advanceCat]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setBoardPageIndex((prev) => prev + 1), 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentCategory = GENRE_FILTERS[catIndex]!;
  const theme = getTheme(catIndex);
  const genreTheme = getGenreTheme(currentCategory, theme);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await fetchTrendingArtists(12);
      if (!alive) return;
      setItems(mapTrending(currentCategory, rows));
    })();
    return () => {
      alive = false;
    };
  }, [currentCategory]);

  // Subscribe to live session changes for real-time "LIVE NOW" rail
  useEffect(() => {
    setLiveSessions(getActiveSessions());
    const unsubscribe = onSessionsChanged((sessions) => {
      setLiveSessions(sessions);
    });
    return unsubscribe;
  }, []);

  const latestNews = getLatestEditorialArticles(5);
  const tickerStr = latestNews.map((article) => `[${article.category.toUpperCase()}] ${article.headline}`).join('  ⚡  ');

  const topRegistry = getTopPerformers(100).map((performer, index): BillboardCard => ({
    id: performer.id,
    name: performer.name,
    profileImageUrl: performer.profileImageUrl,
    category: performer.category,
    rank: index + 1,
    xp: performer.xp,
    votes: null,
    audience: performer.audienceCount,
    tips: null,
    engagement: performer.likes,
    challengesWon: null,
    battlesWon: null,
    cyphersWon: null,
    achievements: performer.achievementIds?.length ?? null,
    isLive: performer.isLive,
    tier: performer.tier,
    profileHref: `/performers/${encodeURIComponent(performer.slug)}`,
    introVideoUrl: performer.introVideoUrl,
    motionPosterUrl: performer.motionPosterUrl,
  }));

  const trendingPerformers = items.filter((item) => !currentCategory || item.category.toLowerCase().includes(currentCategory.toLowerCase()));

  const genreBoards: BoardView[] = GENRE_FILTERS.map((label) => ({
    label,
    entries: topRegistry.filter((card) => card.category.toLowerCase().includes(label.toLowerCase())).slice(0, 9),
  }));

  const categoryBoards: BoardView[] = PERFORMANCE_CATEGORIES.map((label) => ({
    label,
    entries: topRegistry.filter((card) => matchesRankingCategory(card, label)).slice(0, 9),
  }));

  const instrumentBoards: BoardView[] = GLOBAL_INSTRUMENT_INDEX.map((label) => ({
    label,
    entries: topRegistry.filter((card) => card.category.toLowerCase().includes(label.toLowerCase())).slice(0, 6),
  }));

  const bestOfTmiBoards: BoardView[] = BEST_OF_TMI_LANES.map((lane) => ({
    label: lane.label,
    entries: topRegistry.filter((card) => matchesBestOfLane(card, lane.label) && hasRealProfileImage(card.profileImageUrl)).slice(0, 10),
  }));

  const featureSpread = [
    { title: 'TOP HIP HOP ARTISTS', kicker: 'Magazine Cover', item: genreBoards.find((board) => board.label === 'Hip Hop')?.entries[0] ?? null, theme: getGenreTheme('Hip Hop', theme) },
    { title: 'TOP PRODUCERS', kicker: 'Studio Power', item: categoryBoards.find((board) => board.label === 'Producers')?.entries[0] ?? null, theme: getGenreTheme('EDM', theme) },
    { title: 'TOP COMEDIANS', kicker: 'Crowd Control', item: categoryBoards.find((board) => board.label === 'Comedians')?.entries[0] ?? null, theme: getGenreTheme('Rock', theme) },
    { title: 'TOP DJS', kicker: 'Night Signal', item: categoryBoards.find((board) => board.label === 'DJs')?.entries[0] ?? null, theme: getGenreTheme('EDM', theme) },
    { title: 'TOP WRITERS', kicker: 'Editorial Heat', item: categoryBoards.find((board) => board.label === 'Writers')?.entries[0] ?? null, theme: getGenreTheme('Jazz', theme) },
    { title: 'TOP VENUES', kicker: 'Stage Authority', item: categoryBoards.find((board) => board.label === 'Venues')?.entries[0] ?? null, theme: getGenreTheme('Country', theme) },
    { title: 'TOP PROMOTERS', kicker: 'Street Pulse', item: categoryBoards.find((board) => board.label === 'Promoters')?.entries[0] ?? null, theme: getGenreTheme('Latin', theme) },
    { title: 'TOP ADVERTISERS', kicker: 'Revenue Spotlight', item: categoryBoards.find((board) => board.label === 'Advertisers')?.entries[0] ?? null, theme: getGenreTheme('Classical', theme) },
  ];

  const instrumentFeatures: InstrumentFeature[] = instrumentBoards.map((board) => ({
    label: board.label,
    topRanked: board.entries[0] ?? null,
    risingStar: board.entries[1] ?? null,
    mostActive: board.entries.slice().sort((left, right) => (right.audience ?? -1) - (left.audience ?? -1))[0] ?? null,
  }));

  return (
    <main style={{ background: '#050510', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      <DesktopAtmosphereRails />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(5,5,16,.9)', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 900, color: theme.accent, transition: 'color 0.5s', textShadow: `0 0 12px ${theme.glow}` }}>
          TMI BILLBOARD WORLD
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['1', '1-2', '2', '3', '4', '5'].map((item) => (
            <Link key={item} href={`/home/${item}`} style={{ padding: '5px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '.05em', background: item === '1-2' ? `${theme.accent}20` : 'transparent', color: item === '1-2' ? theme.accent : 'rgba(255,255,255,.45)', border: `1px solid ${item === '1-2' ? theme.accent : 'rgba(255,255,255,.1)'}` }}>
              {item}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, overflow: 'hidden', background: 'rgba(0,0,0,.6)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '5px 0' }}>
        <div style={{ display: 'inline-flex', gap: 60, whiteSpace: 'nowrap', paddingLeft: 40, animation: 'scrollLeft 38s linear infinite', fontSize: 10, color: 'rgba(255,255,255,.55)' }}>
          {tickerStr}&nbsp;&nbsp;⚡&nbsp;&nbsp;TMI BILLBOARD WORLD — {GENRE_FILTERS.length} FILTERS&nbsp;&nbsp;⚡&nbsp;&nbsp;GLOBAL RANKINGS LIVE
          &nbsp;&nbsp;&nbsp;&nbsp;
          {tickerStr}&nbsp;&nbsp;⚡&nbsp;&nbsp;TMI BILLBOARD WORLD — {GENRE_FILTERS.length} FILTERS&nbsp;&nbsp;⚡&nbsp;&nbsp;GLOBAL RANKINGS LIVE
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        @keyframes billboardSlideUp { 0% { opacity: 0; transform: translateY(28px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes billboardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes billboardSpark { 0% { transform: translateY(0) scale(0.9); opacity: 0; } 30% { opacity: 0.8; } 100% { transform: translateY(-28px) scale(1.05); opacity: 0; } }
        @media (max-width: 768px) {
          .tmi-billboard-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .tmi-hero-split {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .tmi-hero-cover {
            min-height: 260px !important;
          }
        }
        @media (max-width: 520px) {
          .tmi-billboard-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .tmi-rail-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 520px) {
          .tmi-rail-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <SponsorRail sponsors={REAL_SPONSORS} zone="home-1-2-top" />
      </div>

      <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto', padding: '26px 24px 8px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 26, padding: '28px 26px 30px', background: genreTheme.surface, border: `1px solid ${genreTheme.accent}33`, boxShadow: `0 30px 100px ${genreTheme.glow}` }}>
          <div style={{ position: 'absolute', inset: 0, background: genreTheme.spotlight, pointerEvents: 'none' }} />
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: genreTheme.accent, top: `${18 + index * 12}%`, left: `${12 + (index % 3) * 27}%`, opacity: 0.32, filter: 'blur(0.5px)', animation: `billboardSpark ${4 + index * 0.35}s ease-in-out infinite`, animationDelay: `${index * 0.45}s` }} />
          ))}
          <div className="tmi-hero-split" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(340px, 0.9fr)', gap: 22, alignItems: 'stretch' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.34em', color: genreTheme.accent, fontWeight: 800 }}>BILLBOARD WORLD</div>
              <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, letterSpacing: '.06em', marginTop: 10, textShadow: `0 0 24px ${genreTheme.glow}` }}>
                BEST OF TMI BILLBOARD WORLD
              </div>
              <div style={{ marginTop: 14, maxWidth: 620, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
                Home 1-2 is the Best of Everything surface: best newcomers, rising stars, most improved, community awards, venue winners, competition highlights, and editorial standouts.
              </div>
              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Spotlight Color', value: currentCategory },
                  { label: 'Cycle Rate', value: 'Every 5 seconds' },
                  { label: 'Rank History', value: 'Honest when unavailable' },
                ].map((stat) => (
                  <div key={stat.label} style={{ borderRadius: 14, background: 'rgba(5,5,16,0.62)', border: `1px solid ${genreTheme.accent}22`, padding: '12px 14px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: 9, letterSpacing: '.18em', color: genreTheme.accent, textTransform: 'uppercase', fontWeight: 800 }}>{stat.label}</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800 }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="tmi-hero-cover" style={{ position: 'relative', minHeight: 320, borderRadius: 22, overflow: 'hidden', border: `1px solid ${genreTheme.accent}33`, background: 'rgba(5,5,16,0.94)', backdropFilter: 'blur(12px)' }}>
              <div style={{ position: 'absolute', inset: 0, animation: 'billboardFloat 6s ease-in-out infinite', background: 'rgba(5,5,16,0.98)' }}>
                {trendingPerformers[0] ? (
                  <MotionPosterPlayer
                    isLive={trendingPerformers[0].isLive}
                    liveRoomRoute={undefined}
                    introVideoUrl={trendingPerformers[0].introVideoUrl}
                    motionPosterUrl={trendingPerformers[0].motionPosterUrl}
                    staticImageUrl={trendingPerformers[0].profileImageUrl || '/images/tmi-placeholder.jpg'}
                    alt={trendingPerformers[0].name}
                    audienceCount={trendingPerformers[0].audience ?? undefined}
                    showLiveOverlay={false}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    No ranked performer yet
                  </div>
                )}
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,16,0.05), rgba(5,5,16,0.92))', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ background: `${genreTheme.accent}e6`, color: '#050510', fontWeight: 900, borderRadius: 999, padding: '6px 10px', fontSize: 12, letterSpacing: '.08em' }}>FEATURE COVER</div>
                  <div style={{ background: 'rgba(5,5,16,0.72)', color: '#fff', borderRadius: 999, padding: '6px 10px', fontSize: 10, letterSpacing: '.12em', border: `1px solid ${genreTheme.accent}33` }}>#{trendingPerformers[0]?.rank ?? '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.28em', color: genreTheme.accent, fontWeight: 800 }}>BEST OF TMI COVER STAR</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-orbitron, monospace)', fontSize: 28, fontWeight: 900 }}>{trendingPerformers[0]?.name ?? 'No ranked performer yet'}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{trendingPerformers[0]?.category ?? currentCategory}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, paddingTop: 28 }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.3em', color: theme.accent, fontWeight: 800, marginBottom: 4 }}>GLOBAL BILLBOARD — BEST OF TMI</div>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 'clamp(13px,2.5vw,20px)', fontWeight: 900, color: '#fff', letterSpacing: '.06em', textShadow: `0 0 16px ${theme.glow}` }}>BEST OF TMI CATEGORIES</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => advanceCat(-1)} style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '7px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '.1em' }}>‹ PREV</button>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(12px,2.5vw,18px)', fontWeight: 900, color: theme.accent, textShadow: `0 0 18px ${theme.glow}`, letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .4s' }}>[{currentCategory}]</span>
            <button onClick={() => advanceCat(1)} style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '7px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '.1em' }}>NEXT ›</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap', padding: '0 24px 20px', maxWidth: 1400, margin: '0 auto' }}>
          {GENRE_FILTERS.map((category, index) => (
            <button
              key={category}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => {
                  setCatIndex(index);
                  setTransitioning(false);
                }, 150);
              }}
              style={{ background: index === catIndex ? `${theme.accent}22` : 'transparent', border: `1px solid ${index === catIndex ? theme.accent : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, color: index === catIndex ? theme.accent : 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: index === catIndex ? 800 : 500, padding: '4px 10px', cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'all .2s' }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="tmi-billboard-grid" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(22px)' : 'translateY(0)', transition: 'opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.25,1,0.5,1)' }}>
          {trendingPerformers.length > 0 ? trendingPerformers.map((item) => (
            <div key={item.id} style={{ textDecoration: 'none' }} aria-label={`Open performer ${item.name}`}>
              <BillboardPortraitCard item={item} theme={theme} />
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', border: `1px dashed ${theme.accent}66`, borderRadius: 10, padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.68)' }}>
              No ranking data for {currentCategory} yet. Check back after more activity.
            </div>
          )}
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 34px' }}>
          {/* ── DISCOVERY + CATEGORY RAILS (Left / Right) ──────────────────────── */}
          <DiscoveryAndCategoryRails topRegistry={topRegistry} theme={theme} liveSessions={liveSessions} />

          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.22em', color: '#fff', marginBottom: 14 }}>MAGAZINE FEATURE SPREAD</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
            {featureSpread.map((feature) => (
              <BillboardFeatureCard key={feature.title} title={feature.title} item={feature.item} theme={feature.theme} kicker={feature.kicker} />
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.12em', color: '#00FF88', marginBottom: 10 }}>BEST OF TMI — AWARDS LANES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14, marginBottom: 22 }}>
            {bestOfTmiBoards.map((board, index) => (
              <BillboardCycleBoard key={board.label} board={board} theme={getGenreTheme(GENRE_FILTERS[index % GENRE_FILTERS.length]!, theme)} pageIndex={boardPageIndex} />
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.12em', color: '#00FF88', marginBottom: 10 }}>GENRE LEADERBOARDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14, marginBottom: 22 }}>
            {genreBoards.map((board) => (
              <BillboardCycleBoard key={board.label} board={board} theme={getGenreTheme(board.label, theme)} pageIndex={boardPageIndex} />
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.12em', color: '#FFD700', marginBottom: 10 }}>PERFORMANCE CATEGORY LEADERBOARDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {categoryBoards.map((board, index) => (
              <BillboardCycleBoard key={board.label} board={board} theme={getGenreTheme(GENRE_FILTERS[index % GENRE_FILTERS.length]!, theme)} pageIndex={boardPageIndex} />
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 36px' }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.12em', color: '#00FFFF', marginBottom: 10 }}>GLOBAL INSTRUMENT INDEX</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {instrumentFeatures.map((feature, index) => (
              <InstrumentBillboardCard key={feature.label} feature={feature} accent={CAT_THEMES[index % CAT_THEMES.length]!.accent} />
            ))}
          </div>
        </div>
      </div>

      {/* ── OPEN BOOK SPREAD — genre pairs rotating every 8s, real registry data ── */}
      <BillboardOpenBookSpread />

      {/* ── CROWN SEQUENCE — rise/settle/crown/exit for #1 per category ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto' }}>
        <BillboardCrownSequence />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto' }}>
        <UnifiedAdSlot venue="home-1-2" slotKey="homepageMid" format="rectangle" label="ADVERTISEMENT" style={{ margin: '0 24px 24px', minHeight: 250 }} accentColor={theme.accent} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <DiscoveryRail type="performers" label="🌐 GLOBAL DISCOVERY GRID" accentColor="#00FFFF" enableLiveStatus={false} />
        <DiscoveryRail type="articles" label="📰 TRENDING ARTICLES" accentColor="#FF2DAA" />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <EventReel zone="home-1-2" />
      </div>
    </main>
  );
}
