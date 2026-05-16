import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import {
  getMemoryWallStats,
  getTopMemories,
  listMemoriesForEntity,
} from '@/lib/profiles/MemoryWallEngine';
import Link from 'next/link';

type PerformerMemoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PerformerMemoryPage({ params }: PerformerMemoryPageProps) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'performer',
    displayName: slug,
    routePath: `/performers/${slug}/memory`,
  });

  const stats = getMemoryWallStats(slug, 'performer');
  const memories = listMemoriesForEntity(slug, 'performer');
  const topMemories = getTopMemories(slug, 'performer', 5);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 20 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 14 }}>
        <Link href={`/performers/${slug}`} style={{ color: '#00FFFF', textDecoration: 'none' }}>
          ← Back to Performer Profile
        </Link>
        <h1 style={{ margin: 0 }}>Performer Memory Wall</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
            gap: 10,
          }}
        >
          <div style={{ border: '1px solid rgba(0,255,255,0.3)', borderRadius: 10, padding: 10 }}>
            Total: {stats.totalMemories}
          </div>
          <div style={{ border: '1px solid rgba(255,45,170,0.3)', borderRadius: 10, padding: 10 }}>
            Pinned: {stats.pinnedMemories}
          </div>
          <div style={{ border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: 10 }}>
            Achievements: {stats.achievementCount}
          </div>
          <div style={{ border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, padding: 10 }}>
            Videos: {stats.videoCount}
          </div>
        </div>
        <section
          style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: 12, padding: 14 }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Top Memories</h2>
          {topMemories.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>No memories yet.</p>
          ) : (
            topMemories.map((memory) => (
              <div key={memory.memoryId} style={{ marginBottom: 8, fontSize: 14 }}>
                {memory.title} · {memory.contentType} · ❤ {memory.likes} · ↗ {memory.shares}
              </div>
            ))
          )}
        </section>
        <section
          style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: 12, padding: 14 }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18 }}>All Entries</h2>
          {memories.map((memory) => (
            <div
              key={memory.memoryId}
              style={{ marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}
            >
              {memory.title} ({memory.contentType})
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
