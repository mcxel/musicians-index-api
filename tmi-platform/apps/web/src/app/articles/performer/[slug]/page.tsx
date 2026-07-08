import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getPerformerBySlug, PERFORMER_REGISTRY, getTierColor } from '@/lib/performers/PerformerRegistry';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';
import { XP_TIER_THRESHOLDS, getNextTier, getXpToNextTier, getTierFromXp } from '@/lib/xp/XpActionRegistry';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { getLayoutConfig, buildImagePool, resolveGallerySlots } from '@/lib/magazine/MagazineLayoutEngine';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import PerformerArticleShareBar from '@/components/share/PerformerArticleShareBar';
import ArticleShareAttributionTracker from '@/components/tracking/ArticleShareAttributionTracker';
import { buildArticleOGUrl } from '@/lib/share/ArticleShareTrackingEngine';
import CinematicMotionReveal from '@/components/article/CinematicMotionReveal';
import TieredArticleGallery from '@/components/article/TieredArticleGallery';
import { resolveTheme } from '@/lib/theme/MagazineThemeEngine';
import MagazineThemeProvider from '@/components/theme/MagazineThemeProvider';
import HeartButton from '@/components/engagement/HeartButton';
import FanJoinButton from '@/components/engagement/FanJoinButton';
import ArticleAudioPlayer from '@/components/article/ArticleAudioPlayer';

export async function generateStaticParams() {
  return PERFORMER_REGISTRY.map(p => ({ slug: p.slug }));
}

type ThemeKey = 'stage' | 'luxury' | 'street' | 'country' | 'rock' | 'orchestra' | 'comedy' | 'dance' | 'sports';

type ThemeConfig = {
  key: ThemeKey;
  name: string;
  gradient: string;
  overlay: string;
  accent: string;
};

const THEME_MAP: Record<ThemeKey, ThemeConfig> = {
  stage: {
    key: 'stage',
    name: 'Stage',
    gradient: 'radial-gradient(circle at 14% 18%, rgba(0,255,255,0.2) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at 86% 22%, rgba(255,45,170,0.2) 0%, rgba(0,0,0,0) 48%), linear-gradient(155deg, #04040b 0%, #0a0614 55%, #06070d 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    accent: '#00FFFF',
  },
  luxury: {
    key: 'luxury',
    name: 'Luxury',
    gradient: 'radial-gradient(circle at 18% 22%, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0) 42%), radial-gradient(circle at 88% 76%, rgba(170,45,255,0.18) 0%, rgba(0,0,0,0) 48%), linear-gradient(155deg, #0b0603 0%, #141018 52%, #06070d 100%)',
    overlay: 'linear-gradient(125deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
    accent: '#FFD700',
  },
  street: {
    key: 'street',
    name: 'Street',
    gradient: 'radial-gradient(circle at 82% 16%, rgba(255,45,170,0.18) 0%, rgba(0,0,0,0) 44%), radial-gradient(circle at 16% 84%, rgba(0,255,255,0.18) 0%, rgba(0,0,0,0) 40%), linear-gradient(160deg, #09050a 0%, #141419 58%, #050510 100%)',
    overlay: 'linear-gradient(130deg, rgba(255,255,255,0.02), rgba(0,0,0,0.18))',
    accent: '#FF2DAA',
  },
  country: {
    key: 'country',
    name: 'Country',
    gradient: 'radial-gradient(circle at 24% 20%, rgba(255,180,120,0.2) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at 76% 80%, rgba(255,215,0,0.14) 0%, rgba(0,0,0,0) 42%), linear-gradient(162deg, #1a1209 0%, #27190f 46%, #0d0a08 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
    accent: '#FFD700',
  },
  rock: {
    key: 'rock',
    name: 'Rock',
    gradient: 'radial-gradient(circle at 18% 14%, rgba(230,48,0,0.2) 0%, rgba(0,0,0,0) 42%), radial-gradient(circle at 86% 68%, rgba(255,45,170,0.16) 0%, rgba(0,0,0,0) 48%), linear-gradient(155deg, #090305 0%, #14080b 52%, #050510 100%)',
    overlay: 'linear-gradient(126deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    accent: '#E63000',
  },
  orchestra: {
    key: 'orchestra',
    name: 'Orchestra',
    gradient: 'radial-gradient(circle at 20% 16%, rgba(255,215,0,0.17) 0%, rgba(0,0,0,0) 44%), radial-gradient(circle at 74% 84%, rgba(170,45,255,0.16) 0%, rgba(0,0,0,0) 46%), linear-gradient(160deg, #0c0711 0%, #160b1a 52%, #050510 100%)',
    overlay: 'linear-gradient(130deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
    accent: '#AA2DFF',
  },
  comedy: {
    key: 'comedy',
    name: 'Comedy',
    gradient: 'radial-gradient(circle at 84% 20%, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0) 40%), radial-gradient(circle at 16% 78%, rgba(255,45,170,0.16) 0%, rgba(0,0,0,0) 44%), linear-gradient(155deg, #09040d 0%, #13081a 56%, #050510 100%)',
    overlay: 'linear-gradient(120deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))',
    accent: '#FF2DAA',
  },
  dance: {
    key: 'dance',
    name: 'Dance',
    gradient: 'radial-gradient(circle at 18% 24%, rgba(0,255,255,0.2) 0%, rgba(0,0,0,0) 42%), radial-gradient(circle at 82% 78%, rgba(170,45,255,0.2) 0%, rgba(0,0,0,0) 48%), linear-gradient(155deg, #040510 0%, #0a0f1c 54%, #050510 100%)',
    overlay: 'linear-gradient(126deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    accent: '#00FFFF',
  },
  sports: {
    key: 'sports',
    name: 'Sports',
    gradient: 'radial-gradient(circle at 24% 18%, rgba(0,229,255,0.2) 0%, rgba(0,0,0,0) 42%), radial-gradient(circle at 78% 76%, rgba(255,215,0,0.15) 0%, rgba(0,0,0,0) 46%), linear-gradient(156deg, #030916 0%, #081226 54%, #050510 100%)',
    overlay: 'linear-gradient(128deg, rgba(255,255,255,0.05), rgba(255,255,255,0.012))',
    accent: '#00E5FF',
  },
};

function themeFromPerformer(category: string): ThemeConfig {
  const c = category.toLowerCase();
  if (c.includes('country') || c.includes('folk')) return THEME_MAP.country;
  if (c.includes('rock') || c.includes('metal')) return THEME_MAP.rock;
  if (c.includes('comedy')) return THEME_MAP.comedy;
  if (c.includes('dance') || c.includes('dj') || c.includes('edm')) return THEME_MAP.dance;
  if (c.includes('orchestra') || c.includes('classical') || c.includes('instrumental')) return THEME_MAP.orchestra;
  if (c.includes('sports') || c.includes('arena')) return THEME_MAP.sports;
  if (c.includes('gospel') || c.includes('soul')) return THEME_MAP.luxury;
  if (c.includes('hip') || c.includes('rap') || c.includes('street')) return THEME_MAP.street;
  return THEME_MAP.stage;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getPerformerBySlug(params.slug);
  if (!p) return { title: 'Performer — TMI' };
  const pageUrl = `https://themusiciansindex.com/articles/performer/${p.slug}`;
  const headline = `${p.name} — ${p.category} feature`;
  const ogImage = buildArticleOGUrl({
    articleSlug: p.slug,
    performerName: p.name,
    headline,
    mode: p.isLive ? 'live' : 'still',
    isLive: p.isLive,
    viewers: p.audienceCount,
  });
  return {
    title: `${p.name} — ${p.category} · The Musician's Index`,
    description: `${p.name} is a ${p.tier} tier ${p.category} performer ranked #${p.rank} on TMI. ${p.fanCount.toLocaleString()} fans.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: `${p.name} | TMI Living Magazine`,
      description: `${p.category} · Rank #${p.rank} · ${p.fanCount.toLocaleString()} fans${p.isLive ? ` · LIVE NOW (${p.audienceCount.toLocaleString()} watching)` : ''}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${p.name} on TMI Magazine` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.name} | TMI Living Magazine`,
      description: `${p.category} · Rank #${p.rank}${p.isLive ? ' · LIVE NOW' : ' · Featured Story'}`,
      images: [ogImage],
    },
  };
}

export default function PerformerArticlePage({ params }: { params: { slug: string } }) {
  const p = getPerformerBySlug(params.slug);
  if (!p) redirect('/performers');

  const ac = getTierColor(p.tier);
  const theme = themeFromPerformer(p.category);
  const currentTier = getTierFromXp(p.xp);
  const nextTier    = getNextTier(currentTier);
  const xpFloor     = XP_TIER_THRESHOLDS[currentTier] ?? 0;
  const xpCeiling   = nextTier !== 'APEX' ? (XP_TIER_THRESHOLDS[nextTier as keyof typeof XP_TIER_THRESHOLDS] ?? p.xp) : p.xp + 1;
  const xpProgress  = Math.min(100, Math.round(((p.xp - xpFloor) / Math.max(1, xpCeiling - xpFloor)) * 100));
  const xpToNext    = getXpToNextTier(p.xp);

  // ── Magazine layout engine (Rule 8) ──────────────────────────────────────
  const layout        = getLayoutConfig(p.tier);
  const resolvedTheme = resolveTheme({ genre: p.category, performerTier: p.tier });
  const heroImage   = p.coverImageUrl || p.profileImageUrl;
  const heroVideo   = p.introVideoUrl || p.motionPosterUrl;
  const imagePool   = buildImagePool(p);
  const gallerySlots = resolveGallerySlots(heroImage, imagePool, layout.gallerySlots);

  const performerArticles = MAGAZINE_ISSUE_1.filter(a => a.performerSlug === p.slug);
  // Rule 12: No Empty Inventory — article mid-slot
  const articleAd = getAdSlotForZone(`performer-article-${p.slug}-mid`);
  const sharePath = `/articles/performer/${p.slug}`;

  return (
    <main style={{ minHeight: '100vh', background: theme.gradient, color: '#fff', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>

      <ArticleShareAttributionTracker articleSlug={p.slug} performerSlug={p.slug} />

      {/* Cinematic theme layers */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="tmi-theme-overlay" style={{ position: 'absolute', inset: 0, background: theme.overlay, opacity: 0.8 }} />
        <div className="tmi-theme-fog" style={{ position: 'absolute', inset: '-8%', background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 55%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)', filter: 'blur(26px)' }} />
        <div className="tmi-theme-particles" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1.2px)', backgroundSize: '26px 26px', opacity: 0.08 }} />
        <div className="tmi-theme-lights" style={{ position: 'absolute', inset: '-10%', background: 'conic-gradient(from 0deg at 30% 20%, rgba(0,255,255,0.13), transparent 30%, rgba(255,45,170,0.12), transparent 65%, rgba(255,215,0,0.1), transparent)', filter: 'blur(20px)' }} />
        <div className="tmi-theme-glass" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.01) 35%, rgba(255,255,255,0.08) 100%)', mixBlendMode: 'screen', opacity: 0.16 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,16,0.35), rgba(5,5,16,0.88))' }} />
      </div>

      {/* ── Sticky nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,6,20,0.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${ac}22`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/home/1" style={{ width: 28, height: 28, borderRadius: 8, background: `${ac}14`, border: `1px solid ${ac}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: ac, fontSize: 13 }}>⌂</Link>
        <Link href="/articles" style={{ fontSize: 9, fontWeight: 700, color: `${ac}88`, textDecoration: 'none', letterSpacing: '0.1em' }}>← ARTICLES</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: ac, background: `${ac}14`, border: `1px solid ${ac}33`, borderRadius: 12, padding: '3px 10px', letterSpacing: '0.08em' }}>
            {p.category.toUpperCase()}
          </span>
          <span style={{ fontSize: 8, fontWeight: 900, color: layout.tierColor, background: `${layout.tierColor}14`, border: `1px solid ${layout.tierColor}44`, borderRadius: 12, padding: '3px 10px' }}>
            #{p.rank} {p.tier.toUpperCase()}
          </span>
        </div>
      </nav>

      {/* ── Tiered Magazine Gallery — Rule 2: LIVE → MOTION → STATIC ── */}
      <div style={{ padding: '12px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Tier badge above the spread */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 8, fontWeight: 900, letterSpacing: '0.14em',
            color: layout.tierColor, background: `${layout.tierColor}14`,
            border: `1px solid ${layout.tierColor}44`, borderRadius: 999,
            padding: '3px 12px',
          }}>
            {layout.tierLabel}
          </span>
          {layout.hasMagazineBadge && (
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              · TMI LIVING MAGAZINE
            </span>
          )}
        </div>

        <CinematicMotionReveal intensity={layout.motionIntensity} accentColor={ac}>
          <TieredArticleGallery
            pattern={layout.pattern}
            heroImage={heroImage}
            heroVideoUrl={heroVideo}
            isLive={p.isLive}
            liveRoomRoute={p.liveRoomRoute}
            gallery={gallerySlots}
            accentColor={ac}
            performerName={p.name}
            performerSlug={p.slug}
            showUploadCta={layout.gallerySlots > 0}
            videoPanelUrl={layout.hasVideoPanel ? (p.introVideoUrl ?? undefined) : undefined}
            audienceCount={p.audienceCount}
            tierLabel={layout.tierLabel}
            tierColor={layout.tierColor}
          />
        </CinematicMotionReveal>

        {/* Performer portrait — sits below the spread, not overlapping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <img
            src={p.profileImageUrl}
            alt={p.name}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${ac}`, boxShadow: `0 0 22px ${ac}55, 0 4px 16px rgba(0,0,0,0.7)`, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              {p.flag} {p.city} · {p.category}
            </div>
            <div style={{ fontSize: 9, color: layout.tierColor, fontWeight: 700, marginTop: 2, letterSpacing: '0.08em' }}>
              #{p.rank} · {p.tier.toUpperCase()} TIER · {p.xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* ── Identity strip ── */}
      <div style={{ padding: '18px 20px 24px', borderBottom: `1px solid ${ac}18`, maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
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

        {/* Tier upgrade nudge — shown to performers below Diamond */}
        {p.tier !== 'Diamond' && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: theme.accent, letterSpacing: '0.1em', border: `1px solid ${theme.accent}55`, borderRadius: 999, padding: '3px 10px', background: `${theme.accent}14` }}>
              {layout.tierLabel}
            </span>
            <Link href="/account/subscription" style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textDecoration: 'underline dotted' }}>
              Upgrade for a bigger magazine spread →
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <ArticleAudioPlayer
            title={`${p.name} — ${p.category} feature on The Musician's Index`}
            text={[
              `${p.name} is a ${p.tier} tier ${p.category} performer based in ${p.city}.`,
              `Currently ranked number ${p.rank} on The Musician's Index, with ${p.xp.toLocaleString()} XP and ${p.fanCount.toLocaleString()} fans.`,
              ...(performerArticles[0]?.blocks?.map(b => b.text ?? '').filter(Boolean) ?? [
                `${p.name} is an active artist in the ${p.category} scene, known for pushing boundaries and connecting deeply with their audience.`,
              ]),
              p.bio ?? '',
            ].filter(Boolean).join(' ')}
            accentColor={ac}
          />
          <HeartButton
            contentId={`article-${p.slug}`}
            contentType="article"
            performerId={p.slug}
            initialCount={0}
            accentColor={ac}
            size="sm"
            source="article_page"
          />
          <HeartButton
            contentId={`performer-${p.slug}`}
            contentType="performer_profile"
            performerId={p.slug}
            initialCount={0}
            accentColor="#FF2DAA"
            size="sm"
            source="article_page"
          />
          <FanJoinButton
            performerId={p.slug}
            performerName={p.name}
            initialFanCount={p.fanCount}
            accentColor="#00FF88"
            size="sm"
            showCount={false}
            source="article_identity_strip"
          />
        </div>
        <PerformerArticleShareBar
          articleSlug={p.slug}
          performerSlug={p.slug}
          performerName={p.name}
          headline={performerArticles[0]?.title ?? `${p.name} feature in TMI Magazine`}
          sharePath={sharePath}
          isLive={p.isLive}
        />
      </div>

      <MagazineThemeProvider theme={resolvedTheme} style={{ position: 'relative', zIndex: 1 }}>
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
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <HeartButton
                  contentId={`live-${p.slug}`}
                  contentType="live_performance"
                  performerId={p.slug}
                  initialCount={0}
                  accentColor="#E63000"
                  size="sm"
                  showCount={false}
                  source="article_live_panel"
                />
                <Link href={p.liveRoomRoute} style={{ padding: '6px 14px', background: '#E63000', borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '0.06em' }}>
                  JOIN →
                </Link>
              </div>
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
            <FanJoinButton
              performerId={p.slug}
              performerName={p.name}
              initialFanCount={p.fanCount}
              accentColor="#00FF88"
              size="md"
              source="article_commerce_rail"
            />
            <Link href={`/checkout?type=tip&artist=${p.slug}&amount=500&productName=${encodeURIComponent(`Tip for ${p.name}`)}`} style={{ padding: '9px 18px', background: ac, borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#050310', textDecoration: 'none', letterSpacing: '0.06em', boxShadow: `0 0 16px ${ac}44` }}>
              💸 SEND TIP
            </Link>
            <Link href="/tickets" style={{ padding: '9px 18px', background: 'rgba(0,229,255,0.12)', border: '1.5px solid rgba(0,229,255,0.4)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#00E5FF', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🎟 BUY TICKETS
            </Link>
            <Link href={`/fan-club/${p.slug}`} style={{ padding: '9px 18px', background: 'rgba(255,45,170,0.1)', border: '1.5px solid rgba(255,45,170,0.45)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#FF2DAA', textDecoration: 'none', letterSpacing: '0.06em' }}>
              ⭐ JOIN FAN CLUB
            </Link>
            <Link href="/store/merch" style={{ padding: '9px 18px', background: 'rgba(255,215,0,0.08)', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#FFD700', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🛍️ BUY MERCH
            </Link>
            <Link href={`/booking/artists/${p.slug}`} style={{ padding: '9px 18px', background: 'rgba(170,45,255,0.1)', border: '1.5px solid rgba(170,45,255,0.4)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#AA2DFF', textDecoration: 'none', letterSpacing: '0.06em' }}>
              📅 BOOK ARTIST
            </Link>
            <Link href={`/sponsors/advertise?target=${p.slug}`} style={{ padding: '9px 18px', background: 'transparent', border: `1.5px solid ${ac}44`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: ac, textDecoration: 'none', letterSpacing: '0.06em' }}>
              🤝 SPONSOR
            </Link>
            <Link href={p.liveRoomRoute} style={{ padding: '9px 18px', background: p.isLive ? 'rgba(230,48,0,0.15)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${p.isLive ? 'rgba(230,48,0,0.6)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, fontSize: 10, fontWeight: 900, color: p.isLive ? '#E63000' : 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🎥 LIVE ROOM
            </Link>
            <Link href="/rankings" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              🏆 RANKING
            </Link>
            <Link href={`/articles?category=${encodeURIComponent(p.category)}`} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              📰 MORE ARTICLES
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
      </MagazineThemeProvider>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes tmi-fog-drift { 0% { transform: translateX(-2%) translateY(0%); } 50% { transform: translateX(2%) translateY(-1%); } 100% { transform: translateX(-2%) translateY(0%); } }
        @keyframes tmi-particle-float { 0% { transform: translateY(0px); opacity: 0.08; } 50% { transform: translateY(-8px); opacity: 0.12; } 100% { transform: translateY(0px); opacity: 0.08; } }
        @keyframes tmi-light-pan { 0% { transform: translateX(-4%) rotate(0deg); } 50% { transform: translateX(4%) rotate(5deg); } 100% { transform: translateX(-4%) rotate(0deg); } }
        .tmi-theme-fog { animation: tmi-fog-drift 14s ease-in-out infinite; }
        .tmi-theme-particles { animation: tmi-particle-float 9s ease-in-out infinite; }
        .tmi-theme-lights { animation: tmi-light-pan 10s ease-in-out infinite; }
        .tmi-theme-glass { animation: tmi-light-pan 18s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tmi-theme-fog,
          .tmi-theme-particles,
          .tmi-theme-lights,
          .tmi-theme-glass {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
