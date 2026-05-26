import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TMIHeadline, TMIConfetti, TMILiveBadge } from '@/components/shared/TMIGeoBlock';
import { SEED_FEEDS } from '@/lib/broadcast/BroadcastRotationEngine';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';

export const dynamic = 'force-dynamic';

const CHANNELS = {
  music:     { color: '#FF6B00', icon: '🎤', label: 'Music',      desc: 'Latest music news, releases, and artist features' },
  world:     { color: '#00D4FF', icon: '🌍', label: 'World',      desc: 'Global music news and cultural moments' },
  tech:      { color: '#6B2FB3', icon: '💻', label: 'Tech',       desc: 'Music technology, production, and innovation' },
  science:   { color: '#00A896', icon: '🔬', label: 'Science',    desc: 'The science of sound, performance, and creativity' },
  love:      { color: '#FF2DAA', icon: '❤️',  label: 'Love',       desc: 'Music, romance, and culture' },
  lifestyle: { color: '#FFD700', icon: '✨', label: 'Lifestyle',  desc: 'Artist lifestyle, fashion, and culture' },
  business:  { color: '#FFD700', icon: '💼', label: 'Business',   desc: 'Music industry, deals, and money moves' },
  culture:   { color: '#FF2DAA', icon: '🎭', label: 'Culture',    desc: 'Art, culture, and creative movements' },
  winners:   { color: '#FFD700', icon: '🏆', label: 'Winners',    desc: 'Champion profiles and hall of fame' },
  live:      { color: '#CC2200', icon: '📡', label: 'Live',       desc: "What's happening right now on TMI" },
  cypher:    { color: '#6B2FB3', icon: '⚔️',  label: 'Cypher',    desc: 'Battle recaps, cypher highlights, and rankings' },
  events:    { color: '#FF6B00', icon: '🎟️',  label: 'Events',    desc: 'Concerts, shows, and upcoming events' },
  sponsors:  { color: '#FFD700', icon: '💎', label: 'Sponsors',   desc: 'Brand partnerships, sponsor stories, and deals' },
  writers:   { color: '#00A896', icon: '✍️',  label: 'Writers',    desc: 'Bylines, contributors, and editorial staff' },
} as const;

type ChannelKey = keyof typeof CHANNELS;
const CHANNEL_KEYS = Object.keys(CHANNELS) as ChannelKey[];
const CARD_SHAPES = ['jagg','blob','tagR','tagL','slash','jagg','blob','tagL'] as const;

export async function generateStaticParams() {
  return CHANNEL_KEYS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cfg = CHANNELS[slug as ChannelKey];
  if (!cfg) return { title: 'Articles — TMI' };
  return {
    title: `${cfg.label} — The Musician's Index`,
    description: cfg.desc,
  };
}

export default async function ArticleChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cfg = CHANNELS[slug as ChannelKey];
  if (!cfg) notFound();

  const articles = getLatestEditorialArticles(12);
  const liveFeeds = SEED_FEEDS.filter(f => f.status === 'live').slice(0, 6);
  const sponsorFeeds = SEED_FEEDS.filter(f => f.kind === 'sponsor-billboard').slice(0, 2);
  const accent = cfg.color;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#f8f7f1', fontFamily: "'Bebas Neue','Impact',sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <TMIConfetti count={22} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${accent}12 1px, transparent 1px)`, backgroundSize: '9px 9px', opacity: 0.6 }} />
      </div>

      <style>{`
        @keyframes tmiBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes tmiCardIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
        .tmi-article-card:hover { transform: translateY(-3px) !important; }
        .tmi-live-tile:hover { transform: scale(1.02) !important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px,3vw,32px)', position: 'relative', zIndex: 2 }}>

        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'none' }}>
          {CHANNEL_KEYS.map(k => {
            const c = CHANNELS[k];
            return (
              <Link key={k} href={`/articles/c/${k}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  padding: '8px 14px',
                  background: k === slug ? `${c.color}22` : 'transparent',
                  borderBottom: k === slug ? `3px solid ${c.color}` : '3px solid transparent',
                  fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: k === slug ? c.color : 'rgba(255,255,255,0.4)',
                  whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                }}>
                  {c.icon} {c.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          <TMIHeadline color={accent} size="xl">{cfg.icon} {cfg.label}</TMIHeadline>
          {slug === 'live' && (
            <div style={{ marginTop: 8 }}>
              <TMILiveBadge viewers={SEED_FEEDS.reduce((s, f) => s + (f.viewerCount ?? 0), 0)} />
            </div>
          )}
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{cfg.desc}</div>

        <div style={{ display: 'flex', height: 4, marginBottom: 28 }}>
          {(['#FF2DAA','#FFD700','#AA2DFF','#00FF88','#FF4400'] as const).map(c => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 14, marginBottom: 28 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {articles.slice(0, 1).map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tmi-article-card" style={{
                  background: `linear-gradient(145deg, ${accent}18, rgba(5,5,16,0.95))`,
                  border: `2px solid ${accent}44`, padding: 20,
                  clipPath: 'polygon(0% 0%, 97% 0%, 100% 96%, 3% 100%)',
                  boxShadow: `0 0 24px ${accent}22, 0 16px 32px rgba(0,0,0,0.5)`,
                  minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'transform 0.2s ease', animation: 'tmiCardIn 0.4s ease',
                }}>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: accent, color: '#050510', padding: '2px 8px' }}>{cfg.icon} {cfg.label.toUpperCase()}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{article.publishedAt}</span>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(22px,3vw,34px)', color: '#fff', lineHeight: 1, marginBottom: 10, letterSpacing: '0.02em' }}>
                      {article.title || `${cfg.label} Feature Story`}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                      {article.snippet || article.headline || "Click to read the full story on The Musician's Index."}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                      By {article.author ?? 'TMI Staff'}
                      {article.writerSlug && <Link href={`/profile/writer/${article.writerSlug}`} style={{ color: accent, marginLeft: 6, textDecoration: 'none' }}>↗</Link>}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>READ FULL STORY →</div>
                  </div>
                </div>
              </Link>
            ))}
            {articles.slice(1, 2).map(article => (
              <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tmi-article-card" style={{
                  background: 'rgba(8,10,20,0.9)', border: `1px solid rgba(255,255,255,0.12)`, padding: 16,
                  clipPath: 'polygon(0% 0%, 100% 0%, 97% 100%, 0% 100%)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'transform 0.2s ease',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: '#fff', letterSpacing: '0.02em' }}>{article.title || 'Industry Buzz'}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{article.snippet || article.headline || ''}</div>
                  <div style={{ marginTop: 10, fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>READ →</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveFeeds.slice(0, 3).map(feed => (
              <Link key={feed.id} href={feed.href} style={{ textDecoration: 'none' }}>
                <div className="tmi-live-tile" style={{
                  background: `linear-gradient(135deg, ${feed.accentColor}14, rgba(5,5,16,0.92))`,
                  border: `1px solid ${feed.accentColor}44`, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.2s ease',
                }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{feed.avatarEmoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TMILiveBadge viewers={feed.viewerCount} />
                    <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 15, color: '#fff', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feed.title}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{feed.subtitle}</div>
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: feed.accentColor, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>JOIN →</div>
                </div>
              </Link>
            ))}
            {articles.slice(2, 5).map((article, idx) => (
              <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tmi-article-card" style={{
                  background: 'rgba(8,10,20,0.88)', border: `1px solid ${accent}22`, padding: '12px 14px',
                  clipPath: idx % 2 === 0 ? 'polygon(0% 0%, 100% 2%, 97% 100%, 0% 100%)' : undefined,
                  transition: 'transform 0.2s ease',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 15, color: '#fff' }}>{article.title || `${cfg.label} Story`}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>By {article.author ?? 'TMI Staff'}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(255,45,170,0.08)', border: '2px solid #FF2DAA44', padding: 16 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>🗳️ FAN POLL</div>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: '#fff', marginBottom: 12 }}>Who took the crown this week?</div>
              {[
                { label: 'Zion Freq', pct: 44, color: '#FFD700' },
                { label: 'Astra Nova', pct: 31, color: '#FF2DAA' },
                { label: 'Big Ace', pct: 25, color: '#AA2DFF' },
              ].map(opt => (
                <div key={opt.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: '#fff', fontWeight: 700 }}>{opt.label}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: opt.color, fontWeight: 900 }}>{opt.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${opt.pct}%`, background: opt.color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
              <Link href="/magazine" style={{ textDecoration: 'none', display: 'block', marginTop: 12, fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                READ FULL ARTICLE →
              </Link>
            </div>
            {articles.slice(5, 8).map(article => (
              <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className="tmi-article-card" style={{
                  background: 'rgba(8,10,20,0.88)', border: `1px solid rgba(255,255,255,0.1)`, padding: '12px 14px', transition: 'transform 0.2s ease',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 15, color: '#fff' }}>{article.title || 'Trending Now'}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{article.snippet?.slice(0, 80) ?? ''}</div>
                </div>
              </Link>
            ))}
            {sponsorFeeds[0] && (
              <Link href={sponsorFeeds[0].href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(5,5,16,0.9))',
                  border: '2px solid #FFD70044', padding: '14px 14px',
                  clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
                  boxShadow: '0 0 18px rgba(255,215,0,0.15)',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>🤝</div>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: '#FFD700' }}>{sponsorFeeds[0].title}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.6)', marginTop: 4 }}>{sponsorFeeds[0].subtitle}</div>
                  <div style={{ marginTop: 10, fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: '#FFD700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>SPONSOR ARTIST →</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
          MORE {cfg.label.toUpperCase()} STORIES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, marginBottom: 28 }}>
          {articles.slice(8).map((article, idx) => (
            <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
              <div className="tmi-article-card" style={{
                background: 'rgba(8,10,20,0.88)', border: `1px solid ${accent}22`, padding: 14,
                clipPath: CARD_SHAPES[idx % CARD_SHAPES.length] !== 'jagg' ? undefined : 'polygon(0% 3%, 97% 0%, 100% 97%, 3% 100%)',
                transition: 'transform 0.2s ease', animation: `tmiCardIn ${0.2 + idx * 0.05}s ease`,
              }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 7, fontWeight: 900, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>{cfg.icon} {cfg.label}</div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: '#fff', lineHeight: 1.1 }}>{article.title || `Trending in ${cfg.label}`}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{article.snippet?.slice(0, 70) ?? ''}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ background: accent, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, color: '#fff', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>ADVERTISE WITH US</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>FRONT-PAGE PLACEMENT · SPONSOR WALLS · BILLBOARD TILES</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/advertisers" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', color: accent, padding: '10px 24px', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>ADVERTISER HUB →</div>
            </Link>
            <Link href="/sponsors" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', padding: '10px 24px', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, border: '2px solid rgba(255,255,255,0.4)' }}>SPONSOR ARTIST</div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
