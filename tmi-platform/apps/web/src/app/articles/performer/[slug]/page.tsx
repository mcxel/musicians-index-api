import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPerformerBySlug, PERFORMER_REGISTRY, getTierColor } from '@/lib/performers/PerformerRegistry';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';
import { XP_TIER_THRESHOLDS, getNextTier, getXpToNextTier, getTierFromXp } from '@/lib/xp/XpActionRegistry';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';

export async function generateStaticParams() {
  return PERFORMER_REGISTRY.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getPerformerBySlug(params.slug);
  if (!p) return { title: 'Performer — TMI' };
  return {
    title: `${p.name} — ${p.category} · The Musician's Index`,
    description: `${p.name} is a ${p.tier} tier ${p.category} performer ranked #${p.rank} on TMI. ${p.fanCount.toLocaleString()} fans.`,
    openGraph: {
      title: `${p.name} | TMI`,
      description: `${p.category} · Rank #${p.rank} · ${p.fanCount.toLocaleString()} fans`,
      images: [{ url: p.profileImageUrl }],
    },
  };
}

export default function PerformerArticlePage({ params }: { params: { slug: string } }) {
  const p = getPerformerBySlug(params.slug);
  if (!p) notFound();

  const ac = getTierColor(p.tier);
  const currentTier = getTierFromXp(p.xp);
  const nextTier    = getNextTier(currentTier);
  const xpFloor     = XP_TIER_THRESHOLDS[currentTier] ?? 0;
  const xpCeiling   = nextTier !== 'APEX' ? (XP_TIER_THRESHOLDS[nextTier as keyof typeof XP_TIER_THRESHOLDS] ?? p.xp) : p.xp + 1;
  const xpProgress  = Math.min(100, Math.round(((p.xp - xpFloor) / Math.max(1, xpCeiling - xpFloor)) * 100));
  const xpToNext    = getXpToNextTier(p.xp);

  const performerArticles = MAGAZINE_ISSUE_1.filter(a => a.performerSlug === p.slug);
  // Rule 12: No Empty Inventory — article mid-slot
  const articleAd = getAdSlotForZone(`performer-article-${p.slug}-mid`);

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a0614 0%, #050310 100%)', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,6,20,0.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${ac}22`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/home/1" style={{ width: 28, height: 28, borderRadius: 8, background: `${ac}14`, border: `1px solid ${ac}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: ac, fontSize: 13 }}>⌂</Link>
        <Link href="/articles" style={{ fontSize: 9, fontWeight: 700, color: `${ac}88`, textDecoration: 'none', letterSpacing: '0.1em' }}>← ARTICLES</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: ac, background: `${ac}14`, border: `1px solid ${ac}33`, borderRadius: 12, padding: '3px 10px', letterSpacing: '0.08em' }}>
            {p.category.toUpperCase()}
          </span>
          <span style={{ fontSize: 8, fontWeight: 900, color: '#FFD700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 12, padding: '3px 10px' }}>
            #{p.rank} {p.tier.toUpperCase()}
          </span>
        </div>
      </nav>

      {/* ── Cover hero — Rule 2: LIVE VIDEO → MOTION POSTER → STATIC IMAGE ── */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        {/* MotionPosterPlayer fills the full hero area */}
        <MotionPosterPlayer
          isLive={p.isLive}
          liveRoomRoute={p.liveRoomRoute}
          introVideoUrl={p.introVideoUrl}
          motionPosterUrl={p.motionPosterUrl}
          staticImageUrl={p.coverImageUrl}
          alt={p.name}
          audienceCount={p.audienceCount}
          showLiveOverlay={false}
          style={{ position: 'absolute', inset: 0 }}
          height="100%"
          width="100%"
        />
        {/* Gradient scrim always on — article hero needs dark bottom for title readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,3,16,0.3) 0%, rgba(5,3,16,0.92) 100%)', pointerEvents: 'none', zIndex: 4 }} />
        {p.isLive && (
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 5, background: '#E63000', borderRadius: 6, padding: '4px 12px', fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 20px rgba(230,48,0,0.6)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: 'tmi-live-pulse 1.15s ease-in-out infinite' }} />
            LIVE NOW · {p.audienceCount.toLocaleString()} WATCHING
          </div>
        )}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5, background: `${ac}22`, border: `1.5px solid ${ac}`, borderRadius: 6, padding: '4px 12px', fontSize: 9, fontWeight: 900, color: ac, letterSpacing: '0.08em' }}>
          PRO ARTIST FEATURE
        </div>
        {/* Performer portrait overlaid on cover */}
        <div style={{ position: 'absolute', bottom: -40, left: 20, zIndex: 10 }}>
          <img
            src={p.profileImageUrl}
            alt={p.name}
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${ac}`, boxShadow: `0 0 28px ${ac}66, 0 4px 20px rgba(0,0,0,0.8)` }}
          />
        </div>
      </div>

      {/* ── Identity strip ── */}
      <div style={{ padding: '50px 20px 24px', borderBottom: `1px solid ${ac}18`, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.01em', lineHeight: 1.05, background: `linear-gradient(135deg, #fff 40%, ${ac})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {p.name}
            </h1>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              {p.flag} {p.city} · {p.category}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href={p.liveRoomRoute} style={{ padding: '9px 18px', background: p.isLive ? '#E63000' : `${ac}18`, border: `1.5px solid ${p.isLive ? '#E63000' : ac}`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: p.isLive ? '#fff' : ac, textDecoration: 'none', letterSpacing: '0.06em', boxShadow: p.isLive ? '0 0 20px rgba(230,48,0,0.5)' : 'none' }}>
              {p.isLive ? '🔴 JOIN LIVE' : '🎥 WATCH ROOM'}
            </Link>
            <Link href={p.profileRoute} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '0.06em' }}>
              VIEW FULL PROFILE →
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 18 }}>
          {[
            { label: 'RANK', value: `#${p.rank}` },
            { label: 'XP', value: p.xp.toLocaleString() },
            { label: 'FANS', value: p.fanCount.toLocaleString() },
            { label: 'LIKES', value: p.likes.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ background: `${ac}0c`, border: `1px solid ${ac}22`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: ac }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 100px' }}>

        {/* ── LIVE NOW panel ── */}
        {p.isLive && (
          <div style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(230,48,0,0.12), rgba(10,6,20,0.95))', border: '1.5px solid rgba(230,48,0,0.5)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(230,48,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 10px #E63000' }} />
                <span style={{ fontSize: 11, fontWeight: 900, color: '#E63000', letterSpacing: '0.1em' }}>LIVE RIGHT NOW</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>· {p.timeLive} · {p.audienceCount.toLocaleString()} watching</span>
              </div>
              <Link href={p.liveRoomRoute} style={{ padding: '6px 14px', background: '#E63000', borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '0.06em' }}>
                JOIN →
              </Link>
            </div>
            <div style={{ padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={p.profileImageUrl} alt={p.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(230,48,0,0.4)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{p.name} is performing live</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{p.category} · Live Room</div>
                <Link href={p.liveRoomRoute} style={{ fontSize: 10, fontWeight: 700, color: '#E63000', textDecoration: 'none', letterSpacing: '0.06em' }}>
                  🎥 Open Live Room → /live/rooms/{p.roomId}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Progression bar ── */}
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ac}22`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: ac, letterSpacing: '0.12em' }}>
              XP PROGRESSION · {p.tier} TIER
            </div>
            <Link href={`/dashboard/performer/${p.slug}/analytics`} style={{ fontSize: 8, fontWeight: 700, color: `${ac}88`, textDecoration: 'none', letterSpacing: '0.08em' }}>
              VIEW ANALYTICS →
            </Link>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpProgress}%`, background: `linear-gradient(90deg, ${ac}, ${ac}88)`, borderRadius: 999, boxShadow: `0 0 10px ${ac}66`, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
            <span>{p.xp.toLocaleString()} XP · {xpProgress}% to {nextTier}</span>
            <span>{xpToNext.toLocaleString()} XP needed</span>
          </div>

          {/* Crown rotation rule */}
          {p.rank === 1 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>👑</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', marginBottom: 2 }}>CROWN HOLDER — {p.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Crown holders hold #1 for up to 2 months, then rotate to keep the platform fair and open. After 2 months, the next top performer earns the throne.
                </div>
              </div>
            </div>
          )}
          {p.rank <= 5 && p.rank > 1 && (
            <div style={{ marginTop: 10, fontSize: 9, color: `${ac}88`, fontWeight: 600 }}>
              🎯 {5000 * (p.rank - 1)} more XP puts you in crown contention
            </div>
          )}
        </div>

        {/* ── Article content (pulled from magazine if available, else dynamic bio) ── */}
        <section style={{ marginTop: 28 }}>
          {performerArticles.length > 0 ? (
            performerArticles.map(a => (
              <div key={a.slug} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: a.heroColor, letterSpacing: '0.2em' }}>📰 {a.category.toUpperCase()}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>{a.title}</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontStyle: 'italic' }}>{a.subtitle}</p>
                {a.blocks.slice(0, 4).map((block, i) => (
                  <div key={i}>
                    {block.type === 'paragraph' && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 14 }}>{block.text}</p>}
                    {block.type === 'heading' && <h3 style={{ fontSize: 16, fontWeight: 900, color: a.heroColor, marginTop: 20, marginBottom: 8, letterSpacing: '0.04em' }}>{block.text}</h3>}
                    {block.type === 'pullquote' && (
                      <div style={{ margin: '18px 0', padding: '14px 18px', borderLeft: `3px solid ${a.heroColor}`, background: 'rgba(255,255,255,0.03)', borderRadius: '0 8px 8px 0' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{block.text}</p>
                      </div>
                    )}
                  </div>
                ))}
                <Link href={`/magazine/article/${a.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '8px 16px', background: `${a.heroColor}14`, border: `1px solid ${a.heroColor}44`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: a.heroColor, textDecoration: 'none', letterSpacing: '0.06em' }}>
                  READ FULL ARTICLE →
                </Link>
              </div>
            ))
          ) : (
            /* Generic bio card when no magazine article links to this performer */
            <div>
              <div style={{ marginBottom: 16, padding: '16px 20px', borderLeft: `4px solid ${ac}`, background: `${ac}08`, borderRadius: '0 8px 8px 0' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{p.name} is one of the most compelling voices in {p.category} on TMI right now. Every session adds another chapter to their story."
                </p>
                <div style={{ fontSize: 9, color: `${ac}88`, marginTop: 8, fontWeight: 700 }}>— The Musician&apos;s Index Editorial</div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 14 }}>
                Based in {p.city}, {p.name} has built a following of {p.fanCount.toLocaleString()} fans on TMI and earned {p.xp.toLocaleString()} XP, placing them at rank #{p.rank} in the {p.category} category. Their {p.tier} tier status reflects consistent performance, audience engagement, and platform contributions.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 14 }}>
                {p.isLive ? `Right now, ${p.name} is live with ${p.audienceCount.toLocaleString()} people watching. Join the room to experience their performance in real time and earn XP for supporting the artist.` : `Follow ${p.name} to get notified when they go live. Their performances consistently draw strong audience engagement across the TMI platform.`}
              </p>
              <Link href={`/magazine?category=${encodeURIComponent(p.category)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: `${ac}14`, border: `1px solid ${ac}44`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: ac, textDecoration: 'none', letterSpacing: '0.06em' }}>
                📰 READ MORE {p.category.toUpperCase()} COVERAGE →
              </Link>
            </div>
          )}
        </section>

        {/* ── Rule 12: Mid-article ad slot ── */}
        {articleAd.type === 'platform' && articleAd.platformPromo && (
          <div style={{ margin: '16px 0', background: `${articleAd.platformPromo.accentColor}0a`, border: `1px solid ${articleAd.platformPromo.accentColor}33`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: articleAd.platformPromo.accentColor }}>{articleAd.platformPromo.headline}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{articleAd.platformPromo.body}</div>
            </div>
            <Link href={articleAd.platformPromo.ctaHref} style={{ padding: '6px 14px', background: articleAd.platformPromo.accentColor, borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#050310', textDecoration: 'none', flexShrink: 0 }}>
              {articleAd.platformPromo.ctaLabel}
            </Link>
          </div>
        )}

        {/* ── XP earn notice ── */}
        <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.18)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#00FF88', marginBottom: 2 }}>+25 XP earned for reading this article</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Read 5 articles to unlock the Weekly Cypher badge · XP tallies at page end</div>
          </div>
        </div>

        {/* ── Commerce rail ── */}
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: `1px solid ${ac}18`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: ac, letterSpacing: '0.2em', marginBottom: 12 }}>SUPPORT {p.name.toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/checkout?type=tip&artist=${p.slug}&amount=500&productName=${encodeURIComponent(`Tip for ${p.name}`)}`} style={{ padding: '9px 18px', background: ac, borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#050310', textDecoration: 'none', letterSpacing: '0.06em', boxShadow: `0 0 16px ${ac}44` }}>
              💸 SEND TIP
            </Link>
            <Link href={`/fan-club/${p.slug}`} style={{ padding: '9px 18px', background: 'rgba(255,45,170,0.1)', border: '1.5px solid rgba(255,45,170,0.45)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#FF2DAA', textDecoration: 'none', letterSpacing: '0.06em' }}>
              ⭐ JOIN FAN CLUB
            </Link>
            <Link href={`/merch/${p.slug}`} style={{ padding: '9px 18px', background: 'rgba(255,215,0,0.08)', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#FFD700', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🛍️ BUY MERCH
            </Link>
            <Link href={`/sponsors/advertise?target=${p.slug}`} style={{ padding: '9px 18px', background: 'transparent', border: `1.5px solid ${ac}44`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: ac, textDecoration: 'none', letterSpacing: '0.06em' }}>
              🤝 SPONSOR
            </Link>
            <Link href={p.liveRoomRoute} style={{ padding: '9px 18px', background: p.isLive ? 'rgba(230,48,0,0.15)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${p.isLive ? 'rgba(230,48,0,0.6)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: p.isLive ? '#E63000' : 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🎥 LIVE ROOM
            </Link>
          </div>
        </div>

        {/* ── Performer upload + profile hub section ── */}
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(170,45,255,0.08), rgba(10,6,20,0.95))', border: '1px solid rgba(170,45,255,0.3)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#AA2DFF', letterSpacing: '0.15em', marginBottom: 6 }}>ARTIST HUB — MANAGE YOUR PAGE</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.5 }}>
            Are you {p.name}? Update your profile images, bio, music, and media. Your uploads power this article, your profile, and your position in the home wheel.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/dashboard/performer/${p.slug}/upload`} style={{ padding: '8px 16px', background: '#AA2DFF', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '0.06em', boxShadow: '0 0 16px rgba(170,45,255,0.4)' }}>
              📤 UPLOAD MUSIC & MEDIA
            </Link>
            <Link href={`/dashboard/performer/${p.slug}/profile`} style={{ padding: '8px 16px', background: 'rgba(170,45,255,0.1)', border: '1.5px solid rgba(170,45,255,0.4)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#AA2DFF', textDecoration: 'none', letterSpacing: '0.06em' }}>
              ✏️ EDIT PROFILE
            </Link>
            <Link href={`/dashboard/performer/${p.slug}/analytics`} style={{ padding: '8px 16px', background: 'rgba(170,45,255,0.08)', border: '1.5px solid rgba(170,45,255,0.25)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#AA2DFF', textDecoration: 'none', letterSpacing: '0.06em' }}>
              📊 VIEW ANALYTICS
            </Link>
            <Link href={`/dashboard/performer/${p.slug}/images`} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'rgba(170,45,255,0.7)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🖼️ UPDATE IMAGES
            </Link>
          </div>
        </div>

        {/* ── Discovery Rails ── */}
        {performerArticles.length > 0 && (
          <DiscoveryRail type="articles" tags={[p.category]} exclude={performerArticles[0]?.slug} accentColor={ac} label="MORE STORIES" />
        )}
        {performerArticles.length === 0 && (
          <DiscoveryRail type="articles" tags={[p.category]} accentColor={ac} label="RELATED ARTICLES" />
        )}
        <DiscoveryRail type="performers" tags={[p.category]} exclude={p.slug} accentColor={ac} label={`MORE ${p.category.toUpperCase()} ARTISTS`} />
        <DiscoveryRail type="liveRooms" accentColor="#E63000" />
        <DiscoveryRail type="games" accentColor="#AA2DFF" />
        <DiscoveryRail type="sponsors" accentColor="#FFD700" />

        {/* ── Bottom nav ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/home/1" style={{ fontSize: 10, color: ac, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}>⌂ HOME</Link>
          <Link href="/articles" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}>← ALL ARTICLES</Link>
          <Link href="/magazine" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}>📰 MAGAZINE</Link>
          <Link href="/battles" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}>⚔️ BATTLES</Link>
          <Link href={`/articles?category=${encodeURIComponent(p.category)}`} style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}>MORE {p.category.toUpperCase()} →</Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </main>
  );
}
