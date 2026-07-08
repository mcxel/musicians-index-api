import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import type { MemoryItem, MemoryWallStats } from '@/lib/profiles/MemoryWallEngine';
import prisma from '@/lib/prisma';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MemoryWallCanvas = dynamic(
  () => import('@/components/memory/MemoryWallCanvas'),
  { ssr: false },
);

type Props = { params: Promise<{ slug: string }> };

async function findUserIdBySlug(slug: string): Promise<string | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { username: slug },
    select: { userId: true },
  });
  if (profile) return profile.userId;

  const user = await prisma.user.findFirst({
    where: { email: { startsWith: `${slug}@` } },
    select: { id: true },
  });
  return user?.id ?? null;
}

function computeStats(memories: MemoryItem[]): MemoryWallStats {
  return {
    totalMemories: memories.length,
    pinnedMemories: memories.filter((m) => m.pinnedAt !== undefined && m.pinnedAt !== null).length,
    photoCount: memories.filter((m) => m.contentType === 'photo').length,
    videoCount: memories.filter((m) => m.contentType === 'video').length,
    achievementCount: memories.filter((m) => m.contentType === 'achievement').length,
    ticketStubCount: memories.filter((m) => m.contentType === 'ticket-stub').length,
    lastUpdated: memories.length > 0 ? Math.max(...memories.map((m) => m.createdAt)) : Date.now(),
  };
}

export default async function FanMemoryPage({ params }: Props) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'fan',
    displayName: slug,
    routePath: `/fan/${slug}/memory`,
  });

  let memories: MemoryItem[] = [];
  try {
    const userId = await findUserIdBySlug(slug);
    if (userId) {
      const feedItems = await prisma.feedItem.findMany({
        where: { userId, type: 'MEMORY_WALL_ITEM', entityType: 'fan' },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      memories = feedItems.map((fi) => fi.data as unknown as MemoryItem);
    }
  } catch {
    // DB unavailable — MemoryWallCanvas falls back to DEMO_SEEDS
  }

  const stats = computeStats(memories);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Link href={`/fan/${slug}`} style={{ fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 800, letterSpacing: '0.15em' }}>
          ← FAN PROFILE
        </Link>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Memory Wall</h1>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {slug.toUpperCase()}
          </span>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',        value: stats.totalMemories, color: '#00FFFF' },
            { label: 'Pinned',       value: stats.pinnedMemories, color: '#FFD700' },
            { label: 'Achievements', value: stats.achievementCount, color: '#00FF88' },
            { label: 'Videos',       value: stats.videoCount, color: '#FF2DAA' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: '8px 16px',
              display: 'flex', gap: 8, alignItems: 'baseline',
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
                {s.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <MemoryWallCanvas
          entityId={slug}
          entityType="fan"
          initialMemories={memories}
          accentColor="#00FFFF"
        />
      </div>
    </main>
  );
}
