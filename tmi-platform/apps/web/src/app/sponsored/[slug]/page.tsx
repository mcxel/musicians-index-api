import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SPONSOR_PLACEMENTS } from '@/lib/editorial/SponsorPlacementModel';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { SEED_FEEDS } from '@/lib/broadcast/BroadcastRotationEngine';

// ─── Sponsor page registry ────────────────────────────────────────────────────
// A sponsor buys a full-page takeover. This registry maps slugs to their page config.
// Real sponsors are added here when a deal closes.

export interface SponsoredPageConfig {
  slug: string;
  sponsorName: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  primaryColor: string;
  secondaryColor: string;
  ctaLabel: string;
  ctaHref: string;
  logoEmoji: string;
  sections: SponsorSection[];
  promoCode?: string;
  artistSlug?: string; // if sponsoring a specific artist
}

export interface SponsorSection {
  kind: 'headline' | 'body' | 'stat-row' | 'artist-spotlight' | 'ad-banner';
  headline?: string;
  body?: string;
  stats?: { label: string; value: string }[];
  artistName?: string;
  artistTagline?: string;
}

export const SPONSORED_PAGES: SponsoredPageConfig[] = [
  {
    slug: 'soundwave-audio',
    sponsorName: 'SoundWave Audio',
    tagline: 'Professional gear. Real artists. Real sound.',
    heroHeadline: '$10,000 GEAR PRIZE POOL',
    heroSubhead: 'Top-ranked TMI artists win professional studio kits every season.',
    primaryColor: '#AA2DFF',
    secondaryColor: '#00FFFF',
    ctaLabel: 'ENTER THE PRIZE POOL',
    ctaHref: '/profile/sponsor/soundwave-audio',
    logoEmoji: '🎛️',
    promoCode: 'TMI10K',
    sections: [
      { kind: 'headline', headline: 'THE GEAR THAT BUILDS CAREERS' },
      { kind: 'body', body: 'SoundWave Audio partners with The Musician\'s Index to put professional studio equipment directly in the hands of rising artists. Every season, the top-ranked performers in the Cypher Arena and Stream & Win rooms are eligible for the prize pool.' },
      { kind: 'stat-row', stats: [{ label: 'Prize Pool', value: '$10,000' }, { label: 'Winners/Season', value: '5' }, { label: 'Gear Items', value: '24+' }] },
      { kind: 'body', body: 'From condenser microphones to full mixing boards, the SoundWave Prize Kit is designed to take your home setup to professional-grade. No strings attached — just rank, win, and record.' },
      { kind: 'headline', headline: 'HOW TO WIN' },
      { kind: 'body', body: 'Compete in any TMI battle or Stream & Win room. Earn ranking points. The top 5 artists at the end of each season receive a SoundWave Audio gear package valued at $2,000+ each. Season rankings reset monthly.' },
    ],
  },
  {
    slug: 'beatmarket',
    sponsorName: 'BeatMarket',
    tagline: 'Weekly cash. Paid to the culture.',
    heroHeadline: '$2,500 CASH — EVERY WEEK',
    heroSubhead: 'BeatMarket pays the top TMI battle performer every single week.',
    primaryColor: '#00FFFF',
    secondaryColor: '#FFD700',
    ctaLabel: 'ENTER THIS WEEK\'S BATTLE',
    ctaHref: '/battles',
    logoEmoji: '💰',
    promoCode: 'BEAT2500',
    sections: [
      { kind: 'headline', headline: 'REAL MONEY. REAL BATTLES.' },
      { kind: 'body', body: 'BeatMarket believes in paying artists for their craft — not just streaming royalties, but direct cash for competitive performance. Every week on TMI, the top-voted battle performer receives $2,500 from the BeatMarket Prize Fund.' },
      { kind: 'stat-row', stats: [{ label: 'Weekly Payout', value: '$2,500' }, { label: 'Paid Out YTD', value: '$32,500' }, { label: 'Artists Paid', value: '13' }] },
      { kind: 'body', body: 'Unlike streaming, this money goes directly to you. No middlemen. No label splits. Win the battle, collect the cash.' },
    ],
  },
  {
    slug: 'tmi-official',
    sponsorName: 'TMI Official',
    tagline: 'The Musician\'s Index Season 1 — Own the ladder.',
    heroHeadline: '1M POINTS. ONE CHAMPION.',
    heroSubhead: 'Race the TMI Season 1 point ladder and claim the official title.',
    primaryColor: '#FFD700',
    secondaryColor: '#FF2DAA',
    ctaLabel: 'JOIN SEASON 1',
    ctaHref: '/battles',
    logoEmoji: '🏆',
    sections: [
      { kind: 'headline', headline: 'SEASON 1 IS LIVE' },
      { kind: 'body', body: 'The first official TMI Season launched May 2026. Every battle, cypher, and Stream & Win session earns ranking points. The artist who reaches 1,000,000 points first is crowned Season 1 Champion.' },
      { kind: 'stat-row', stats: [{ label: 'Points to Win', value: '1,000,000' }, { label: 'Events/Week', value: '12+' }, { label: 'Season Prize', value: 'TBA' }] },
      { kind: 'body', body: 'The Season Champion gets a full editorial feature in TMI Magazine Issue 2, a homepage broadcast slot for 30 days, and priority booking eligibility across all TMI partner venues.' },
    ],
  },
];

function getSponsoredPage(slug: string): SponsoredPageConfig | undefined {
  return SPONSORED_PAGES.find(p => p.slug === slug);
}

export function generateStaticParams() {
  return SPONSORED_PAGES.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cfg = getSponsoredPage(params.slug);
  if (!cfg) return { title: 'Sponsored — TMI' };
  return {
    title: `${cfg.sponsorName} × TMI — ${cfg.heroHeadline}`,
    description: cfg.tagline,
  };
}

export default function SponsoredPage({ params }: { params: { slug: string } }) {
  const cfg = getSponsoredPage(params.slug);
  if (!cfg) notFound();

  const { primaryColor: p, secondaryColor: s } = cfg;
  const relatedArticles = getLatestEditorialArticles(3);
  const liveFeeds = SEED_FEEDS.filter(f => f.status === 'live').slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', overflowX: 'hidden' }}>

      {/* Top bar — sponsor brand color */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${p}, ${s}, ${p})` }} />

      {/* Sponsor masthead nav */}
      <div style={{ background: `${p}10`, borderBottom: `1px solid ${p}33`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/articles/c/sponsors" style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>← SPONSOR STORIES</Link>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.25em', color: p, textTransform: 'uppercase', padding: '3px 10px', border: `1px solid ${p}55`, borderRadius: 2 }}>💎 SPONSORED CONTENT</div>
        <Link href="/sponsors" style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>ADVERTISE WITH US →</Link>
      </div>

      {/* Full-bleed hero */}
      <div style={{
        background: `linear-gradient(155deg, ${p}44 0%, ${s}18 40%, #050510 75%)`,
        borderBottom: `2px solid ${p}44`,
        padding: 'clamp(48px,6vw,96px) clamp(16px,4vw,64px)',
        position: 'relative',
      }}>
        {/* Background dot pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `radial-gradient(circle, ${p}18 1px, transparent 1px)`, backgroundSize: '18px 18px', opacity: 0.5 }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 56 }}>{cfg.logoEmoji}</div>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: p, textTransform: 'uppercase' }}>{cfg.sponsorName}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{cfg.tagline}</div>
            </div>
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue','Impact',sans-serif",
            fontSize: 'clamp(3rem,8vw,7rem)',
            fontWeight: 900, lineHeight: 0.9,
            color: '#fff', margin: '0 0 20px',
            textShadow: `3px 6px 0 ${p}33`,
            letterSpacing: '0.01em',
          }}>
            {cfg.heroHeadline}
          </h1>

          <p style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(15px,1.8vw,22px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, maxWidth: 640, marginBottom: 36 }}>
            {cfg.heroSubhead}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={cfg.ctaHref} style={{ textDecoration: 'none' }}>
              <div style={{ background: p, color: '#050510', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 20, padding: '14px 36px', letterSpacing: '0.05em', boxShadow: `0 8px 32px ${p}44` }}>
                {cfg.ctaLabel}
              </div>
            </Link>
            {cfg.promoCode && (
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: p, border: `1px dashed ${p}66`, padding: '10px 18px', letterSpacing: '0.15em' }}>
                USE CODE: <strong>{cfg.promoCode}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px)' }}>
        {cfg.sections.map((sec, i) => {
          if (sec.kind === 'headline') return (
            <h2 key={i} style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(28px,4vw,48px)', color: '#fff', margin: '40px 0 16px', letterSpacing: '0.02em', lineHeight: 1 }}>
              {sec.headline}
            </h2>
          );
          if (sec.kind === 'body') return (
            <p key={i} style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(15px,1.6vw,18px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.85, marginBottom: 24, maxWidth: 720 }}>
              {sec.body}
            </p>
          );
          if (sec.kind === 'stat-row' && sec.stats) return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${sec.stats.length}, 1fr)`, gap: 16, margin: '32px 0', padding: '24px', background: `${p}0a`, border: `1px solid ${p}33` }}>
              {sec.stats.map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(32px,5vw,56px)', color: p, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 6 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          );
          return null;
        })}

        {/* Live room strip */}
        {liveFeeds.length > 0 && (
          <div style={{ margin: '48px 0' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: p, textTransform: 'uppercase', marginBottom: 16 }}>🔴 LIVE ON TMI NOW</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
              {liveFeeds.map(f => (
                <Link key={f.id} href={f.href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: `${f.accentColor}0d`, border: `1px solid ${f.accentColor}33`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{f.avatarEmoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: f.accentColor, marginTop: 2 }}>🔴 {(f.viewerCount ?? 0).toLocaleString()} watching</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related articles */}
        <div style={{ borderTop: `2px solid ${p}33`, paddingTop: 40, marginTop: 8 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: p, textTransform: 'uppercase', marginBottom: 20 }}>FROM THE MAGAZINE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {relatedArticles.map(a => (
              <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px', borderTop: `3px solid ${p}` }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 17, color: '#fff', lineHeight: 1.1 }}>{a.title}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>By {a.author}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Advertise CTA */}
        <div style={{ marginTop: 48, background: p, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, color: '#050510' }}>GET YOUR OWN SPONSORED PAGE</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(0,0,0,0.6)', fontWeight: 700, marginTop: 4 }}>Full-page takeovers · Ad segments · Campaign pages</div>
          </div>
          <Link href="/sponsors" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#050510', color: p, fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, padding: '12px 28px' }}>ADVERTISE →</div>
          </Link>
        </div>
      </div>

      <div style={{ height: 4, background: `linear-gradient(90deg, ${s}, ${p}, ${s})` }} />
    </div>
  );
}
