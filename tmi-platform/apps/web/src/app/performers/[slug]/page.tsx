import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPerformerBySlug, PERFORMER_REGISTRY, getTierColor } from '@/lib/performers/PerformerRegistry';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { sortPerformersByFreshness } from '@/lib/content/ContentFreshness';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import ProfileLobbyRuntime from '@/components/profile/ProfileLobbyRuntime';

export async function generateStaticParams() {
  return PERFORMER_REGISTRY.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getPerformerBySlug(params.slug);
  if (!p) return { title: 'Performer — TMI' };
  return {
    title: `${p.name} — ${p.category} · The Musician's Index`,
    description: p.bio ?? `${p.name} is a ${p.tier} ${p.category} performer on TMI. Rank #${p.rank} · ${p.fanCount.toLocaleString()} fans.`,
    openGraph: {
      title: `${p.name} | TMI Profile`,
      description: `${p.category} · Rank #${p.rank} · ${p.xp.toLocaleString()} XP · ${p.city}`,
      images: [{ url: p.profileImageUrl }],
    },
  };
}

export default function PerformerProfilePage({ params }: { params: { slug: string } }) {
  const p = getPerformerBySlug(params.slug);
  if (!p) notFound();

  const ac = getTierColor(p.tier);

  // Rule 11: Content Freshness — live-first peer performers for discovery
  const liveFirstPeers = sortPerformersByFreshness(
    PERFORMER_REGISTRY.filter(r => r.slug !== p.slug && r.category === p.category)
  );

  // Rule 12: No Empty Inventory
  const profileAd = getAdSlotForZone(`performer-profile-${p.slug}`);

  return (
    <>
      {/* Rule 2: Live video overrides static — surface live panel prominently */}
      {p.isLive && (
        <div style={{ background: 'linear-gradient(90deg, rgba(230,48,0,0.18), rgba(10,6,20,0.95))', borderBottom: '1.5px solid rgba(230,48,0,0.5)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 10px #E63000', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>
              {p.name} IS LIVE NOW · {p.audienceCount.toLocaleString()} WATCHING
            </span>
          </div>
          <a href={p.liveRoomRoute} style={{ padding: '8px 20px', background: '#E63000', borderRadius: 8, fontSize: 11, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '0.08em', boxShadow: '0 0 20px rgba(230,48,0,0.5)' }}>
            🔴 JOIN LIVE NOW →
          </a>
        </div>
      )}

      {/* Rule 1+2: Registry-driven data + LIVE VIDEO → MOTION POSTER → STATIC chain */}
      <ProfileLobbyRuntime
        role="performer"
        displayName={p.name}
        userId={p.slug}
        bio={p.bio ?? `${p.name} is a ${p.tier} tier ${p.category} performer based in ${p.city}. Rank #${p.rank} with ${p.xp.toLocaleString()} XP and ${p.fanCount.toLocaleString()} fans on TMI.`}
        stats={{ followers: p.fanCount, xp: p.xp }}
        isLive={p.isLive}
        videoSrc={p.introVideoUrl}
      />

      {/* Rule 12: Ad slot — Paid → Platform Promo → AdSense → Advertise CTA */}
      {profileAd.type === 'platform' && profileAd.platformPromo && (
        <div style={{ maxWidth: 900, margin: '8px auto', padding: '0 20px' }}>
          <div style={{ background: `${profileAd.platformPromo.accentColor}0a`, border: `1px solid ${profileAd.platformPromo.accentColor}33`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: profileAd.platformPromo.accentColor }}>{profileAd.platformPromo.headline}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{profileAd.platformPromo.body}</div>
            </div>
            <a href={profileAd.platformPromo.ctaHref} style={{ padding: '6px 14px', background: profileAd.platformPromo.accentColor, borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#050310', textDecoration: 'none', flexShrink: 0 }}>
              {profileAd.platformPromo.ctaLabel}
            </a>
          </div>
        </div>
      )}

      {/* Rule 6: Discovery Rails — profile hub keeps users in the content graph */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
        {liveFirstPeers.length > 0 && (
          <DiscoveryRail type="performers" tags={[p.category]} exclude={p.slug} accentColor={ac} label={`MORE ${p.category.toUpperCase()} ARTISTS`} />
        )}
        <DiscoveryRail type="articles" tags={[p.category]} accentColor={ac} label="PRESS & FEATURES" />
        <DiscoveryRail type="liveRooms" accentColor="#E63000" label="LIVE NOW" />
        <DiscoveryRail type="games" accentColor="#AA2DFF" label="BATTLES & GAMES" />
        <DiscoveryRail type="sponsors" accentColor="#FFD700" label="PLATFORM PARTNERS" />
      </div>
    </>
  );
}
