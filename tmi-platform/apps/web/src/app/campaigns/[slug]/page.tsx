import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEED_FEEDS } from '@/lib/broadcast/BroadcastSeedFeeds';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { CAMPAIGNS, type CampaignConfig, getCampaignBySlug as getCampaign } from '@/lib/campaigns/CampaignRegistry';

export function generateStaticParams() {
  return CAMPAIGNS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cfg = getCampaign(params.slug);
  if (!cfg) return { title: 'Campaign — TMI' };
  return { title: `${cfg.title} — The Musician's Index`, description: cfg.subtitle };
}

const STATUS_BADGE: Record<CampaignConfig['status'], { label: string; color: string }> = {
  upcoming: { label: '📅 UPCOMING',  color: '#FFD700' },
  live:     { label: '🔴 LIVE NOW',  color: '#FF2DAA' },
  ended:    { label: '✅ ENDED',     color: '#00FF88' },
};

export default function CampaignPage({ params }: { params: { slug: string } }) {
  const cfg = getCampaign(params.slug);
  if (!cfg) notFound();

  const { accentColor: accent, heroColor } = cfg;
  const badge = STATUS_BADGE[cfg.status];
  const liveFeeds = SEED_FEEDS.filter(f => f.status === 'live').slice(0, 3);
  const articles = getLatestEditorialArticles(3);

  const start = new Date(cfg.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const end   = new Date(cfg.endDate).toLocaleDateString('en-US',   { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', overflowX: 'hidden' }}>

      <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, #FF2DAA, ${accent})` }} />

      {/* Nav bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/articles/c/events" style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>← EVENTS</Link>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', padding: '4px 12px', background: `${badge.color}14`, border: `1px solid ${badge.color}44`, color: badge.color, borderRadius: 3 }}>
          {badge.label}
        </div>
        <Link href={cfg.ticketHref} style={{ textDecoration: 'none', background: accent, color: '#050510', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 14, padding: '8px 20px' }}>
          GET TICKETS
        </Link>
      </div>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(155deg, ${heroColor}ee 0%, ${accent}22 50%, #050510 80%)`,
        padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,64px) clamp(32px,4vw,56px)',
        borderBottom: `2px solid ${accent}33`,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${accent}14 1px, transparent 1px)`, backgroundSize: '14px 14px', pointerEvents: 'none', opacity: 0.6 }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{cfg.emoji}</div>
          <h1 style={{
            fontFamily: "'Bebas Neue','Impact',sans-serif",
            fontSize: 'clamp(2.8rem,7vw,6.5rem)',
            fontWeight: 900, lineHeight: 0.9,
            color: '#fff', margin: '0 0 16px',
            textShadow: `2px 4px 0 ${accent}22`,
          }}>{cfg.title}</h1>
          <p style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(14px,1.8vw,20px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, maxWidth: 640, marginBottom: 32 }}>
            {cfg.subtitle}
          </p>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Dates',    value: `${start} – ${end}` },
              { label: 'Location', value: cfg.location },
              { label: 'Tickets',  value: cfg.ticketPrice },
              ...(cfg.prizePool ? [{ label: 'Prize Pool', value: cfg.prizePool }] : []),
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: accent, marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <Link href={cfg.ticketHref} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-block', background: accent, color: '#050510', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, padding: '16px 40px', boxShadow: `0 8px 32px ${accent}44`, letterSpacing: '0.04em' }}>
              {cfg.status === 'live' ? 'JOIN NOW →' : cfg.status === 'ended' ? 'VIEW REPLAY →' : 'GET TICKETS →'}
            </div>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px)' }}>

        {/* Description */}
        {cfg.description.map((p, i) => (
          i === 0
            ? <p key={i} style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(16px,1.8vw,20px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, marginBottom: 20, maxWidth: 720 }}>{p}</p>
            : <p key={i} style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, marginBottom: 20, maxWidth: 720 }}>{p}</p>
        ))}

        {/* Artist lineup */}
        <div style={{ margin: '40px 0' }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: accent, textTransform: 'uppercase', marginBottom: 20 }}>ARTIST LINEUP</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {cfg.artists.map((a, i) => (
              <div key={i} style={{ background: `${a.accentColor}0d`, border: `1px solid ${a.accentColor}33`, padding: '18px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{a.emoji}</div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: '#fff' }}>
                  {a.slug ? <Link href={`/profile/artist/${a.slug}`} style={{ textDecoration: 'none', color: '#fff' }}>{a.name}</Link> : a.name}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, color: a.accentColor, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>{a.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        {cfg.sponsors.length > 0 && (
          <div style={{ margin: '40px 0', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 20 }}>PRESENTED BY</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {cfg.sponsors.map((sp, i) => (
                <Link key={i} href={sp.ctaHref} style={{ textDecoration: 'none', flex: 1, minWidth: 180 }}>
                  <div style={{ background: `${sp.color}0d`, border: `2px solid ${sp.color}44`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{sp.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 800, color: '#fff' }}>{sp.name}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: sp.color, letterSpacing: '0.12em', marginTop: 4 }}>{sp.ctaLabel} →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Live rooms */}
        {liveFeeds.length > 0 && (
          <div style={{ margin: '40px 0' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#FF2DAA', textTransform: 'uppercase', marginBottom: 16 }}>🔴 LIVE ROOMS NOW</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveFeeds.map(f => (
                <Link key={f.id} href={f.href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: `${f.accentColor}0d`, border: `1px solid ${f.accentColor}22`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{f.avatarEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: '#fff' }}>{f.title}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: f.accentColor }}>{(f.viewerCount ?? 0).toLocaleString()} watching</div>
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: f.accentColor, letterSpacing: '0.1em' }}>JOIN →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related editorial */}
        <div style={{ borderTop: `2px solid ${accent}33`, paddingTop: 40 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: accent, textTransform: 'uppercase', marginBottom: 20 }}>FROM THE MAGAZINE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {articles.map(a => (
              <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px', borderTop: `3px solid ${accent}` }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 17, color: '#fff', lineHeight: 1.1 }}>{a.title}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>By {a.author}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Advertise CTA */}
        <div style={{ marginTop: 48, background: accent, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 24, color: '#050510' }}>RUN YOUR OWN CAMPAIGN</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(0,0,0,0.55)', fontWeight: 700 }}>Multi-artist events · Ticket sales · Sponsor integration</div>
          </div>
          <Link href="/sponsors" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#050510', color: accent, fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, padding: '10px 24px' }}>START CAMPAIGN →</div>
          </Link>
        </div>
      </div>

      <div style={{ height: 4, background: `linear-gradient(90deg, #FF2DAA, ${accent}, #AA2DFF)` }} />
    </div>
  );
}
