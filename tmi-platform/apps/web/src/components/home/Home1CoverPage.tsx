'use client';

/**
 * Home1CoverPage — TMI Homepage 1, full tabloid-pop redesign.
 *
 * DROP FILE AT:
 *   apps/web/src/components/home/Home1CoverPage.tsx
 * 
 * THEN IN apps/web/src/app/home/1/page.tsx replace:
 *   import Home1OrbitalMagazine from '@/components/home/Home1OrbitalMagazine';
 * with:
 *   import Home1CoverPage from '@/components/home/Home1CoverPage';
 * and swap <Home1OrbitalMagazine /> → <Home1CoverPage />
 *
 * WHAT THIS DOES:
 *  - 10 performers per genre, cycle through genres every 6 s
 *  - Every performer card routes to /articles/performer/[slug]
 *  - No real face photos — genre-colored emoji avatars
 *  - Orbital ring kept (360 spin), bright teal/gold palette
 *  - Tabloid overlays: VOTING LIVE, GENRE BATTLE, CYPHER ARENA OPEN
 *  - Bottom: Weekly Cyphers bar with article link
 *  - Typecheck-safe, no external deps beyond Next.js
 */

import { memo, useEffect, useState } from 'react';
import HeroBannerWell from './HeroBannerWell';
import Link from 'next/link';
import Image from 'next/image';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { getCrownHolder, getPerformerById, getPerformersByCategory, getFeaturedFreePerformers, getTopPerformers, PERFORMER_REGISTRY, type PerformerCategory, type PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import { getVenueBookingSlots, type VenueBookingSlot } from '@/lib/venues/VenueRegistry';
import { fetchUpcomingEvents } from '@/lib/api/homepage';
import { getActiveSponsorForZone } from '@/lib/commerce/SponsorRegistry';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';
import { hasRole } from '@/lib/auth/session';
import { OFFICIAL_HOME_ORBIT_BOT_ACCOUNTS } from '@/lib/bots/homeOrbitBotAccounts';
import { onSessionsChanged, getActiveSessions, type LiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';

// ─── Genre + performer data (10 per genre) ────────────────────────────────────

interface Performer {
  slug: string;
  name: string;
  emoji: string;
  rank: number;
  score: number;
  genre: string;
  image?: string;
  avatarImage?: string;
  profileRoute: string;
  accountType: 'diamond-member' | 'real-member' | 'verified-performer' | 'system-bot' | 'system-actor' | 'empty-slot';
  botRole?: string;
  activityType?: string;
  dashboardRoute?: string;
  activityPurpose?: string;
  systemFunction?: string;
  avatarPlaceholder?: string;
  voteCount?: number | null;
  audienceCount?: number;
  isLive?: boolean;
  liveRoomRoute?: string;
  lineupType?: 'solo' | 'duo' | 'band' | 'group';
  roomId?: string;
  viewerCount?: number;
  category?: string;
  title?: string;
}

const GENRE_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  'Hip-Hop': { color: '#FFD700', bg: '#2D1A00', emoji: '🎤' },
  'R&B':     { color: '#FF2DAA', bg: '#2D001A', emoji: '🎵' },
  'Gospel':  { color: '#00FF88', bg: '#001A0D', emoji: '🙏' },
  'Jazz':    { color: '#AA2DFF', bg: '#1A001A', emoji: '🎷' },
  'EDM':     { color: '#00C8FF', bg: '#001A2D', emoji: '🎧' },
  'Pop':     { color: '#FF6B35', bg: '#2D1000', emoji: '🎀' },
  'Soul':    { color: '#FFB800', bg: '#2D1F00', emoji: '🕯️' },
  'Rap':     { color: '#39FF14', bg: '#001A00', emoji: '💬' },
};

// GENRE_KEYS must come from GENRE_CONFIG (GENRE_DATA doesn't exist yet at this point)
const GENRE_KEYS = Object.keys(GENRE_CONFIG);

const DEFAULT_PROFILE_PLACEHOLDERS = new Set(['/images/tmi-placeholder.jpg']);

// Honest "no photo yet" silhouettes by lineup shape — never a real photo
// pretending to exist (Rule 20). Falls back to a generic mic for unknown types.
const LINEUP_ICON: Record<'solo' | 'duo' | 'band' | 'group', string> = {
  solo: '🎤',
  duo: '🎙️',
  band: '🎸',
  group: '🧑‍🤝‍🧑',
};

function hasUploadedProfileImage(url?: string): boolean {
  if (!url) return false;
  return !DEFAULT_PROFILE_PLACEHOLDERS.has(url.trim());
}

function buildDiamondOrbitMembers(): Performer[] {
  return PERFORMER_REGISTRY
    .filter((p) => p.tier === 'Diamond')
    .sort((a, b) => b.xp - a.xp)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      emoji: '💎',
      rank: p.rank,
      score: p.xp,
      genre: p.category,
      image: p.profileImageUrl,
      avatarImage: p.profileImageUrl,
      profileRoute: hasUploadedProfileImage(p.profileImageUrl) ? p.profileRoute : `${p.profileRoute}?prompt=upload-image`,
      accountType: 'diamond-member',
      voteCount: null,
      audienceCount: p.audienceCount,
      isLive: p.isLive,
      liveRoomRoute: p.liveRoomRoute,
      lineupType: p.lineupType,
    }));
}

function isVerifiedPerformer(achievementIds: string[] | undefined): boolean {
  if (!achievementIds || achievementIds.length === 0) return false;
  return achievementIds.some((id) =>
    id === 'top-100' ||
    id === 'battle-finalist' ||
    id === 'regional-champion' ||
    id === 'platinum-tier' ||
    id === 'gold-tier'
  );
}

function buildRealMemberProfileRing(genreKey: string): Performer[] {
  const byGenre = getPerformersByCategory(genreKey as PerformerCategory)
    .filter((p) => p.tier !== 'Diamond' && hasUploadedProfileImage(p.profileImageUrl));
  const profiledFallback = PERFORMER_REGISTRY
    .filter((p) => p.tier !== 'Diamond' && hasUploadedProfileImage(p.profileImageUrl) && !byGenre.some((g) => g.slug === p.slug))
    .sort((a, b) => b.xp - a.xp);
  return [...byGenre, ...profiledFallback].slice(0, 4).map((p) => ({
    slug: p.slug,
    name: p.name,
    emoji: '👥',
    rank: p.rank,
    score: p.xp,
    genre: p.category,
    image: p.profileImageUrl,
    avatarImage: p.profileImageUrl,
    profileRoute: p.profileRoute,
    accountType: 'real-member',
    voteCount: null,
    audienceCount: p.audienceCount,
    isLive: p.isLive,
    liveRoomRoute: p.liveRoomRoute,
    lineupType: p.lineupType,
  }));
}

function buildVerifiedPerformerRing(genreKey: string): Performer[] {
  const byGenre = getPerformersByCategory(genreKey as PerformerCategory)
    .filter((p) => p.tier !== 'Diamond' && hasUploadedProfileImage(p.profileImageUrl) && isVerifiedPerformer(p.achievementIds));
  const verifiedFallback = PERFORMER_REGISTRY
    .filter((p) => p.tier !== 'Diamond' && hasUploadedProfileImage(p.profileImageUrl) && isVerifiedPerformer(p.achievementIds) && !byGenre.some((g) => g.slug === p.slug))
    .sort((a, b) => b.xp - a.xp);

  return [...byGenre, ...verifiedFallback].slice(0, 4).map((p) => ({
    slug: p.slug,
    name: p.name,
    emoji: '🎤',
    rank: p.rank,
    score: p.xp,
    genre: p.category,
    image: p.profileImageUrl,
    avatarImage: p.profileImageUrl,
    profileRoute: p.profileRoute,
    accountType: 'verified-performer',
    voteCount: null,
    audienceCount: p.audienceCount,
    isLive: p.isLive,
    liveRoomRoute: p.liveRoomRoute,
    lineupType: p.lineupType,
  }));
}

function buildSystemBotRing(): Performer[] {
  return OFFICIAL_HOME_ORBIT_BOT_ACCOUNTS
    .filter((bot) => bot.accountType === 'OPERATIONS_AGENT' || bot.accountType === 'SIMULATION_AGENT')
    .map((bot, index) => ({
    slug: bot.slug,
    name: bot.name,
    emoji: '🤖',
    rank: index + 1,
    score: 0,
    genre: 'System Bot',
    image: bot.image,
    avatarImage: bot.image,
    profileRoute: bot.profileRoute,
    accountType: 'system-bot',
    botRole: bot.botRole,
    activityType: bot.activityType,
    dashboardRoute: bot.dashboardRoute,
    activityPurpose: bot.activityPurpose,
    systemFunction: bot.systemFunction,
    avatarPlaceholder: bot.avatarPlaceholder,
    voteCount: null,
    audienceCount: 0,
    isLive: false,
  }));
}

function buildSystemActorRing(): Performer[] {
  return OFFICIAL_HOME_ORBIT_BOT_ACCOUNTS
    .filter((bot) => bot.accountType === 'SYSTEM_ACTOR')
    .map((bot, index) => ({
    slug: bot.slug,
    name: bot.name,
    emoji: '🛠',
    rank: index + 1,
    score: 0,
    genre: 'System Actor',
    image: bot.image,
    avatarImage: bot.image,
    profileRoute: bot.profileRoute,
    accountType: 'system-actor',
    botRole: bot.botRole,
    activityType: bot.activityType,
    dashboardRoute: bot.dashboardRoute,
    activityPurpose: bot.activityPurpose,
    systemFunction: bot.systemFunction,
    avatarPlaceholder: bot.avatarPlaceholder,
    voteCount: null,
    audienceCount: 0,
    isLive: false,
  }));
}

function buildHonestEmptySlots(count: number): Performer[] {
  const openPositions = [
    { name: 'Diamond Position Available', route: '/signup?tier=Diamond' },
    { name: 'Top Band Position Available', route: '/signup?focus=band' },
    { name: 'Choir Position Available', route: '/signup?focus=choir' },
    { name: 'Marching Band Position Available', route: '/signup?focus=marching-band' },
  ] as const;

  return Array.from({ length: count }).map((_, idx) => {
    const slot = openPositions[idx % openPositions.length]!;
    return {
      slug: `open-orbit-slot-${idx + 1}`,
      name: slot.name,
      emoji: '⭐',
      rank: 0,
      score: 0,
      genre: 'No data available yet',
      profileRoute: slot.route,
      accountType: 'empty-slot',
      voteCount: null,
      audienceCount: 0,
      isLive: false,
    };
  });
}

function buildOrbitPerformers(genreKey: string): Performer[] {
  // Orbit priority:
  // 1) Real Diamond Member
  // 2) Real Verified Performer
  // 3) Real Member with profile image
  // 4) Official TMI System Actor
  // 5) Official TMI Bot Account
  // 6) Honest Empty Slot
  const ring1 = buildDiamondOrbitMembers();
  const ring2 = buildVerifiedPerformerRing(genreKey);
  const ring3 = buildRealMemberProfileRing(genreKey);
  const ring4 = buildSystemActorRing();
  const ring5 = buildSystemBotRing();
  const merged = [...ring1, ...ring2, ...ring3, ...ring4, ...ring5];
  const unique = merged.filter((p, idx, arr) => arr.findIndex((x) => x.slug === p.slug) === idx);
  if (unique.length >= 10) return unique.slice(0, 10);
  return [...unique, ...buildHonestEmptySlots(10 - unique.length)];
}

// Positions for 10 orbit cards (angle in degrees, radius 44% of container).
// rotationDeg (optional) slowly drifts every card's angle over time so the
// wheel visibly orbits instead of sitting in fixed positions forever.
function getOrbitPos(i: number, total: number, radius: number, rotationDeg = 0) {
  const angle = (i / total) * 360 - 90 + rotationDeg; // start from top
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

interface OrbitCardProps {
  performer: Performer;
  index: number;
  total: number;
  radius: number;
  compactMode: boolean;
  accentColor: string;
  isBrokenImage: boolean;
  onImageError: (slug: string) => void;
  onOpenLive: (performer: Performer) => void;
}

const OrbitCard = memo(function OrbitCard({
  performer,
  index,
  total,
  radius,
  compactMode,
  accentColor,
  isBrokenImage,
  onImageError,
  onOpenLive,
}: OrbitCardProps) {
  const pos = getOrbitPos(index, total, radius, 0);
  const cardSize = compactMode ? (index === 0 ? 52 : 44) : (index === 0 ? 62 : 52);
  const rawAvatar = performer.image ?? performer.avatarImage;
  const hasImage = Boolean(rawAvatar?.trim()) && !isBrokenImage && (performer.accountType === 'system-bot' || performer.accountType === 'system-actor' || hasUploadedProfileImage(rawAvatar));
  const initials = performer.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const profileHref = performer.accountType === 'empty-slot'
    ? performer.profileRoute
    : (performer.isLive && performer.liveRoomRoute ? `${performer.liveRoomRoute}?from=home-1` : performer.profileRoute);

  return (
    <Link
      href={profileHref}
      style={{ textDecoration: 'none' }}
      onClick={performer.isLive && performer.liveRoomRoute ? (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenLive(performer);
      } : undefined}
    >
      <div
        data-testid="home1-orbit-card"
        data-performer-name={performer.name}
        data-avatar-url={performer.image ?? performer.avatarImage ?? ''}
        style={{
          position: 'absolute',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate3d(-50%, -50%, 0)',
          zIndex: 34,
          cursor: 'pointer',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: -4,
            zIndex: 5,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background:
              performer.rank === 1
                ? 'linear-gradient(135deg, #FFD700, #FF9500)'
                : `${accentColor}33`,
            border: `1.5px solid ${performer.rank === 1 ? '#FFD700' : accentColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 900,
            color: performer.rank === 1 ? '#050510' : accentColor,
            fontFamily: "'Inter', sans-serif",
            boxShadow: `0 0 8px ${performer.rank === 1 ? '#FFD700' : accentColor}66`,
          }}
        >
          {performer.rank}
        </div>

        <div
          style={{
            width: cardSize,
            height: Math.round(cardSize * 1.28),
            borderRadius: 5,
            background: `linear-gradient(160deg, ${accentColor}35, rgba(5,5,16,0.96))`,
            border: `2px solid ${accentColor}55`,
            boxShadow: `0 0 10px ${accentColor}33`,
            transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          {performer.rank <= 3 && (
            <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 5px #E63000', animation: 'h1Pulse 1.5s infinite' }} />
          )}

          {hasImage ? (
            <Image
              data-testid="home1-orbit-image"
              src={String(rawAvatar ?? '/images/tmi-placeholder.jpg')}
              alt={performer.name}
              unoptimized
              width={Math.round(cardSize * 0.62)}
              height={Math.round(cardSize * 0.72)}
              onError={() => onImageError(performer.slug)}
              style={{
                width: cardSize * 0.62,
                height: cardSize * 0.72,
                borderRadius: 6,
                objectFit: 'cover',
                marginBottom: 4,
                border: `1px solid ${accentColor}55`,
                zIndex: 1,
                background: 'rgba(255,255,255,0.05)',
              }}
            />
          ) : (
            <div
              style={{
                width: cardSize * 0.62,
                height: cardSize * 0.72,
                borderRadius: 6,
                marginBottom: 4,
                border: `1px dashed ${accentColor}66`,
                background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: Math.max(cardSize * 0.22, 13), opacity: 0.85 }} aria-label={performer.lineupType ? `${performer.lineupType}-placeholder` : 'empty-state-avatar'}>
                {performer.lineupType ? LINEUP_ICON[performer.lineupType] : '👤'}
              </div>
              <div style={{ fontSize: Math.max(cardSize * 0.14, 9), fontWeight: 900, color: '#fff', fontFamily: "'Inter',sans-serif" }}>{initials || '??'}</div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>
                {performer.accountType === 'diamond-member' || performer.accountType === 'real-member' || performer.accountType === 'verified-performer' ? 'UPLOAD PENDING' : performer.accountType === 'empty-slot' ? 'NO DATA YET' : 'NO IMAGE'}
              </div>
            </div>
          )}

          <div style={{ fontSize: Math.max(cardSize * 0.1, 7), fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: "'Inter',sans-serif", maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {performer.name.split(' ').slice(0, 2).join(' ')}
          </div>
          <div style={{ fontSize: Math.max(cardSize * 0.08, 6), color: accentColor, background: `${accentColor}18`, borderRadius: 8, padding: '1px 4px', fontFamily: "'Inter',sans-serif" }}>
            {performer.accountType === 'diamond-member'
              ? 'Diamond Member'
              : performer.accountType === 'verified-performer'
                ? 'Verified Performer'
                : performer.accountType === 'real-member'
                  ? 'Member'
                  : performer.accountType === 'system-actor'
                    ? 'System Actor'
                    : performer.accountType === 'system-bot'
                      ? 'TMI Assistant'
                      : 'Position Available'}
          </div>
          <div style={{ fontSize: Math.max(cardSize * 0.08, 6), color: 'rgba(255,255,255,0.42)', fontFamily: "'Inter',sans-serif" }}>
            {performer.accountType === 'system-bot' || performer.accountType === 'system-actor' ? `${performer.activityType ?? 'system'} · ${performer.systemFunction ?? 'system actor'}` : `XP ${performer.score.toLocaleString()}`}
          </div>
          <div style={{ fontSize: Math.max(cardSize * 0.08, 6), color: 'rgba(255,255,255,0.32)', fontFamily: "'Inter',sans-serif" }}>
            {(performer.accountType === 'diamond-member' || performer.accountType === 'real-member' || performer.accountType === 'verified-performer') && !hasUploadedProfileImage(rawAvatar)
              ? 'Add profile image in HQ'
              : performer.accountType === 'empty-slot'
                ? 'No data available yet'
                : (typeof performer.voteCount === 'number' ? `Votes ${performer.voteCount.toLocaleString()}` : 'Votes: N/A')}
          </div>
        </div>
      </div>
    </Link>
  );
});

// ─── Full CHANNEL_ROTATION — 38 messages covering all roles + showcases + B2B ──

const TICKER_MSGS = [
  '🎵 ALL CREATORS WELCOME — JOIN NOW',
  '🥁 MARCHING BANDS + CHOIRS WANTED — JOIN THE INDEX',
  '🌍 FREE GLOBAL PROMOTION FOR ALL ARTISTS',
  '📈 CLIMB THE GLOBAL RANKINGS TODAY',
  '🔍 GET DISCOVERED WORLDWIDE — SIGN UP FREE',
  '🎧 DJs WANTED — JOIN DJ BATTLE NIGHT',
  '🎧 DJ DISCOVERY CHARTS NOW OPEN',
  '🎧 SUBMIT YOUR MIX — DJs WELCOME',
  '🎧 DJ SHOWCASE — ALL STYLES ACCEPTED',
  '😂 DIGITAL COMEDY NIGHT — COMEDIANS WANTED',
  '😂 JOKE-OFF BATTLES — ALL COMEDY STYLES ACCEPTED',
  '😂 STAND-UP · IMPROV · SKETCH — ALL WELCOME',
  '😂 COMEDY SHOWCASE — JOIN THE ROTATION',
  '💃 DANCE-OFF CHALLENGES — DANCERS WANTED',
  '💃 ALL DANCE CREWS WELCOME — SIGN UP NOW',
  '💃 DANCE SHOWCASE — ALL STYLES ACCEPTED',
  '🎹 PRODUCERS WANTED — BEAT BATTLES LIVE',
  '🎹 PRODUCER SHOWCASE — SUBMIT INSTRUMENTALS',
  '🎤 SINGERS WELCOME — VOCAL SHOWCASE OPEN',
  '🎸 BANDS WANTED — LIVE PERFORMANCE SLOTS OPEN',
  '🥁 ALL INSTRUMENTALISTS WELCOME',
  '🎭 ACTORS · MAGICIANS · SPOKEN WORD ARTISTS',
  '📰 BLOGGERS · NEWS WRITERS · STREAMERS WELCOME',
  '🏢 VENUES WANTED — BOOK TALENT DIRECT',
  '📣 PROMOTERS WANTED — PROMOTE SHOWS WORLDWIDE',
  '💼 SPONSORS WANTED — ADVERTISE FROM $25',
  '📺 ADVERTISERS WANTED — REACH LIVE AUDIENCES',
  '🎟 VENUES & PROMOTERS — SELL TICKETS ON TMI',
  '💰 EARN TIPS LIVE — PERFORMERS & DJs',
  '📅 GET BOOKED — LIST YOUR AVAILABILITY',
  '🏆 CHALLENGE YOUR SONG — SONG FOR SONG',
  '⚔️ JOIN BATTLE ARENA — COMPETE TONIGHT',
  '🎤 CYPHER ARENA OPEN — DROP IN ANYTIME',
  '🔥 DRUM BATTLE LIVE RIGHT NOW',
  '💥 GENRE BATTLE — HIP-HOP VS R&B',
  '🚀 NEW PERFORMERS JUST INDEXED',
  '🗳️ VOTING LIVE — CROWN SHIFTING',
  '🔊 STREAM & WIN RADIO IS LIVE',
];

// ─── P6: Independent performer monitor tiles ──────────────────────────────────

function PerformerMonitor({
  performers, offsetIdx, intervalMs, accentColor, delayMs, channelNum,
}: {
  performers: Performer[];
  offsetIdx: number;
  intervalMs: number;
  accentColor: string;
  delayMs: number;
  channelNum: number;
}) {
  const [idx, setIdx] = useState(performers.length > 0 ? offsetIdx % performers.length : 0);
  useEffect(() => {
    if (performers.length === 0) return;
    let iid: ReturnType<typeof setInterval>;
    const tid = setTimeout(() => {
      iid = setInterval(() => setIdx((x) => (x + 1) % performers.length), intervalMs);
    }, delayMs);
    return () => { clearTimeout(tid); clearInterval(iid); };
  }, [performers.length, intervalMs, delayMs]);

  // performers starts empty until the parent's data effect runs — render
  // nothing rather than crash on performers[idx] while it's still [].
  if (performers.length === 0) return null;
  const p = performers[idx % performers.length]!;
  return (
    <div style={{ flex: 1, background: 'rgba(5,8,21,0.92)', border: `2px solid ${accentColor}44`, borderRadius: 8, overflow: 'hidden', position: 'relative', minHeight: 110 }}>
      {/* Scanline overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)', pointerEvents: 'none', zIndex: 5 }} />
      {/* Channel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', background: `${accentColor}18`, borderBottom: `1px solid ${accentColor}33` }}>
        <span style={{ fontSize: 7, fontWeight: 900, color: accentColor, letterSpacing: '0.15em', fontFamily: "'Inter',sans-serif" }}>CH-{channelNum} LIVE</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E63000', display: 'inline-block', boxShadow: '0 0 4px #E63000', animation: 'h1Pulse 1.5s infinite' }} />
      </div>
      {/* Performer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 6px', gap: 3 }}>
        <div style={{ fontSize: 28, lineHeight: 1 }}>{p.emoji}</div>
        <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{p.name}</div>
        <div style={{ fontSize: 7, color: accentColor, background: `${accentColor}22`, borderRadius: 8, padding: '1px 5px', fontFamily: "'Inter',sans-serif" }}>{p.genre}</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter',sans-serif" }}>#{p.rank} · {p.score.toLocaleString()} pts</div>
      </div>
      {/* Timer progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `${accentColor}18` }}>
        <div style={{ height: 2, background: accentColor, width: '100%', transformOrigin: 'left center', animation: `h1MonitorBar ${intervalMs / 1000}s linear infinite` }} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

// Legible Times-Square-style typewriter ticker. Types a message in, holds it,
// erases it, moves to the next — replaces the old CSS max-width "type" trick
// (h1MagType) that only ever revealed the single word "MAGAZINE" and, at 11px
// with heavy letter-spacing, read as a flat colored bar rather than text.
function TypewriterTicker({ messages, color }: { messages: string[]; color: string }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');

  useEffect(() => {
    if (messages.length === 0) return;
    const full = messages[msgIdx % messages.length]!;

    if (phase === 'typing') {
      if (text.length < full.length) {
        const id = window.setTimeout(() => setText(full.slice(0, text.length + 1)), 42);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setPhase('holding'), 1600);
      return () => window.clearTimeout(id);
    }

    if (phase === 'holding') {
      const id = window.setTimeout(() => setPhase('erasing'), 1800);
      return () => window.clearTimeout(id);
    }

    // erasing
    if (text.length > 0) {
      const id = window.setTimeout(() => setText(full.slice(0, text.length - 1)), 22);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
      setPhase('typing');
    }, 200);
    return () => window.clearTimeout(id);
  }, [text, phase, msgIdx, messages]);

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 900,
        color,
        letterSpacing: '0.08em',
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      <span style={{ opacity: 0.85, animation: 'h1CaretBlink 0.9s steps(1) infinite' }}>▌</span>
    </span>
  );
}

const HERO_PHRASES = [
  'CHOIRS • MARCHING BANDS • CREATORS WELCOME',
  "WHO'S HOT RIGHT NOW",
  "THE WORLD'S STAGE",
  "WHO'S NEXT?",
  'DISCOVER THE FUTURE',
  'FANS • PERFORMERS • VENUES',
  'LIVE • BATTLE • CYPHER • WIN',
  'YOUR JOURNEY STARTS HERE',
  "THE MUSICIAN'S INDEX",
];

export default function Home1CoverPage() {
  const [genreIdx, setGenreIdx] = useState(0);
  // Rule 20: voteCount must come from a real voting API, not a fake incrementing counter.
  // Initialized to 0 (no votes cast yet). A future /api/rankings/votes endpoint can populate this.
  const [voteCount, setVoteCount] = useState(0);
  const [starburst, setStarburst] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [leftRailIndex, setLeftRailIndex] = useState(0);
  const [rightRailIndex, setRightRailIndex] = useState(0);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [underlayDir, setUnderlayDir] = useState<'left' | 'right'>('right');
  const [pendingOrbit, setPendingOrbit] = useState<UniversalRoom | null>(null);
  const [brokenOrbitImages, setBrokenOrbitImages] = useState<Record<string, boolean>>({});
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [canSubmitPromoSlot, setCanSubmitPromoSlot] = useState(false);
  const [radioData, setRadioData] = useState<{ pending: number; live: number }>({ pending: 0, live: 0 });

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // The LEFT PANEL | ORBITAL | RIGHT PANEL grid is desktop-width math (two
  // 120-170px rails + an orbital that demands min(300px, 70vw)). On phone
  // viewports that sum exceeds the screen and pushes the orbital + right
  // panel off-screen. Collapse both rails by default below tablet width;
  // the existing collapse toggle still lets anyone reopen them.
  useEffect(() => {
    if (window.innerWidth < 768) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, []);

  useEffect(() => {
    setCanSubmitPromoSlot(hasRole('ADMIN', 'SPONSOR', 'ADVERTISER'));
  }, []);

  useEffect(() => {
    fetch('/api/submissions/queue')
      .then(r => r.ok ? r.json() : null)
      .then((data: { pending?: number; queue?: { status: string }[] } | null) => {
        if (data) {
          const live = Array.isArray(data.queue)
            ? data.queue.filter((q) => q.status === 'live' || q.status === 'approved').length
            : 0;
          setRadioData({ pending: data.pending ?? 0, live });
        }
      })
      .catch(() => {});
  }, []);

  const [venues, setVenues] = useState<VenueBookingSlot[]>(() => getVenueBookingSlots(3));

  useEffect(() => {
    // Try to upgrade to real upcoming event data from the API.
    // Falls back silently to VenueRegistry data already in state.
    fetchUpcomingEvents(3).then(events => {
      if (events && events.length > 0) {
        const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'] as const;
        setVenues(events.map(e => {
          const date = new Date(e.startsAt);
          return { day: days[date.getDay()]!, venue: e.venue ?? 'Main Arena', slug: e.id, bookRoute: `/venues/${e.id}/booking` };
        }));
      }
    }).catch(() => {});
  }, []);

  const genreKey = GENRE_KEYS[genreIdx % GENRE_KEYS.length]!;
  const genreConfig = GENRE_CONFIG[genreKey]!;

  // UNIFICATION: Replace static GENRE_DATA with live data from PerformerRegistry
  const [performers, setPerformers] = useState<Performer[]>(() => buildOrbitPerformers(GENRE_KEYS[0]!));
  useEffect(() => {
    setPerformers(buildOrbitPerformers(genreKey));
  }, [genreKey]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && performers.length === 0) {
      // Development signal to catch unexpected registry/category mismatches.
      console.warn('[Home1CoverPage] orbit performers empty for genre', genreKey);
    }
  }, [performers.length, genreKey]);

  useEffect(() => {
    const leftId = setInterval(() => setLeftRailIndex((v) => v + 1), 4800);
    const rightId = setInterval(() => setRightRailIndex((v) => v + 1), 5200);
    return () => {
      clearInterval(leftId);
      clearInterval(rightId);
    };
  }, []);

  // Real liveness from GlobalLiveSessionRegistry — subscribe to changes rather than polling.
  // Carry full session metadata (roomId, viewerCount, category, title) for future enhancements
  // like "🔴 LIVE 42 viewers Battle Thunder Dome" orbit badges.
  const [livePerformers, setLivePerformers] = useState<LiveSession[]>([]);
  useEffect(() => {
    // Get initial state
    setLivePerformers(getActiveSessions());
    // Subscribe to live session changes
    const unsubscribe = onSessionsChanged((sessions) => {
      setLivePerformers(sessions);
    });
    return () => unsubscribe();
  }, []);

  // Crown holder always comes from the PerformerRegistry — the real global #1 by XP.
  const crownData = getCrownHolder();
  const crownIsLive = livePerformers.some((s) => s.userId === crownData.id);
  const crownLiveSession = livePerformers.find((s) => s.userId === crownData.id);
  const crowdHolder = {
    slug: crownData.slug,
    name: crownData.name,
    profileImageUrl: crownData.profileImageUrl,
    profileRoute: crownData.profileRoute,
    introVideoUrl: crownData.introVideoUrl,
    motionPosterUrl: crownData.motionPosterUrl,
    isLive: crownIsLive || crownData.isLive,
    liveRoomRoute: crownLiveSession?.roomId ? `/live/rooms/${crownLiveSession.roomId}` : crownData.liveRoomRoute,
    audienceCount: crownLiveSession?.viewerCount ?? crownData.audienceCount,
  };

  // Overlay real liveness from livePerformers (GlobalLiveSessionRegistry) onto the
  // orbit ring — buildOrbitPerformers()/PERFORMER_REGISTRY only carries the static
  // seed isLive flag, which never reflects an actual broadcast. Live performers also
  // sort to the front so a real broadcaster isn't cut off by the 6/10-card slice
  // (Rule 11: Content Freshness — LIVE first).
  // Map LiveSession objects by userId to find matching performers.
  const liveByUserId = new Map(livePerformers.map((s) => {
    const performer = getPerformerById(s.userId);
    return [s.userId, { session: s, performer }];
  }));
  const performersWithRealLiveness = performers
    .map((p) => {
      const live = Array.from(liveByUserId.values()).find((item) => item.performer?.slug === p.slug);
      if (live) {
        return {
          ...p,
          isLive: true,
          liveRoomRoute: live.session.roomId ? `/live/rooms/${live.session.roomId}` : p.liveRoomRoute,
          roomId: live.session.roomId,
          viewerCount: live.session.viewerCount,
          category: live.session.category,
          title: live.session.title,
        };
      }
      return p;
    })
    .sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0));

  const visibleOrbitCards = performersWithRealLiveness.slice(0, isMobileViewport ? 6 : 10);
  const orbitRadius = isMobileViewport ? 34 : 33;

  // Genre cycle every 6s with starburst flash
  useEffect(() => {
    const id = setInterval(() => {
      setStarburst(true);
      setTimeout(() => {
        setGenreIdx((i) => i + 1);
        setStarburst(false);
      }, 800);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Vote count tick removed — Rule 20: no fake-incrementing counters presented as real live data.

  // Hero headline rotation — cycles brand phrases every 4s with fade
  useEffect(() => {
    const id = setInterval(() => {
      setHeroVisible(false);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % HERO_PHRASES.length);
        setHeroVisible(true);
      }, 380);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const accentColor = genreConfig.color;
  const bgColor = genreConfig.bg;

  // Real-data-only ticker messages (Rule 20) — genre/crown always real,
  // radio line only appears when there's an actual live count to report.
  const tickerMessages = [
    `FEATURED: ${genreKey.toUpperCase()} BATTLES`,
    `👑 CROWN: ${crownData.name.toUpperCase()}`,
    ...(radioData.live > 0 ? [`📻 ${radioData.live} LIVE ON RADIO NOW`] : []),
    `THE MUSICIAN'S INDEX MAGAZINE`,
  ];
  const topPerformers = getTopPerformers(20);
  const diamondMembers = PERFORMER_REGISTRY.filter((p) => p.tier === 'Diamond').sort((a, b) => b.xp - a.xp);

  const genreDiscoveryRails = [
    { label: 'Top Bands', categoryHint: 'Rock', route: '/rankings?category=bands', filter: (p: Performer) => /band|group|ensemble|orchestra/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Choirs', categoryHint: 'Gospel', route: '/rankings?category=choirs', filter: (p: Performer) => /choir/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Marching Bands', categoryHint: 'Marching Band', route: '/rankings?category=marching-bands', filter: (p: Performer) => /marching/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Dance Crews', categoryHint: 'Hip Hop Dance', route: '/rankings?category=dance-crews', filter: (p: Performer) => /dance crew|dance crews|hip hop dance|break|popping|locking/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Streamers', categoryHint: 'Creator', route: '/coming-soon/streamers', filter: (p: Performer) => /stream|broadcaster|commentator|interviewer|podcast/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Writers', categoryHint: 'Writers', route: '/rankings?category=writers', filter: (p: Performer) => /writer|blog|journalist|editor|critic|news/i.test(`${p.name} ${p.genre}`) },
    { label: 'Top Venues', categoryHint: 'Venues', route: '/venues', filter: (p: Performer) => /venues/i.test(p.genre) },
    { label: 'Top Fans', categoryHint: 'Fans', route: '/coming-soon/fans', filter: () => false },
  ] as const;
  const activeDiscovery = genreDiscoveryRails[leftRailIndex % genreDiscoveryRails.length]!;
  const discoveryEntries = performers.filter(activeDiscovery.filter).slice(0, 3);
  const discoveryFallbackBots = buildSystemBotRing().filter((p) => ['discovery-bot', 'helper-bot', 'welcome-bot'].includes(p.botRole ?? '')).slice(0, 3);
  const renderedDiscoveryEntries = discoveryEntries.length > 0 ? discoveryEntries : discoveryFallbackBots;

  const rightRailViews = [
    { label: 'Trending Artists', route: '/rankings', entries: topPerformers.slice(0, 4).map((p) => ({ name: p.name, sub: `${p.category}`, href: p.profileRoute })) },
    { label: 'Active Rooms', route: '/live/lobby', entries: livePerformers.slice(0, 4).map((s) => ({ name: s.displayName, sub: `${s.viewerCount} in room`, href: `/live/rooms/${s.roomId}` })) },
    { label: 'Top Rising Artists', route: '/rankings?rising=true', entries: getFeaturedFreePerformers(4).map((p) => ({ name: p.name, sub: p.genre, href: `/performers/${p.slug}` })) },
    { label: 'Newest Diamond Members', route: '/rankings?tier=Diamond', entries: diamondMembers.slice(0, 4).map((p) => ({ name: p.name, sub: p.category, href: hasUploadedProfileImage(p.profileImageUrl) ? p.profileRoute : `${p.profileRoute}?prompt=upload-image` })) },
    { label: 'Featured Venue', route: '/venues', entries: venues.slice(0, 1).map((v) => ({ name: v.venue, sub: `${v.day} booking`, href: v.bookRoute })) },
    {
      label: 'Featured Sponsor',
      route: '/sponsors/advertise',
      entries: (() => {
        const s = getActiveSponsorForZone('home-1-sponsorRail-0');
        return s ? [{ name: s.name, sub: s.tagline, href: s.ctaHref }] : [];
      })(),
    },
    {
      label: 'Diamond Members',
      route: '/rankings?tier=Diamond',
      entries: diamondMembers.slice(0, 4).map((p) => ({ name: p.name, sub: hasUploadedProfileImage(p.profileImageUrl) ? 'Diamond member' : 'Upload pending', href: hasUploadedProfileImage(p.profileImageUrl) ? p.profileRoute : `${p.profileRoute}?prompt=upload-image` })),
    },
    {
      label: 'Top Fans',
      route: '/coming-soon/fans',
      entries: getFeaturedFreePerformers(4).map((p) => ({ name: p.name, sub: 'Community supporter', href: `/performers/${p.slug}` })),
    },
    {
      label: 'New Members',
      route: '/coming-soon/new-members',
      entries: topPerformers.slice(-4).map((p) => ({ name: p.name, sub: 'New in rotation', href: p.profileRoute })),
    },
  ] as const;
  const activeRightRail = rightRailViews[rightRailIndex % rightRailViews.length]!;
  const rightRailFallback = buildSystemBotRing().slice(0, 3).map((b) => ({ name: b.name, sub: b.systemFunction ?? 'System actor', href: b.profileRoute }));
  const rightRailEntries = activeRightRail.entries.length > 0 ? activeRightRail.entries : rightRailFallback;

  return (
    <>
    {pendingOrbit && <LobbyEntryFlow room={pendingOrbit} onClose={() => setPendingOrbit(null)} />}
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${bgColor} 0%, #0a0614 45%, #050310 100%)`,
        color: '#fff',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <DesktopAtmosphereRails>
        <HeroBannerWell />
        <HeroBannerWell />
      </DesktopAtmosphereRails>
      {/* dangerouslySetInnerHTML avoids React HTML-escaping the @import's quotes/
          ampersands into &#x27;/&amp; (which corrupts the font URL) — JSX text
          children of <style> get escaped same as any other text node. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700;900&display=swap');

        @keyframes h1Spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes h1CounterSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        /* Spin-then-hold, not a continuous spin: ~5s rotation, ~8s hold, 13s
           total. The dead OrbitalWheel.tsx component got this fix earlier
           but was never actually mounted anywhere — this is the real live
           orbit ring/cards used on Home 1, fixed for real this time. */
        @keyframes h1OrbitCycle { 0% { transform: rotate(0deg); } 38% { transform: rotate(360deg); } 100% { transform: rotate(360deg); } }
        @keyframes h1OrbitCycleReverse { 0% { transform: rotate(0deg); } 38% { transform: rotate(-360deg); } 100% { transform: rotate(-360deg); } }
        @keyframes h1CrownFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes h1TypeColor {
          0%   { color: #fff;    text-shadow: 0 0 8px rgba(255,255,255,0.4); }
          25%  { color: #FFD700; text-shadow: 0 0 14px rgba(255,215,0,0.8); }
          50%  { color: #00FF7F; text-shadow: 0 0 14px rgba(0,255,127,0.8); }
          75%  { color: #E63000; text-shadow: 0 0 14px rgba(230,48,0,0.8); }
          100% { color: #fff;    text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        }
        @keyframes h1ColorBg {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes h1RailRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        @keyframes h1BadgePulse {
          0%,100% { box-shadow: 0 0 6px rgba(255,45,170,0.4); border-color: rgba(255,45,170,0.6); }
          50%     { box-shadow: 0 0 16px rgba(255,45,170,0.9); border-color: rgba(255,45,170,1); }
        }
        @keyframes h1Pulse {
          0%, 100% { box-shadow: 0 0 20px ${accentColor}55; }
          50% { box-shadow: 0 0 40px ${accentColor}99, 0 0 80px ${accentColor}33; }
        }
        @keyframes h1TickerScroll {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-100%); }
        }
        @keyframes h1StarburstRay {
          0%   { transform: scaleY(0) translateX(-50%); opacity: 1; }
          50%  { transform: scaleY(1) translateX(-50%); opacity: 0.8; }
          100% { transform: scaleY(1.6) translateX(-50%); opacity: 0; }
        }
        @keyframes h1BlobA {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(60px,-40px) scale(1.12); }
          66%     { transform: translate(-40px,30px) scale(0.9); }
        }
        @keyframes h1BlobB {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(-50px,50px) scale(0.88); }
          66%     { transform: translate(70px,-30px) scale(1.1); }
        }
        @keyframes h1BlobC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(40px,60px) scale(1.08); }
        }
        @keyframes h1StickerPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes tmiAtmosphereKenBurns {
          0% { transform: scale(1.06) translate3d(0, 0, 0); }
          100% { transform: scale(1.14) translate3d(0, -1.5%, 0); }
        }
        @keyframes h1CardHover {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        @keyframes h1ConfettiDrift {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(180deg); opacity: 0; }
        }
        @keyframes h1MonitorBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes h1CaretBlink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes h1TabloidScroll {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        @keyframes h1FloatStar {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.45; }
          50%       { transform: translateY(-8px) scale(1.15); opacity: 0.75; }
        }
        @keyframes h1WorldGlowA {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.62; }
          33%       { transform: scale(1.14) translate(22px, -14px); opacity: 0.78; }
          66%       { transform: scale(0.9) translate(-16px, 22px); opacity: 0.5; }
        }
        @keyframes h1WorldGlowB {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.52; }
          50%       { transform: translate(28px, -18px) scale(1.12); opacity: 0.68; }
        }
        @keyframes h1WorldGlowC {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.48; }
          50%       { transform: translate(-22px, 14px) scale(1.09); opacity: 0.65; }
        }
        @keyframes h1BillboardFlicker {
          0%, 100% { opacity: 1; }
          12%  { opacity: 0.65; }
          18%  { opacity: 0.95; }
          47%  { opacity: 0.78; }
          52%  { opacity: 1; }
          78%  { opacity: 0.82; }
        }
        @keyframes h1LightSweep {
          0%, 100% { opacity: 0.55; transform: skewX(-8deg) scaleY(1); }
          50%       { opacity: 0.88; transform: skewX(-8deg) scaleY(1.18); }
        }
        @keyframes h1LightSweepR {
          0%, 100% { opacity: 0.5; transform: skewX(8deg) scaleY(1); }
          50%       { opacity: 0.82; transform: skewX(8deg) scaleY(1.14); }
        }
        @keyframes h1ParticleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.45; }
          50%       { transform: translateY(-14px) scale(1.35); opacity: 0.72; }
        }
        @keyframes h1RadioPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.2); }
          50%       { box-shadow: 0 0 18px rgba(0,229,255,0.7), 0 0 36px rgba(0,229,255,0.35); }
        }
        @media (prefers-reduced-motion: reduce) {
          *[style*="h1WorldGlowA"], *[style*="h1WorldGlowB"], *[style*="h1WorldGlowC"],
          *[style*="h1BillboardFlicker"], *[style*="h1LightSweep"], *[style*="h1LightSweepR"],
          *[style*="h1ParticleFloat"], *[style*="h1RadioPulse"] {
            animation: none !important;
          }
        }
      ` }} />

      {/* ── Background confetti triangles ── */}
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8 + (i % 5) * 4,
            height: 8 + (i % 5) * 4,
            background: [accentColor, '#FFD700', '#FF2DAA', '#00FF88', '#AA2DFF'][i % 5],
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            left: `${(i * 13 + 3) % 100}%`,
            top: `${(i * 17 + 5) % 90}%`,
            opacity: 0.18,
            transform: `rotate(${i * 37}deg)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ══ BETA BAR — top of page ══ */}
      <div style={{ background: 'rgba(230,48,0,0.18)', borderBottom: '1px solid rgba(230,48,0,0.32)', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 8 }}>
        <div style={{ color: '#E63000', fontWeight: 700, letterSpacing: '0.12em', fontFamily: "'Inter',sans-serif" }}>✦ TMI BETA SEASON</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter',sans-serif" }}>Founding Beta Member · Purchases &amp; unlocks persist permanently</div>
        <Link href="/about" style={{ textDecoration: 'none', color: '#FFD700', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>DETAILS →</Link>
      </div>

      {/* ── Voting LIVE banner ── */}
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(90deg, #1a0050 0%, ${accentColor}33 50%, #1a0050 100%)`,
          borderBottom: `2px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '7px 16px',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: accentColor,
            letterSpacing: '0.15em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🗳️ VOTING LIVE!
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>|</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" }}>
          CROWN VOTING OPENS AT LAUNCH
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>|</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: '#FFD700',
            letterSpacing: '0.1em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {genreKey.toUpperCase()} GENRE BATTLE!
        </span>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          paddingTop: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '64vh',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {/* ── Geometric 80s background accents (pointer-events:none, no layout impact) ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* Gold diamond */}
          <div style={{ position: 'absolute', top: '8%', left: '3%', width: 28, height: 28, background: 'rgba(255,215,0,0.18)', transform: 'rotate(45deg)', border: '1px solid rgba(255,215,0,0.35)' }} />
          {/* Pink triangle */}
          <div style={{ position: 'absolute', top: '12%', right: '4%', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '32px solid rgba(255,45,170,0.15)' }} />
          {/* Cyan triangle */}
          <div style={{ position: 'absolute', top: '35%', left: '1%', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderBottom: '24px solid rgba(0,229,255,0.12)' }} />
          {/* Purple circle */}
          <div style={{ position: 'absolute', bottom: '30%', right: '2%', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(170,45,255,0.22)', background: 'rgba(170,45,255,0.06)' }} />
          {/* Gold diamond bottom-left */}
          <div style={{ position: 'absolute', bottom: '18%', left: '2%', width: 18, height: 18, background: 'rgba(255,215,0,0.12)', transform: 'rotate(45deg)', border: '1px solid rgba(255,215,0,0.2)' }} />
          {/* Cyan rectangle accent */}
          <div style={{ position: 'absolute', top: '55%', right: '1.5%', width: 8, height: 40, background: 'rgba(0,229,255,0.09)', border: '1px solid rgba(0,229,255,0.18)' }} />
          {/* Pink small square */}
          <div style={{ position: 'absolute', top: '68%', left: '1%', width: 12, height: 12, background: 'rgba(255,45,170,0.12)', transform: 'rotate(20deg)' }} />
        </div>

        {/* ── Masthead ── */}
        <div style={{ textAlign: 'center', marginTop: 0, marginBottom: 8, zIndex: 10, position: 'relative', maxHeight: '150px' }}>
          {/* Floating star decorations */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
            {[
              { top: 10, left: '8%',  size: 12, delay: '0s',    char: '⭐' },
              { top: 22, left: '15%', size: 9,  delay: '0.6s',  char: '✦' },
              { top: 6,  left: '85%', size: 11, delay: '1.1s',  char: '⭐' },
              { top: 18, left: '78%', size: 8,  delay: '0.3s',  char: '✦' },
              { top: 38, left: '5%',  size: 8,  delay: '1.8s',  char: '✦' },
              { top: 34, left: '91%', size: 9,  delay: '0.9s',  char: '✦' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', top: s.top, left: s.left, fontSize: s.size, opacity: 0.45, animation: `h1FloatStar 3s ease-in-out infinite`, animationDelay: s.delay, display: 'inline-block' }}>{s.char}</span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              overflow: 'visible',
              fontSize: 'clamp(12px, 2.8vw, 19px)',
              fontWeight: 900,
              letterSpacing: '0.3em',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 4,
            }}
          >
            {"THE MUSICIAN'S INDEX".split('').map((char, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  minWidth: char === ' ' ? '0.5em' : 'auto',
                  animation: 'h1TypeColor 4s ease-in-out infinite',
                  animationDelay: `${index * 0.07}s`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
          {/* Rotating status ticker — real genre/crown/radio data, typed in Times-Square style */}
          <div
            style={{
              overflow: 'hidden',
              height: 18,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 2,
            }}
          >
            <TypewriterTicker messages={tickerMessages} color={accentColor} />
          </div>
          <div
            style={{
              fontSize: 'clamp(18px, 3.5vw, 26px)',
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              background: `linear-gradient(135deg, #fff 0%, ${accentColor} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.04em',
              lineHeight: 1,
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.38s ease',
              minHeight: '1.1em',
            }}
          >
            {HERO_PHRASES[heroIdx]}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 3,
              padding: '3px 16px',
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 900,
              color: accentColor,
              letterSpacing: '0.18em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {genreConfig.emoji} {genreKey.toUpperCase()} · WEEK {Math.ceil((Date.now() / (7 * 24 * 60 * 60 * 1000)) % 52) || 1}
          </div>

          {/* ── Status badges row: VOTING LIVE | VOTES | CROWN UPDATING ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,45,170,0.18)', border: '1px solid rgba(255,45,170,0.6)', borderRadius: 4, padding: '3px 10px', animation: 'h1BadgePulse 2s ease-in-out infinite' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', display: 'inline-block', animation: 'h1Pulse 1s infinite' }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#FF2DAA', fontFamily: "'Inter',sans-serif" }}>VOTING LIVE</span>
            </div>
            <div style={{ background: 'rgba(255,215,0,0.14)', border: '1px solid rgba(255,215,0,0.5)', borderRadius: 4, padding: '3px 12px', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: '#FFD700' }}>
              {voteCount > 0 ? `${voteCount.toLocaleString()} VOTES` : 'VOTING OPENS SOON'}
            </div>
            <div style={{ background: 'rgba(230,48,0,0.18)', border: '1px solid rgba(230,48,0,0.5)', borderRadius: 4, padding: '3px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#E63000', fontFamily: "'Inter',sans-serif" }}>CROWN UPDATING</div>
          </div>

          {/* ── Challenge banner slider ── */}
          <div style={{ background: 'rgba(123,0,255,0.16)', border: '1px solid rgba(123,0,255,0.34)', borderRadius: 6, padding: '3px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, maxWidth: 440, width: '100%', marginInline: 'auto' }}>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '2px 6px', fontSize: 8, cursor: 'pointer' }}>◀</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.07em', fontFamily: "'Inter',sans-serif" }}>CHALLENGE YOUR SONG HERE</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>SONG FOR SONG · WORK FOR WORK</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link href="/battles/challenge" style={{ fontSize: 8, fontWeight: 700, color: '#00E5FF', textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}>START NOW</Link>
              <button style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '2px 6px', fontSize: 8, cursor: 'pointer' }}>▶</button>
            </div>
          </div>

          {/* ── Action buttons: 7 clickable buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'JOIN FREE',       href: '/signup',             bg: 'rgba(0,255,127,0.14)', color: '#00FF7F', border: 'rgba(0,255,127,0.4)' },
              { label: 'LOGIN',           href: '/login',              bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.2)' },
              { label: 'CHALLENGE SONG',  href: '/battles/challenge',  bg: 'rgba(255,215,0,0.14)', color: '#FFD700', border: 'rgba(255,215,0,0.35)' },
              { label: 'CYPHER ARENA',    href: '/live/rooms/cypher-arena', bg: 'rgba(0,229,255,0.12)', color: '#00E5FF', border: 'rgba(0,229,255,0.3)' },
              { label: 'MAGAZINE',        href: '/magazine',           bg: 'rgba(255,45,170,0.12)', color: '#FF2DAA', border: 'rgba(255,45,170,0.3)' },
              { label: 'SPONSOR',         href: '/sponsors/apply',     bg: 'rgba(155,89,182,0.12)', color: '#9B59B6', border: 'rgba(155,89,182,0.3)' },
              { label: 'ADVERTISE',       href: '/sponsors/advertise', bg: 'rgba(230,48,0,0.12)',  color: '#E63000', border: 'rgba(230,48,0,0.3)' },
            ].map((btn) => (
              <Link key={btn.label} href={btn.href} style={{ textDecoration: 'none' }}>
                <button style={{ background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, borderRadius: 5, padding: '5px 11px', fontSize: 9, fontWeight: 800, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.05em' }}>{btn.label}</button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Orbital section wrapper — tabloid underlay lives here (position:absolute) ──
             marginTop is a POSITIVE 48px here, not negative — a prior pass had this at
             -46 (pulling the section UP into the masthead). Build Director correction
             (2026-06-20): crown/orbit must sit 40-60px LOWER, not higher. ── */}
        <div style={{ position: 'relative', width: '100%', overflow: 'visible', marginTop: 62, paddingBottom: 4 }}>

        {/* ── WORLD ENVIRONMENT LAYER — atmospheric depth, billboard walls, venue lighting ──
             Restores the "living entertainment district" feel behind the orbital.
             All elements are pointer-events:none and z-index:0 so the orbital stays primary. */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* Atmospheric glow blobs — deep purple/cyan/fuchsia */}
          <div style={{ position: 'absolute', width: '70%', height: '70%', top: '15%', left: '15%',
            background: `radial-gradient(ellipse at center, ${accentColor}32 0%, transparent 62%)`,
            animation: 'h1WorldGlowA 9s ease-in-out infinite', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '50%', height: '55%', top: '20%', left: '-8%',
            background: 'radial-gradient(ellipse at center, rgba(170,45,255,0.28) 0%, transparent 58%)',
            animation: 'h1WorldGlowB 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '50%', height: '55%', top: '12%', right: '-8%',
            background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.24) 0%, transparent 58%)',
            animation: 'h1WorldGlowC 10s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '35%', height: '40%', bottom: '5%', left: '32%',
            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.18) 0%, transparent 60%)',
            animation: 'h1WorldGlowB 14s ease-in-out infinite', animationDelay: '4s' }} />

          {/* Billboard light columns — left side */}
          <div style={{ position: 'absolute', left: '4%', top: '8%', width: 5, height: '72%',
            background: 'linear-gradient(to bottom, rgba(255,45,170,0) 0%, rgba(255,45,170,0.55) 40%, rgba(255,45,170,0.55) 60%, rgba(255,45,170,0) 100%)',
            animation: 'h1BillboardFlicker 3.7s ease-in-out infinite', borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '9%', top: '5%', width: 3, height: '78%',
            background: 'linear-gradient(to bottom, rgba(0,229,255,0) 0%, rgba(0,229,255,0.45) 35%, rgba(0,229,255,0.45) 65%, rgba(0,229,255,0) 100%)',
            animation: 'h1BillboardFlicker 5.2s ease-in-out infinite', animationDelay: '1s', borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '13%', top: '20%', width: 2, height: '55%',
            background: 'linear-gradient(to bottom, rgba(255,215,0,0) 0%, rgba(255,215,0,0.38) 50%, rgba(255,215,0,0) 100%)',
            animation: 'h1BillboardFlicker 7.1s ease-in-out infinite', animationDelay: '2.5s', borderRadius: 1 }} />
          {/* Billboard light columns — right side */}
          <div style={{ position: 'absolute', right: '4%', top: '8%', width: 5, height: '72%',
            background: 'linear-gradient(to bottom, rgba(255,215,0,0) 0%, rgba(255,215,0,0.52) 40%, rgba(255,215,0,0.52) 60%, rgba(255,215,0,0) 100%)',
            animation: 'h1BillboardFlicker 4.1s ease-in-out infinite', animationDelay: '0.6s', borderRadius: 2 }} />
          <div style={{ position: 'absolute', right: '9%', top: '5%', width: 3, height: '78%',
            background: 'linear-gradient(to bottom, rgba(170,45,255,0) 0%, rgba(170,45,255,0.45) 35%, rgba(170,45,255,0.45) 65%, rgba(170,45,255,0) 100%)',
            animation: 'h1BillboardFlicker 6.3s ease-in-out infinite', animationDelay: '2s', borderRadius: 2 }} />
          <div style={{ position: 'absolute', right: '13%', top: '20%', width: 2, height: '55%',
            background: 'linear-gradient(to bottom, rgba(0,229,255,0) 0%, rgba(0,229,255,0.38) 50%, rgba(0,229,255,0) 100%)',
            animation: 'h1BillboardFlicker 8.4s ease-in-out infinite', animationDelay: '3.2s', borderRadius: 1 }} />

          {/* Horizontal neon scan lines — billboard frame edges */}
          <div style={{ position: 'absolute', top: '12%', left: '3%', right: '3%', height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}25 25%, ${accentColor}55 50%, ${accentColor}25 75%, transparent 100%)` }} />
          <div style={{ position: 'absolute', top: '38%', left: '5%', right: '5%', height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(170,45,255,0.22) 25%, rgba(170,45,255,0.42) 50%, rgba(170,45,255,0.22) 75%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '3%', right: '3%', height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,45,170,0.28) 30%, rgba(255,45,170,0.48) 50%, rgba(255,45,170,0.28) 70%, transparent 100%)' }} />

          {/* Venue light sweeps — cone beams from below */}
          <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '10%', height: '55%',
            background: `linear-gradient(to top, ${accentColor}28, transparent)`,
            transform: 'skewX(-12deg)', animation: 'h1LightSweep 7s ease-in-out infinite', transformOrigin: 'bottom center' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '38%', width: '8%', height: '50%',
            background: 'linear-gradient(to top, rgba(255,215,0,0.22), transparent)',
            animation: 'h1LightSweep 9s ease-in-out infinite', animationDelay: '2s', transformOrigin: 'bottom center' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '20%', width: '10%', height: '55%',
            background: 'linear-gradient(to top, rgba(255,45,170,0.22), transparent)',
            transform: 'skewX(12deg)', animation: 'h1LightSweepR 6s ease-in-out infinite', animationDelay: '1s', transformOrigin: 'bottom center' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '38%', width: '8%', height: '48%',
            background: 'linear-gradient(to top, rgba(170,45,255,0.2), transparent)',
            animation: 'h1LightSweepR 8s ease-in-out infinite', animationDelay: '3.5s', transformOrigin: 'bottom center' }} />

          {/* Floating particles */}
          {[...Array(14)].map((_, i) => (
            <div key={`wp-${i}`} style={{
              position: 'absolute',
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: '50%',
              background: ([accentColor, '#FF2DAA', '#FFD700', '#AA2DFF', '#00E5FF'] as string[])[i % 5],
              left: `${(i * 7 + 4) % 88}%`,
              top: `${(i * 11 + 8) % 80}%`,
              opacity: 0.5,
              animation: `h1ParticleFloat ${3 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.35).toFixed(1)}s`,
            }} />
          ))}

          {/* Crowd silhouette at base */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '16%',
            background: 'linear-gradient(to top, rgba(5,5,16,0.72) 0%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10%',
            background: 'rgba(5,5,16,0.5)',
            clipPath: 'polygon(0 100%,4% 45%,7% 72%,11% 22%,15% 62%,19% 38%,23% 58%,28% 18%,32% 52%,37% 28%,42% 66%,46% 30%,51% 20%,55% 55%,60% 35%,64% 62%,68% 22%,72% 52%,76% 32%,80% 68%,84% 28%,88% 55%,93% 38%,97% 62%,100% 42%,100% 100%)',
            pointerEvents: 'none' }} />
        </div>

        {/* TABLOID MAGAZINE UNDERLAY — scrolls behind the orbital (blueprint spec).
             Build Director correction (2026-06-20): the orbit must be the visual
             focus, the underlay only supports it — reduced height (top/bottom
             insets instead of full inset:0) and opacity so it recedes. */}
        <div style={{ position: 'absolute', top: '18%', bottom: '18%', left: 0, right: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: `${underlayDir === 'left' ? 'h1TabloidScroll' : 'h1RailRight'} 18s linear infinite`, opacity: 0.38, height: '100%', alignItems: 'stretch' }}>
            {/* Build Director correction (2026-06-20): these were legacy
              single-performer battle placeholders that do not belong on a
              public recruitment/discovery surface. Replaced with rotating
              recruitment categories so every performer type sees themselves
              here, not only rappers/singers. */}
            {[0, 1, 2].map(rep =>
              [
                { bg: '#FFD700', hdr: '#FF1493', title: 'SINGERS WANTED',            sub: 'VOCALISTS NEEDED',       artist: 'R&B · POP · GOSPEL',         tag: 'JOIN LIVE SHOWCASES TONIGHT',       cta: 'SIGN UP FREE',       c1: '#00BFFF' },
                { bg: '#FF1493', hdr: '#000000', title: 'DJs WANTED',                sub: 'TURNTABLES + SETS',      artist: 'CLUB · BATTLE · CYPHER',     tag: 'DJ DISCOVERY CHARTS ARE LIVE',      cta: 'JOIN DJ FLOOR',      c1: '#FFD700' },
                { bg: '#00BFFF', hdr: '#000000', title: 'COMEDIANS NEEDED',          sub: 'OPEN MIC NIGHTS',        artist: 'STAND-UP · SKETCH · IMPROV', tag: 'COMEDY SHOWCASES STREAMING',         cta: 'APPLY NOW',          c1: '#FF1493' },
                { bg: '#000000', hdr: '#FFD700', title: 'DANCERS WANTED',            sub: 'CREWS + SOLO DANCERS',   artist: 'HIP-HOP · BREAK · BALLET',   tag: 'DANCE BATTLES OPEN THIS WEEK',       cta: 'JOIN A CREW',        c1: '#FF1493' },
                { bg: '#9B59B6', hdr: '#FFD700', title: 'WRITERS NEEDED',            sub: 'SONGWRITERS + POETS',    artist: 'LYRICS · SPOKEN WORD',       tag: 'WRITE FOR ARTISTS + MAGAZINE',       cta: 'SUBMIT WRITING',     c1: '#00BFFF' },
                { bg: '#FFD700', hdr: '#000000', title: 'ADVERTISERS WANTED',        sub: 'REACH LIVE FANS',        artist: 'SPOTS FROM $25',             tag: 'PLACEMENTS ACROSS TMI SURFACES',     cta: 'ADVERTISE NOW',      c1: '#FF2DAA' },
                { bg: '#FF1493', hdr: '#FFD700', title: 'PRODUCERS WANTED',          sub: 'BUILD BEAT CATALOGS',    artist: 'MIX + MASTER + RELEASE',     tag: 'GLOBAL PRODUCER RANKINGS OPEN',      cta: 'JOIN PRODUCER HUB',  c1: '#00BFFF' },
                { bg: '#00BFFF', hdr: '#000000', title: 'BEATMAKERS WANTED',         sub: 'SELL + FEATURE BEATS',   artist: 'LEASES + EXCLUSIVES',        tag: 'BEAT MARKETPLACE IS ACTIVE',         cta: 'UPLOAD BEATS',       c1: '#FFD700' },
                { bg: '#000000', hdr: '#FFD700', title: 'ACTORS WANTED',             sub: 'LIVE PERFORMANCE ROOMS', artist: 'SCENES + MONOLOGUES',        tag: 'SHOWCASE YOUR TALENT LIVE',           cta: 'BOOK A SLOT',        c1: '#AA2DFF' },
                { bg: '#9B59B6', hdr: '#FFD700', title: 'MAGICIANS WANTED',          sub: 'ILLUSION + STAGE ACTS',  artist: 'FAMILY + PRIME-TIME SETS',   tag: 'UNIQUE ACTS GET FEATURED FAST',       cta: 'APPLY PERFORMANCE',  c1: '#00FFFF' },
                { bg: '#FFD700', hdr: '#000000', title: 'VENUES WANTED',             sub: 'HOST GLOBAL EVENTS',     artist: 'BOOK TALENT DIRECT',         tag: 'VENUE BOOKING ENGINE IS LIVE',        cta: 'LIST YOUR VENUE',    c1: '#00BFFF' },
                { bg: '#FF1493', hdr: '#000000', title: 'HOSTS WANTED',              sub: 'MC + EVENT HOSTING',     artist: 'ARENAS + AWARD NIGHTS',      tag: 'HOST MONTHLY + WEEKLY SHOWS',         cta: 'BECOME A HOST',      c1: '#FFD700' },
                { bg: '#00BFFF', hdr: '#000000', title: 'TOP GUITARISTS',            sub: 'GLOBAL INSTRUMENT INDEX',artist: 'LEAD + RHYTHM + SOLO',        tag: 'RANKED BY XP + ENGAGEMENT',           cta: 'VIEW RANKINGS',      c1: '#FF1493' },
                { bg: '#000000', hdr: '#FFD700', title: 'TOP DRUMMERS',              sub: 'LIVE RHYTHM LEADERS',    artist: 'KIT + PERCUSSION',           tag: 'TRENDING DRUM ARTISTS WORLDWIDE',     cta: 'SEE TOP 10',         c1: '#00BFFF' },
                { bg: '#9B59B6', hdr: '#FFD700', title: 'TOP PIANISTS',              sub: 'KEYS + COMPOSITION',     artist: 'JAZZ + CLASSICAL + POP',     tag: 'LEADERBOARDS UPDATE DAILY',           cta: 'OPEN BOARD',         c1: '#00FFFF' },
                { bg: '#FFD700', hdr: '#FF1493', title: 'TOP VIOLINISTS',            sub: 'STRINGS SPOTLIGHT',      artist: 'SOLO + ENSEMBLE',            tag: 'DISCOVERY + VENUE BOOKINGS',          cta: 'VIEW TALENT',        c1: '#00BFFF' },
                { bg: '#FF1493', hdr: '#000000', title: 'TOP SAX PLAYERS',           sub: 'JAZZ + FUSION LEADERS',  artist: 'LIVE IMPROV SHOWCASE',       tag: 'GLOBAL SAXOPHONE CHARTS',             cta: 'JOIN CHARTS',        c1: '#FFD700' },
                { bg: '#00BFFF', hdr: '#000000', title: 'TOP DJs',                   sub: 'TURNTABLE RANKINGS',     artist: 'LIVE SET POWER INDEX',       tag: 'DJ SCORES MOVE BY FAN RESPONSE',      cta: 'TRACK RANK',         c1: '#FF1493' },
                { bg: '#000000', hdr: '#FFD700', title: 'TOP BEATMAKERS',            sub: 'PRODUCTION CHARTS',      artist: 'SELL + STREAM + BATTLES',    tag: 'RANKED BY XP + USAGE + WINS',         cta: 'OPEN CHART',         c1: '#00BFFF' },
                { bg: '#9B59B6', hdr: '#FFD700', title: 'TOP COMEDIANS',             sub: 'COMEDY LEADERBOARDS',    artist: 'VOTES + AUDIENCE + REPLAYS', tag: 'GLOBAL COMEDY IMPACT RANKING',        cta: 'VIEW LEADERS',       c1: '#00FFFF' },
                { bg: '#FFD700', hdr: '#000000', title: 'TOP DANCERS',               sub: 'DANCE WORLD RANKINGS',   artist: 'CREWS + SOLO MOVERS',        tag: 'CYBERS + BATTLES + LIVE CROWDS',      cta: 'SEE DANCERS',        c1: '#FF1493' },
              ].map((p, i) => (
                <div key={`${rep}-${i}`} style={{ display: 'inline-flex', flexDirection: 'column', width: 190, flexShrink: 0, border: '3px solid #000', overflow: 'hidden', background: p.bg, height: '100%' }}>
                  <div style={{ background: p.hdr, padding: '6px 8px' }}>
                    <div style={{ fontSize: 6, fontWeight: 700, color: p.hdr === '#000000' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.06em' }}>THE MUSICIAN&apos;S INDEX · VOL.1 · $4.99</div>
                  </div>
                  <div style={{ padding: '10px 8px', flex: 1 }}>
                    <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 22, color: p.hdr === '#000000' ? (p.bg === '#000000' ? '#FFD700' : '#FFD700') : '#000', lineHeight: 1, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ background: p.c1, padding: '4px 6px', marginBottom: 3 }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#000' }}>{p.sub}</div>
                      <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 14, color: '#000' }}>{p.artist}</div>
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>{p.tag}</div>
                  </div>
                  <div style={{ background: '#000', padding: '4px 8px', fontSize: 7, fontWeight: 700, color: p.hdr === '#000000' ? p.c1 : '#FFD700', letterSpacing: '0.05em' }}>{p.cta}</div>
                </div>
              ))
            )}
          </div>
          {/* Radial vignette keeps center readable — filter:blur() removed, it was
              softening/blurring the tabloid text underneath rather than just the
              gradient edge (Build Director correction 2026-06-20: "remove blur,
              improve sharpness, broadcast readability"). */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 44% 58% at center, transparent 46%, rgba(6,2,26,0.68) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,2,26,0.7) 0%, transparent 24%, transparent 76%, rgba(6,2,26,0.7) 100%)', pointerEvents: 'none' }} />
        </div>

        {/* ── Underlay direction toggle ── */}
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => setUnderlayDir('left')} style={{ background: underlayDir === 'left' ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.15)', color: underlayDir === 'left' ? '#000' : '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 4, fontSize: 7, fontWeight: 800, padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>◀ TABLOID</button>
          <button onClick={() => setUnderlayDir('right')} style={{ background: underlayDir === 'right' ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.15)', color: underlayDir === 'right' ? '#000' : '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 4, fontSize: 7, fontWeight: 800, padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>TABLOID ▶</button>
        </div>

        {/* ── Cinematic 3-Rail Grid — LEFT PANEL | ORBITAL | RIGHT PANEL ── */}
        <div
          style={{
            display: 'grid',
            // Grid tracks must follow the same open/closed state as the panel
            // content (line ~695/~1163) — clamp(120px,...) has a 120px floor
            // that doesn't shrink for phone widths, so a collapsed panel still
            // reserved 120-170px of empty track and pushed the orbital + the
            // other rail off-screen. 14px matches the always-visible collapse
            // toggle strip width.
            gridTemplateColumns: `${leftOpen ? 'clamp(120px, 15vw, 170px)' : '14px'} 1fr ${rightOpen ? 'clamp(120px, 15vw, 170px)' : '14px'}`,
            width: '100%',
            alignItems: 'start',
            gap: 10,
            padding: '0 10px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ════ LEFT PANEL — PROMO/VENUE/ADS tabs + collapse ════ */}
          <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: 8 }}>
            <div style={{ width: leftOpen ? 'clamp(120px,15vw,160px)' : 0, overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
              <div style={{ background: 'rgba(6,2,26,0.95)', border: '1px solid rgba(255,45,170,0.35)', borderRadius: '8px 0 0 8px', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                <div style={{ padding: '6px 7px 5px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 7, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.11em', marginBottom: 3 }}>GENRE DISCOVERY</div>
                  <div style={{ fontSize: 7, fontWeight: 800, color: '#FFD700', letterSpacing: '0.06em' }}>{activeDiscovery.categoryHint.toUpperCase()} · {activeDiscovery.label.toUpperCase()}</div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 6px', fontSize: 9 }}>
                  {renderedDiscoveryEntries.length > 0 ? renderedDiscoveryEntries.map((p) => (
                    <Link key={p.slug} href={p.profileRoute} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,45,170,0.2)', borderRadius: 5, padding: 5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(255,45,170,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', background: 'rgba(255,45,170,0.1)', flexShrink: 0 }}>
                          {p.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.genre}</div>
                        </div>
                        <span style={{ fontSize: 6, fontWeight: 700, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.5)', borderRadius: 3, padding: '1px 4px' }}>OPEN</span>
                      </div>
                    </Link>
                  )) : (
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', textAlign: 'center', paddingTop: 12 }}>No data available yet</div>
                  )}
                  <Link href={activeDiscovery.route} style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', background: 'rgba(255,45,170,0.12)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.35)', borderRadius: 4, fontSize: 7, fontWeight: 800, padding: '5px', cursor: 'pointer', marginTop: 5, letterSpacing: '0.06em' }}>VIEW CATEGORY</button>
                  </Link>
                  {canSubmitPromoSlot && (
                    // /sponsors/claim-slot had no real page — it fell through
                    // to the dynamic /sponsors/[slug] -> /profile/sponsor/[slug]
                    // route, which rendered "claim-slot" as if it were a real
                    // sponsor's name. /submit is the real, working submission
                    // system (8 lanes, real form, real XP/rotation loop).
                    <Link href="/submit" style={{ textDecoration: 'none' }}>
                      <button style={{ width: '100%', marginTop: 6, padding: '5px', fontSize: 7, fontWeight: 800, border: '1px dashed rgba(255,215,0,0.5)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em' }}>SUBMIT PROMO SLOT</button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Collapse toggle strip */}
            <div onClick={() => setLeftOpen(!leftOpen)} style={{ background: 'rgba(255,45,170,0.18)', border: '1px solid rgba(255,45,170,0.4)', borderRadius: leftOpen ? '0 5px 5px 0' : '5px', width: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: 7, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.1em', userSelect: 'none', flexShrink: 0 }}>
              {leftOpen ? '◂ PANEL' : 'PANEL ▸'}
            </div>
          </div>
          
          {/* ════ CENTER COLUMN — label + orbital ring, wrapped as ONE grid child so the
               3-col grid (left rail | center | right rail) doesn't auto-place a 4th
               item into a phantom row. Previously the label and orbital ring were two
               separate direct children of the grid, which pushed the orbital into the
               right-rail track (overflowing off-screen) and wrapped the right panel
               into a new implicit row under the left rail. ════ */}
          <div style={{ minWidth: 0, position: 'relative', zIndex: 8, isolation: 'isolate' }}>

          {/* ── WEEKLY CROWN ORBIT label ── */}
          <div style={{ textAlign: 'center', padding: '8px 0 4px', position: 'relative', zIndex: 5 }}>
            <div style={{ fontFamily: "'Orbitron','Inter',sans-serif", fontSize: 13, fontWeight: 900, color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.6)', letterSpacing: '0.08em' }}>WHO&apos;S HOT RIGHT NOW</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginTop: 1 }}>TOP SINGERS · BANDS · CHOIRS · MARCHING BANDS · DJS · PRODUCERS · COMEDIANS · DANCERS · ACTORS · STREAMERS · WRITERS · PROMOTERS · VENUES · FANS</div>
          </div>

          {/* ── Orbital ring ──
               Build Director correction (2026-06-20): orbit/crown scale target is
               ~15-20% smaller overall — maxWidth 900px was already cut to 820px
               (only ~9%) in a prior pass; cutting further to 740px brings the
               container in line with the crown circle (-17%) and card sizes
               (-15-18%) already applied below. */}
          <div
            style={{
              position: 'relative',
              width: 'min(100%, 92vw)',
              minWidth: isMobileViewport ? 260 : 'min(280px, 58vw)',
              maxWidth: isMobileViewport ? 520 : 'min(740px, 60vw)',
              aspectRatio: '1 / 1',
              margin: '0 auto',
              flexShrink: 0,
              zIndex: 10,
              overflow: 'visible',
            }}
          >
          {/* Starburst transition overlay */}
          {starburst && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', overflow: 'hidden' }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: 4,
                  height: '55%',
                  background: `linear-gradient(to top, ${accentColor}, transparent)`,
                  transformOrigin: 'bottom center',
                  transform: `rotate(${i * (360 / 14)}deg) translateX(-50%)`,
                  animation: 'h1StarburstRay 0.8s ease-out forwards',
                  animationDelay: `${i * 0.02}s`,
                }} />
              ))}
            </div>
          )}

          {/* Spinning ring */}
          <div
            style={{
              position: 'absolute',
              inset: '15%',
              borderRadius: '50%',
              border: `1px solid ${accentColor}0f`,
              boxShadow: `0 0 20px ${accentColor}0c`,
              animation: 'h1OrbitCycle 13s ease-in-out infinite',
              willChange: 'transform',
              transform: 'translateZ(0)',
              zIndex: 12,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '19%',
              borderRadius: '50%',
              border: `1px dashed ${accentColor}0c`,
              animation: 'h1OrbitCycleReverse 13s ease-in-out infinite',
              willChange: 'transform',
              transform: 'translateZ(0)',
              zIndex: 13,
            }}
          />

          {/* Center: Crown holder — LIVE routes to seat-join flow, else → profile */}
          <Link
            href={crowdHolder.isLive && crowdHolder.liveRoomRoute ? `${crowdHolder.liveRoomRoute}?from=home-1` : crowdHolder.profileRoute}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textDecoration: 'none',
              zIndex: 30,
            }}
            onClick={crowdHolder.isLive && crowdHolder.liveRoomRoute ? (e: React.MouseEvent) => {
              e.preventDefault();
              setPendingOrbit({
                id: crowdHolder.slug,
                title: `${crowdHolder.name} — LIVE`,
                viewers: crowdHolder.audienceCount ?? 0,
                status: 'live',
                access: 'free',
                accentColor: '#E63000',
                roomRoute: `${crowdHolder.liveRoomRoute}?from=home-1`,
                venueIndex: 1,
                shape: 'circle',
              });
            } : undefined}
          >
            <div
              style={{
                width: 'min(108px, 18vw)',
                height: 'min(108px, 18vw)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${accentColor}55, ${bgColor})`,
                border: `3px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}66, inset 0 0 20px ${accentColor}22`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'h1Pulse 2.5s ease-in-out infinite',
                cursor: 'pointer',
              }}
            >
              {/* Crown above */}
              <div
                style={{
                  fontSize: 'min(28px, 5vw)',
                  animation: 'h1CrownFloat 3s ease-in-out infinite',
                  marginBottom: 2,
                  filter: `drop-shadow(0 0 8px #FFD700)`,
                }}
              >
                👑
              </div>
              {/* Rule 2: Crown holder — LIVE VIDEO → MOTION POSTER → STATIC */}
              <MotionPosterPlayer
                isLive={crowdHolder.isLive}
                liveRoomRoute={crowdHolder.liveRoomRoute}
                introVideoUrl={crowdHolder.introVideoUrl}
                motionPosterUrl={crowdHolder.motionPosterUrl}
                staticImageUrl={crowdHolder.profileImageUrl}
                alt={crowdHolder.name}
                audienceCount={crowdHolder.audienceCount}
                showLiveOverlay={false}
                replayOnHover
                style={{
                  width: 'min(50px, 9vw)',
                  height: 'min(50px, 9vw)',
                  borderRadius: '50%',
                  border: `2px solid ${accentColor}`,
                  marginBottom: 4,
                  flexShrink: 0,
                }}
              />
              <div style={{
                fontSize: 'min(9px, 1.8vw)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.05em',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                marginTop: 2,
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {crowdHolder.name}
              </div>
              <div style={{
                fontSize: 'min(8px, 1.5vw)',
                fontWeight: 700,
                color: '#FFD700',
                fontFamily: "'Inter', sans-serif",
              }}>
                #1 {genreKey}
              </div>
            </div>
          </Link>

          {/* Orbit cards — CSS-driven rotation for smoother mobile runtime */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              animation: 'h1OrbitCycle 13s ease-in-out infinite',
              willChange: 'transform',
              transform: 'translateZ(0)',
              zIndex: 22,
              pointerEvents: 'none',
            }}
          >
            {visibleOrbitCards.map((performer, i) => (
              <OrbitCard
                key={performer.slug}
                performer={performer}
                index={i}
                total={visibleOrbitCards.length}
                radius={orbitRadius}
                compactMode={isMobileViewport}
                accentColor={accentColor}
                isBrokenImage={Boolean(brokenOrbitImages[performer.slug])}
                onImageError={(slug) => setBrokenOrbitImages(prev => ({ ...prev, [slug]: true }))}
                onOpenLive={(p) => {
                  setPendingOrbit({
                    id: p.slug,
                    title: `${p.name} LIVE`,
                    viewers: 0,
                    status: 'live',
                    access: 'free',
                    accentColor: accentColor,
                    roomRoute: `${p.liveRoomRoute}?from=home-1`,
                    venueIndex: 1,
                    shape: 'oct',
                  });
                }}
              />
            ))}
          </div>

          {/* ── Stream & Win Radio — fixed card at 9 o'clock position in orbit ──
               Stays upright (not in the spinning container). Links to real submission routes. */}
          {(() => {
            const radioState: 'accepting' | 'reviewing' | 'winners' =
              radioData.live > 0 ? 'winners' :
              radioData.pending > 0 ? 'reviewing' :
              'accepting';
            const radioRealHref =
              radioState === 'winners' ? '/rankings' :
              '/submit';
            const radioLabel =
              radioState === 'winners' ? 'WINNERS UP' :
              radioState === 'reviewing' ? `REVIEWING ${radioData.pending}` :
              'SUBMIT NOW';
            const radioSub =
              radioState === 'winners' ? 'View Results →' :
              radioState === 'reviewing' ? 'Songs in queue' :
              'Now accepting';
            const radioColor = radioState === 'winners' ? '#FFD700' : radioState === 'reviewing' ? '#FF2DAA' : '#00E5FF';
            const radioEmoji = radioState === 'winners' ? '🏆' : radioState === 'reviewing' ? '⏳' : '📻';
            // Position at 9 o'clock (left side) of orbit ring
            const leftPct = 50 - orbitRadius;
            return (
              <Link href={radioRealHref} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 42,
                  width: isMobileViewport ? 58 : 72,
                  background: `linear-gradient(135deg, ${radioColor}18, rgba(5,5,16,0.96))`,
                  border: `2px solid ${radioColor}66`,
                  borderRadius: 8,
                  padding: '8px 6px',
                  textAlign: 'center',
                  animation: 'h1RadioPulse 2.8s ease-in-out infinite',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: isMobileViewport ? 16 : 20, lineHeight: 1, marginBottom: 3 }}>{radioEmoji}</div>
                  <div style={{ fontSize: isMobileViewport ? 6 : 7, fontWeight: 900, color: radioColor, letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>
                    STREAM & WIN
                  </div>
                  <div style={{ fontSize: isMobileViewport ? 6 : 7, fontWeight: 900, color: '#fff', fontFamily: "'Inter',sans-serif", marginTop: 2, letterSpacing: '0.04em' }}>
                    {radioLabel}
                  </div>
                  <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>
                    {radioSub}
                  </div>
                </div>
              </Link>
            );
          })()}

          {/* Sticker overlays */}
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '-4%',
              background: `linear-gradient(135deg, ${accentColor}, #FFD700)`,
              color: '#050510',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.1em',
              fontFamily: "'Inter', sans-serif",
              transform: 'rotate(-8deg)',
              boxShadow: `0 4px 20px ${accentColor}55`,
              animation: 'h1StickerPop 0.4s ease',
              zIndex: 40,
              whiteSpace: 'nowrap',
            }}
          >
            {genreConfig.emoji} {genreKey} GENRE BATTLE!
          </div>

          <Link href="/live/rooms/cypher-arena" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '12%',
                right: '-2%',
                background: 'linear-gradient(135deg, #AA2DFF, #FF2DAA)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontFamily: "'Inter', sans-serif",
                transform: 'rotate(5deg)',
                boxShadow: '0 4px 20px rgba(170,45,255,0.5)',
                animation: 'h1StickerPop 0.5s ease',
                zIndex: 40,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🔘 CYPHER ARENA OPEN
            </div>
          </Link>

          <Link href="/rankings/vote" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '22%',
                left: '-2%',
                background: 'rgba(20,10,40,0.92)',
                border: '2px solid #FFD700',
                color: '#FFD700',
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.06em',
                fontFamily: "'Inter', sans-serif",
                transform: 'rotate(-4deg)',
                boxShadow: '0 4px 16px rgba(255,215,0,0.3)',
                zIndex: 40,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🗳️ VOTING OPEN: VOTE FOR #4!
            </div>
          </Link>

          {/* ── BACK / NEXT orbit navigation ── */}
          <div style={{ position: 'absolute', left: 0, bottom: 8, zIndex: 45 }}>
            <button
              onClick={() => setGenreIdx((i) => (i - 1 + GENRE_KEYS.length) % GENRE_KEYS.length)}
              style={{ background: 'rgba(10,6,20,0.85)', border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 9, fontWeight: 900, padding: '4px 9px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}
            >
              ◀ BACK
            </button>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 8, zIndex: 45 }}>
            <button
              onClick={() => setGenreIdx((i) => (i + 1) % GENRE_KEYS.length)}
              style={{ background: 'rgba(10,6,20,0.85)', border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 9, fontWeight: 900, padding: '4px 9px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}
            >
              NEXT ▶
            </button>
          </div>
        </div>

          </div>
          {/* ════ RIGHT PANEL — RANKS/ADS/PROMO tabs + collapse ════ */}
          <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: 8 }}>
            {/* Collapse toggle strip */}
            <div onClick={() => setRightOpen(!rightOpen)} style={{ background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: rightOpen ? '5px 0 0 5px' : '5px', width: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: 7, fontWeight: 800, color: '#FFD700', letterSpacing: '0.1em', userSelect: 'none', flexShrink: 0, transform: 'rotate(180deg)' }}>
              {rightOpen ? '◂ PANEL' : 'PANEL ▸'}
            </div>
            <div style={{ width: rightOpen ? 'clamp(120px,15vw,160px)' : 0, overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
              <div style={{ background: 'rgba(6,2,26,0.95)', border: '1px solid rgba(255,215,0,0.35)', borderRadius: '0 8px 8px 0', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                <div style={{ padding: '6px 7px 5px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 7, fontWeight: 900, color: '#FFD700', letterSpacing: '0.11em', marginBottom: 3 }}>LIVE ACTIVITY</div>
                  <div style={{ fontSize: 7, fontWeight: 800, color: '#00E5FF', letterSpacing: '0.06em' }}>{activeRightRail.label.toUpperCase()}</div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 6px', fontSize: 9 }}>
                  {rightRailEntries.length > 0 ? rightRailEntries.map((item, i) => (
                    <Link key={`${activeRightRail.label}-${item.name}-${i}`} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: i % 2 === 0 ? '#FFD700' : '#00E5FF', boxShadow: i % 2 === 0 ? '0 0 5px #FFD700' : '0 0 5px #00E5FF', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.42)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', textAlign: 'center', paddingTop: 12 }}>No data available yet</div>
                  )}
                  <Link href={activeRightRail.route} style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', marginTop: 7, padding: '5px', fontSize: 7, fontWeight: 800, border: '1px solid rgba(255,215,0,0.35)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em' }}>OPEN VIEW</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div> {/* End Cinematic 3-Rail Grid */}
        </div> {/* End orbital section wrapper */}

        {/* ══ MOVING RAIL #2 — scrolls RIGHT (opposite direction), rainbow animated bg ══ */}
        <div style={{ width: '100%', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF,#00E5FF,#FFD700,#FF2DAA)', backgroundSize: '400% 100%', animation: 'h1ColorBg 22s linear infinite', overflow: 'hidden', height: 26, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'inline-block', whiteSpace: 'nowrap', animation: 'h1RailRight 56s linear infinite', willChange: 'transform' }}>
            {['★ SINGERS WANTED — VOCAL SHOWCASE OPEN', '▶ DJS WANTED — GLOBAL MIXES LIVE', '◆ COMEDIANS NEEDED — JOKE-OFF ROOMS OPEN', '● DANCERS WANTED — DANCE CREWS STEP IN', '◉ WRITERS NEEDED — STORYTELLERS WELCOME', '▷ ADVERTISERS WANTED — REACH LIVE AUDIENCES', '◈ PRODUCERS WANTED — BEAT BATTLES TONIGHT', '◆ CHOIRS + MARCHING BANDS WANTED — JOIN NOW', '★ BLOGGERS + NEWS WRITERS + STREAMERS WELCOME', '▶ DISCOVERY CHARTS LIVE — NEW TALENT INDEXED'].map((msg, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 900, color: '#F8FAFF', padding: '0 34px', lineHeight: '26px', whiteSpace: 'nowrap', letterSpacing: '0.045em', textShadow: '0 1px 0 rgba(0,0,0,0.72)', fontFamily: "'Inter',sans-serif" }}>{msg}</span>
            ))}
            {['★ SINGERS WANTED — VOCAL SHOWCASE OPEN', '▶ DJS WANTED — GLOBAL MIXES LIVE', '◆ COMEDIANS NEEDED — JOKE-OFF ROOMS OPEN', '● DANCERS WANTED — DANCE CREWS STEP IN', '◉ WRITERS NEEDED — STORYTELLERS WELCOME', '▷ ADVERTISERS WANTED — REACH LIVE AUDIENCES', '◈ PRODUCERS WANTED — BEAT BATTLES TONIGHT', '◆ CHOIRS + MARCHING BANDS WANTED — JOIN NOW', '★ BLOGGERS + NEWS WRITERS + STREAMERS WELCOME', '▶ DISCOVERY CHARTS LIVE — NEW TALENT INDEXED'].map((msg, i) => (
              <span key={`d-${i}`} style={{ fontSize: 11, fontWeight: 900, color: '#F8FAFF', padding: '0 34px', lineHeight: '26px', whiteSpace: 'nowrap', letterSpacing: '0.045em', textShadow: '0 1px 0 rgba(0,0,0,0.72)', fontFamily: "'Inter',sans-serif" }}>{msg}</span>
            ))}
          </div>
        </div>

        {/* ── P6: Three independent video monitors (9500 / 13200 / 17000 ms, 2300ms stagger) ── */}
        <div style={{ width: '100%', maxWidth: 900, padding: '12px 10px 0', display: 'flex', gap: 10 }}>
          <PerformerMonitor performers={performers} offsetIdx={0} intervalMs={9500}  accentColor={accentColor} delayMs={0}    channelNum={1} />
          <PerformerMonitor performers={performers} offsetIdx={3} intervalMs={13200} accentColor={accentColor} delayMs={2300} channelNum={2} />
          <PerformerMonitor performers={performers} offsetIdx={6} intervalMs={17000} accentColor={accentColor} delayMs={4600} channelNum={3} />
        </div>

        {/* ── Sponsor Ad Rail — Paid → Internal Promo → Advertise CTA ── */}
        {(() => {
          const INTERNAL_PROMOS = [
            { label: '🎵 Beat Marketplace', href: '/beats', color: '#FFD700' },
            { label: '🎙 Submit Your Track', href: '/upload', color: '#00E5FF' },
            { label: '🏆 Join This Week\'s Battle', href: '/battles', color: '#AA2DFF' },
          ] as const;
          const slots = [0, 1, 2].map((i) => {
            const paid = getActiveSponsorForZone(`home-1-sponsorRail-${i}`);
            if (paid) return { label: paid.name, href: paid.ctaHref, cta: paid.ctaLabel, color: paid.accentColor, isPaid: true };
            const promo = INTERNAL_PROMOS[i]!;
            return { label: promo.label, href: promo.href, cta: i === 2 ? '→' : 'VIEW', color: promo.color, isPaid: false };
          });
          const advertiseSlot = getActiveSponsorForZone('home-1-sponsorRail-2') ? null : { label: '📢 ADVERTISE FROM $25', href: '/sponsors/advertise', cta: '→', color: '#FF2DAA' };
          const displaySlots = advertiseSlot ? [...slots.slice(0, 2), advertiseSlot] : slots;
          return (
            <div style={{ width: '100%', maxWidth: 900, padding: '8px 10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {displaySlots.map((slot, i) => (
                <div key={i} style={{ background: `rgba(${slot.color === '#FFD700' ? '255,215,0' : slot.color === '#00E5FF' ? '0,229,255' : slot.color === '#AA2DFF' ? '170,45,255' : '255,45,170'},0.06)`, border: `1px solid ${slot.color}33`, borderRadius: 5, padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 4 }}>{slot.label}</span>
                  <Link href={slot.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button style={{ background: `${slot.color}22`, color: slot.color, border: `1px solid ${slot.color}44`, borderRadius: 3, fontSize: 7, padding: '2px 6px', cursor: 'pointer', fontWeight: 700 }}>{slot.cta}</button>
                  </Link>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Genre navigation dots ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          {GENRE_KEYS.map((g, i) => {
            const gd = GENRE_CONFIG[g]!;
            const active = i === genreIdx % GENRE_KEYS.length;
            return (
              <button
                key={g}
                onClick={() => setGenreIdx(i)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: `1.5px solid ${active ? gd.color : gd.color + '44'}`,
                  background: active ? `${gd.color}22` : 'transparent',
                  color: active ? gd.color : `${gd.color}88`,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 10px ${gd.color}44` : 'none',
                }}
              >
                {gd.emoji} {g.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* ── Tabloid ticker — horizontal LEFT-scroll chyron ── */}
        <div
          style={{
            width: '100%',
            background: `linear-gradient(90deg, #1a0050, ${accentColor}22, #1a0050)`,
            borderTop: `1px solid ${accentColor}33`,
            borderBottom: `1px solid ${accentColor}33`,
            padding: '6px 0',
            marginTop: 16,
            overflow: 'hidden',
            height: 32,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontWeight: 900,
              color: '#FFD700',
              letterSpacing: '0.17em',
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 1px 0 rgba(0,0,0,0.78)',
              animation: 'h1TickerScroll 130s linear infinite',
              willChange: 'transform',
            }}
          >
            {TICKER_MSGS.map((msg, i) => (
              <span key={i} style={{ marginRight: '8em' }}>{msg}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {TICKER_MSGS.map((msg, i) => (
              <span key={`d-${i}`} style={{ marginRight: '8em' }}>{msg}</span>
            ))}
          </div>
        </div>

        {/* ── All performers grid (10 cards) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            padding: '20px 16px 8px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            {genreConfig.emoji} Top 10 — {genreKey} · Bands · Choirs · Marching Bands · Creators
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 10,
            }}
          >
            {performers.map((p, i) => (
              <Link
                key={p.slug}
                href={`/articles/performer/${p.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}18, rgba(10,6,20,0.8))`,
                    border: `1px solid ${accentColor}${i === 0 ? '88' : '33'}`,
                    borderRadius: 10,
                    padding: '10px 10px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = accentColor;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${accentColor}44`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}${i === 0 ? '88' : '33'}`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      fontSize: 16,
                      fontWeight: 900,
                      color: i === 0 ? '#FFD700' : `${accentColor}88`,
                      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    #{p.rank}
                  </div>

                  <div style={{ fontSize: 26, marginBottom: 4 }}>{p.emoji}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.01em',
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 2,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      color: accentColor,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.06em',
                    }}
                  >
                    {p.score.toLocaleString()} pts
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.35)',
                      fontFamily: "'Inter', sans-serif",
                      borderTop: `1px solid ${accentColor}22`,
                      paddingTop: 5,
                    }}
                  >
                    Read Article →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA strip ── */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '16px 16px 0',
          }}
        >
          {[
            { label: '🎤 JOIN AS ARTIST', href: '/signup?role=artist', bg: accentColor, color: '#050510' },
            { label: '⚔️ BATTLE TONIGHT', href: '/battles', bg: '#FF2DAA', color: '#fff' },
            { label: '📰 READ THE INDEX', href: '/magazine', bg: 'transparent', color: '#FFD700', border: '#FFD700' },
            { label: '👀 FAN MODE', href: '/signup?role=fan', bg: 'transparent', color: '#00FF88', border: '#00FF88' },
          ].map((btn) => (
            <Link
              key={btn.label}
              href={btn.href}
              style={{
                padding: '10px 20px',
                background: btn.bg || 'transparent',
                border: `2px solid ${btn.border || btn.bg}`,
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 900,
                color: btn.color,
                textDecoration: 'none',
                letterSpacing: '0.08em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: btn.bg !== 'transparent' ? `0 0 16px ${btn.bg}55` : 'none',
              }}
            >
              {btn.label}
            </Link>
          ))}
        </div>

        {/* ── Weekly Cyphers bottom bar ── */}
        <Link
          href="/articles?category=cypher"
          style={{
            display: 'block',
            width: '100%',
            marginTop: 24,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, #2D0D6E, #1a0050, #2D0D6E)`,
              borderTop: `2px solid ${accentColor}`,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>⚡</span>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'clamp(18px, 4vw, 26px)',
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  color: '#FFD700',
                  letterSpacing: '0.04em',
                }}
              >
                Discovery Spotlight
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.06em',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Singers • Choirs • Marching Bands • Writers • Bloggers • News Writers • Actors • Streamers Welcome
              </div>
            </div>
            <span style={{ fontSize: 18 }}>⚡</span>
          </div>
        </Link>

        {/* ══ NEWS BELT + INTERVIEWS — 2-column section ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '16px 10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Left: News Belt */}
          <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#FFD700', letterSpacing: '0.18em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>◆ NEWS BELT</div>
            {[
              { text: 'SINGERS WANTED — VOCAL SHOWCASE SIGNUPS OPEN NOW', href: '/signup?role=artist' },
              { text: 'DJS WANTED — GLOBAL MIX ROOMS ACCEPTING SETS', href: '/signup?role=artist' },
              { text: 'COMEDIANS NEEDED — OPEN MIC CHALLENGES LIVE', href: '/signup?role=artist' },
              { text: 'ALL INSTRUMENTS WELCOME — JOIN THE GLOBAL INDEX', href: '/home/1-2' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, borderLeft: '2px solid rgba(255,215,0,0.3)', paddingLeft: 6, fontFamily: "'Inter',sans-serif" }}>
                  {item.text}
                </div>
              </Link>
            ))}
          </div>
          {/* Right: Interviews */}
          <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#00E5FF', letterSpacing: '0.18em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>🎙 INTERVIEWS</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif" }}>DISCOVERY DESK</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 3, fontFamily: "'Inter',sans-serif" }}>
                &ldquo;Singers, DJs, comedians, dancers, writers, producers, beatmakers, advertisers, and instrumentalists all have live discovery lanes on TMI right now.&rdquo;
              </div>
              <Link href="/signup" style={{ textDecoration: 'none' }}><div style={{ fontSize: 7, color: '#00E5FF', marginTop: 4, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>JOIN THE NETWORK →</div></Link>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif" }}>RECRUITMENT BOARD</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 3, fontFamily: "'Inter',sans-serif" }}>
                &ldquo;Dancers wanted. Writers needed. Advertisers wanted. Producers wanted. Beatmakers wanted. All instruments welcome.&rdquo;
              </div>
              <Link href="/home/1-2" style={{ textDecoration: 'none' }}><div style={{ fontSize: 7, color: '#00E5FF', marginTop: 4, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>VIEW RANKINGS →</div></Link>
            </div>
          </div>
        </div>

        {/* ══ BIG CTA BUTTONS — 7 full-width ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '14px 10px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { label: '🎤 JOIN TMI', href: '/signup', bg: 'rgba(255,45,170,0.18)', color: '#FF2DAA', border: 'rgba(255,45,170,0.5)' },
            { label: '📰 READ MAGAZINE', href: '/magazine', bg: 'rgba(255,215,0,0.12)', color: '#FFD700', border: 'rgba(255,215,0,0.4)' },
            { label: '⚡ VOTE LIVE', href: '/battles', bg: 'rgba(230,48,0,0.15)', color: '#E63000', border: 'rgba(230,48,0,0.4)' },
            { label: '🥊 JOIN BATTLE', href: '/battles/challenge', bg: 'rgba(170,45,255,0.15)', color: '#AA2DFF', border: 'rgba(170,45,255,0.4)' },
            { label: '🎭 SEE ROOMS', href: '/live/lobby', bg: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: 'rgba(0,229,255,0.35)' },
            { label: '🔥 CYPHER', href: '/battles/cypher', bg: 'rgba(0,255,127,0.1)', color: '#00FF7F', border: 'rgba(0,255,127,0.35)' },
            { label: '💰 SPONSOR', href: '/sponsors', bg: 'rgba(255,215,0,0.08)', color: '#FFD700', border: 'rgba(255,215,0,0.3)' },
          ].map((btn) => (
            <Link key={btn.label} href={btn.href} style={{ textDecoration: 'none', gridColumn: btn.label.includes('CYPHER') ? 'span 1' : undefined }}>
              <div style={{ background: btn.bg, border: `1px solid ${btn.border}`, borderRadius: 6, padding: '8px 4px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: btn.color, letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif", cursor: 'pointer' }}>
                {btn.label}
              </div>
            </Link>
          ))}
        </div>

        {/* ══ LIVE STATS BAR — ticking counters ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '10px 10px 0', display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {[
            { label: 'LIVE VENUES', value: venues.length, color: '#00E5FF', icon: '🏟' },
            { label: 'LIVE STREAMS', value: livePerformers.length, color: '#FF2DAA', icon: '👁' },
            { label: 'TIPS SENT', value: '$0', color: '#FFD700', icon: '💰' },
            { label: 'VOTES CAST', value: voteCount > 0 ? voteCount.toLocaleString() : '—', color: '#AA2DFF', icon: '⚡' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, background: `${stat.color}08`, border: `1px solid ${stat.color}25`, borderRadius: 5, padding: '6px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 13 }}>{stat.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: stat.color, fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ══ BOTTOM NAV BAR ══ */}
        <div style={{ width: '100%', marginTop: 20, background: 'rgba(6,2,26,0.96)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Link href="/login" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>SIGN IN</div></Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 800, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 4, padding: '3px 8px', letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>+ SUBMIT</div></Link>
          <Link href="/about/guide" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>OPEN GUIDE</div></Link>
          <Link href="/about" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#FFD700', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>BETA FEEDBACK</div></Link>
        </div>

      </div>
    </div>
    </>
  );
}
