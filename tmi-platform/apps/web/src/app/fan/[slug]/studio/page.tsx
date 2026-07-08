import Link from 'next/link';
import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import prisma from '@/lib/prisma';
import FanRetroVisionStudio from '@/components/fan/FanRetroVisionStudio';
import { getDefaultRetroVisionBackdrop, type FanTier } from '@/lib/studio/retroVisionRegistry';
import dynamic from 'next/dynamic';

const MemoryWallCanvas = dynamic(() => import('@/components/memory/MemoryWallCanvas'), { ssr: false });

type Props = { params: Promise<{ slug: string }> };

function titleCase(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function getFanData(slug: string) {
  const user = await prisma.user.findFirst({
    where: { id: { startsWith: slug } },
    include: { userProfile: true, userStats: true, fanProfile: true },
  }).catch(() => null);

  if (!user) {
    return {
      displayName: titleCase(slug),
      avatarUrl: null as string | null,
      tier: 'free' as const,
      found: false,
    };
  }

  return {
    displayName: user.userProfile?.displayName ?? user.displayName ?? user.name ?? titleCase(slug),
    avatarUrl: user.userProfile?.avatarUrl ?? null,
    tier: user.tier.toLowerCase() as FanTier,
    found: true,
  };
}

export default async function FanStudioPage({ params }: Props) {
  const { slug } = await params;
  ensureProfileEconomyRuntime({ slug, entityType: 'fan', displayName: slug, routePath: `/fan/${slug}/studio` });

  const fan = await getFanData(slug);
  const backdrop = getDefaultRetroVisionBackdrop(fan.tier);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '20px 20px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Link href={`/fan/${slug}`} style={{ fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 800, letterSpacing: '0.15em' }}>
          ← FAN PROFILE
        </Link>

        <FanRetroVisionStudio
          fanSlug={slug}
          fanName={fan.displayName}
          fanTier={fan.tier}
          avatarUrl={fan.avatarUrl}
          accentColor={backdrop.accent}
        />

        <section style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: '#FF2DAA' }}>MEMORY WALL STUDIO</div>
              <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 900 }}>Keep the created keepsakes in the fan vault</h2>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Backdrops and memory items share the same visual language</div>
          </div>

          <MemoryWallCanvas entityId={slug} entityType="fan" accentColor={backdrop.accent} />
        </section>
      </div>
    </main>
  );
}