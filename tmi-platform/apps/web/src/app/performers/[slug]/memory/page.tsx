import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import { getMemoryWallStats, listMemoriesForEntity } from '@/lib/profiles/MemoryWallEngine';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MemoryWallCanvas = dynamic(
  () => import('@/components/memory/MemoryWallCanvas'),
  { ssr: false },
);

type Props = { params: Promise<{ slug: string }> };

export default async function PerformerMemoryPage({ params }: Props) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'performer',
    displayName: slug,
    routePath: `/performers/${slug}/memory`,
  });

  const stats = getMemoryWallStats(slug, 'performer');
  const memories = listMemoriesForEntity(slug, 'performer');

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Link href={`/performers/${slug}`} style={{ fontSize: 9, color: '#FF2DAA', textDecoration: 'none', fontWeight: 800, letterSpacing: '0.15em' }}>
          ← PERFORMER PROFILE
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
            { label: 'Total',        value: stats.totalMemories, color: '#FF2DAA' },
            { label: 'Pinned',       value: stats.pinnedMemories, color: '#FFD700' },
            { label: 'Achievements', value: stats.achievementCount, color: '#00FF88' },
            { label: 'Videos',       value: stats.videoCount, color: '#AA2DFF' },
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
          entityType="performer"
          initialMemories={memories}
          accentColor="#FF2DAA"
        />
      </div>
    </main>
  );
}
