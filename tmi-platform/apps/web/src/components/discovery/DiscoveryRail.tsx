import Link from 'next/link';
import { PERFORMER_REGISTRY, getLivePerformers } from '@/lib/performers/PerformerRegistry';
import { VENUE_REGISTRY, getLiveVenues } from '@/lib/venues/VenueRegistry';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';
import { getActiveSponsorForZone } from '@/lib/commerce/SponsorRegistry';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';

export type DiscoveryRailType =
  | 'articles'
  | 'performers'
  | 'liveRooms'
  | 'games'
  | 'sponsors'
  | 'venues'
  | 'writers';

interface Props {
  type: DiscoveryRailType;
  tags?: string[];
  exclude?: string;
  limit?: number;
  label?: string;
  accentColor?: string;
}

// ── Games seed — static until a GameRegistry exists ──────────────────────────
const GAMES = [
  { slug: 'weekly-cypher',   name: 'Weekly Cypher',      icon: '🎙️', href: '/live/rooms/cypher-arena',     desc: 'Freestyle battle — all genres',  viewers: 15200 },
  { slug: 'monday-stage',    name: 'Monday Night Stage', icon: '🎭', href: '/games/monday-night',            desc: 'Live performance competition',    viewers: 8400  },
  { slug: 'stream-win',      name: 'Stream & Win Radio', icon: '📻', href: '/live/lobby?filter=stream-win', desc: 'Listen, win real cash & XP',     viewers: 12000 },
  { slug: 'battle-stage',    name: 'Battle Stage',       icon: '⚔️', href: '/live/rooms/battle-stage',      desc: 'Song-for-song battles',          viewers: 9800  },
  { slug: 'comedy-night',    name: 'Comedy Night',       icon: '😂', href: '/games/comedy-night',           desc: 'Stand-up + audience voting',     viewers: 4200  },
  { slug: 'deal-or-feud',   name: 'Deal or Feud 1000',  icon: '🎮', href: '/games/deal-or-feud',           desc: 'Game show — win platform cash',  viewers: 6100  },
  { slug: 'monthly-idol',    name: 'Monthly Idol',       icon: '👑', href: '/games/monthly-idol',           desc: 'Season-long ranking competition', viewers: 21000 },
  { slug: 'dance-battle',    name: 'Dance Battle Arena', icon: '🕺', href: '/live/rooms/dance-battle',      desc: 'Crew vs crew — live judging',    viewers: 3800  },
];

// ── Sponsor seed ─────────────────────────────────────────────────────────────
const SPONSOR_SEED = [
  { name: 'Beat Marketplace',   tagline: 'Beats from $25',        href: '/beats',             color: '#FFD700', icon: '🎵' },
  { name: 'BerntoutStudio AI',  tagline: 'AI studio tools',       href: '/sponsors/berntout', color: '#00E5FF', icon: '🎙️' },
  { name: 'Fan Club Premium',   tagline: 'Support your artist',   href: '/fan-club',          color: '#FF2DAA', icon: '⭐' },
  { name: 'Advertise on TMI',   tagline: 'Reach live audiences',  href: '/sponsors/advertise',color: '#AA2DFF', icon: '📢' },
];

function cardBase(accentColor: string) {
  return {
    background: `linear-gradient(145deg, rgba(10,6,30,0.95), rgba(5,3,16,0.98))`,
    border: `1px solid ${accentColor}33`,
    borderRadius: 10,
    overflow: 'hidden' as const,
    flexShrink: 0,
    width: 180,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: 'pointer' as const,
  };
}

export default function DiscoveryRail({ type, tags = [], exclude, limit = 6, label, accentColor = '#00FFFF' }: Props) {
  let title = label;
  let content: React.ReactNode = null;

  // ── ARTICLES ───────────────────────────────────────────────────────────────
  if (type === 'articles') {
    title = title ?? '📰 MORE STORIES';
    const articles = MAGAZINE_ISSUE_1
      .filter(a => a.slug !== exclude)
      .filter(a => tags.length === 0 || a.tags.some(t => tags.includes(t)))
      .slice(0, limit);
    const fallback = articles.length < 3
      ? MAGAZINE_ISSUE_1.filter(a => a.slug !== exclude).slice(0, limit)
      : articles;

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {fallback.map(a => (
          <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase(a.heroColor), width: 200 }}>
              <div style={{ height: 6, background: a.heroColor }} />
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: a.heroColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {a.icon} {a.category}
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1.35, marginBottom: 5 }}>{a.title}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{a.subtitle.slice(0, 60)}…</div>
                <div style={{ marginTop: 8, fontSize: 8, fontWeight: 700, color: a.heroColor, letterSpacing: '0.08em' }}>READ →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // ── PERFORMERS ─────────────────────────────────────────────────────────────
  if (type === 'performers') {
    title = title ?? '🎤 FEATURED ARTISTS';
    const live = getLivePerformers();
    const all = [...live, ...PERFORMER_REGISTRY.filter(p => !p.isLive)];
    const filtered = all
      .filter(p => p.slug !== exclude)
      .filter(p => tags.length === 0 || tags.some(t => p.category.toLowerCase().includes(t.toLowerCase())))
      .slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {filtered.map(p => (
          <Link key={p.slug} href={p.isLive ? p.liveRoomRoute : p.profileRoute} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase(accentColor), width: 150 }}>
              {/* Rule 2: LIVE VIDEO → MOTION POSTER → STATIC IMAGE */}
              <div style={{ position: 'relative' }}>
                <MotionPosterPlayer
                  isLive={p.isLive}
                  liveRoomRoute={p.liveRoomRoute}
                  introVideoUrl={p.introVideoUrl}
                  motionPosterUrl={p.motionPosterUrl}
                  staticImageUrl={p.profileImageUrl}
                  alt={p.name}
                  height={120}
                  audienceCount={p.audienceCount}
                />
                <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 10, background: 'rgba(10,6,20,0.85)', borderRadius: 4, padding: '2px 5px', fontSize: 8, fontWeight: 700, color: '#FFD700' }}>
                  #{p.rank}
                </div>
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{p.category} · {p.city}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: accentColor, letterSpacing: '0.06em' }}>
                  {p.isLive ? 'JOIN LIVE →' : 'VIEW PROFILE →'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // ── LIVE ROOMS ─────────────────────────────────────────────────────────────
  if (type === 'liveRooms') {
    title = title ?? '🎥 LIVE NOW';
    const performers = getLivePerformers().slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {performers.map(p => (
          <Link key={p.roomId} href={p.liveRoomRoute} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase('#E63000'), width: 170 }}>
              {/* Rule 2: LIVE VIDEO → MOTION POSTER → STATIC IMAGE with live overlay */}
              <MotionPosterPlayer
                isLive
                liveRoomRoute={p.liveRoomRoute}
                introVideoUrl={p.introVideoUrl}
                motionPosterUrl={p.motionPosterUrl}
                staticImageUrl={p.profileImageUrl}
                alt={p.name}
                height={110}
                audienceCount={p.audienceCount}
              />
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{p.category}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>{p.timeLive} live</div>
                <div style={{ background: '#E63000', borderRadius: 4, padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>
                  JOIN NOW →
                </div>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/live/lobby" style={{ textDecoration: 'none' }}>
          <div style={{ ...cardBase('#E63000'), width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 8 }}>
            <div style={{ fontSize: 24 }}>🎥</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#E63000', textAlign: 'center', letterSpacing: '0.06em' }}>ALL LIVE ROOMS</div>
          </div>
        </Link>
      </div>
    );
  }

  // ── GAMES ──────────────────────────────────────────────────────────────────
  if (type === 'games') {
    title = title ?? '🎮 GAMES & BATTLES';
    const games = GAMES.slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {games.map(g => (
          <Link key={g.slug} href={g.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase('#AA2DFF'), width: 160 }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(170,45,255,0.3), rgba(255,45,170,0.15))', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {g.icon}
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{g.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>{g.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 8, color: '#AA2DFF', fontWeight: 700 }}>{g.viewers.toLocaleString()} watching</div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: '#AA2DFF', letterSpacing: '0.06em' }}>JOIN →</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // ── SPONSORS ───────────────────────────────────────────────────────────────
  if (type === 'sponsors') {
    title = title ?? '💼 SPONSORS & PARTNERS';
    // Try live zones first, fall back to seed
    const activeZones = ['home-1-sponsorRail-0', 'home-1-sponsorRail-1', 'home-2-sponsorBanner-0'].map(z => getActiveSponsorForZone(z)).filter(Boolean);
    const sponsorItems = activeZones.length >= 2
      ? activeZones.slice(0, limit).map(s => ({ name: s!.name, tagline: s!.tagline, href: s!.ctaHref, color: s!.accentColor, icon: '💼' }))
      : SPONSOR_SEED.slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {sponsorItems.map((s, i) => (
          <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase(s.color), width: 160 }}>
              <div style={{ height: 50, background: `linear-gradient(135deg, ${s.color}22, rgba(10,6,30,0.95))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {s.icon}
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.tagline}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>LEARN MORE →</div>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/sponsors/advertise" style={{ textDecoration: 'none' }}>
          <div style={{ ...cardBase('#FF2DAA'), width: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 150, gap: 6, padding: 12 }}>
            <div style={{ fontSize: 20 }}>📢</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#FF2DAA', textAlign: 'center', letterSpacing: '0.06em', lineHeight: 1.4 }}>ADVERTISE FROM $25</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Reach live audiences</div>
          </div>
        </Link>
      </div>
    );
  }

  // ── VENUES ─────────────────────────────────────────────────────────────────
  if (type === 'venues') {
    title = title ?? '🏟️ VENUES';
    const venues = [...getLiveVenues(), ...VENUE_REGISTRY.filter(v => !v.isLive)]
      .filter(v => v.slug !== exclude)
      .slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {venues.map(v => (
          <Link key={v.slug} href={`/venues/${v.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase('#FF6B35'), width: 160 }}>
              <div style={{ height: 70, background: `linear-gradient(135deg, rgba(255,107,53,0.3), rgba(10,6,30,0.95))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 26 }}>🏟️</span>
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 2, lineHeight: 1.2 }}>{v.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{v.city}</div>
                {v.isLive && (
                  <div style={{ fontSize: 8, color: '#E63000', fontWeight: 700, marginBottom: 4 }}>🔴 LIVE · {v.audienceCount.toLocaleString()}</div>
                )}
                <div style={{ fontSize: 8, fontWeight: 700, color: '#FF6B35', letterSpacing: '0.06em' }}>
                  {v.isLive ? 'JOIN SHOW →' : 'BOOK VENUE →'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // ── WRITERS ────────────────────────────────────────────────────────────────
  if (type === 'writers') {
    title = title ?? '✍️ FEATURED WRITERS';
    const authorSet = new Map<string, { name: string; articles: number; lastSlug: string; lastTitle: string }>();
    MAGAZINE_ISSUE_1.forEach(a => {
      const existing = authorSet.get(a.author);
      if (existing) {
        authorSet.set(a.author, { ...existing, articles: existing.articles + 1 });
      } else {
        authorSet.set(a.author, { name: a.author, articles: 1, lastSlug: a.slug, lastTitle: a.title });
      }
    });
    const writers = Array.from(authorSet.values())
      .filter(w => w.name !== exclude)
      .sort((a, b) => b.articles - a.articles)
      .slice(0, limit);

    content = (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {writers.map(w => (
          <Link key={w.name} href={`/magazine/article/${w.lastSlug}`} style={{ textDecoration: 'none' }}>
            <div style={{ ...cardBase('#00FF88'), width: 160 }}>
              <div style={{ height: 55, background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(10,6,30,0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                ✍️
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{w.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>{w.articles} article{w.articles !== 1 ? 's' : ''}</div>
                <div style={{ fontSize: 8, color: '#00FF88', fontWeight: 700, letterSpacing: '0.06em' }}>READ LATEST →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (!content) return null;

  return (
    <section style={{ marginTop: 32, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, background: accentColor, borderRadius: 2, display: 'inline-block' }} />
          {title}
        </div>
      </div>
      <style>{`.dr-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="dr-scroll" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {content}
      </div>
    </section>
  );
}
