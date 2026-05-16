import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import { getLobbyStats, listLobbiesByEntity } from '@/lib/lobbies/PersonalLobbyEngine';
import Link from 'next/link';

type PerformerLobbyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PerformerLobbyPage({ params }: PerformerLobbyPageProps) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'performer',
    displayName: slug,
    routePath: `/performers/${slug}/lobby`,
  });

  const lobby = listLobbiesByEntity(slug, 'performer')[0] ?? null;
  const stats = lobby ? getLobbyStats(lobby.lobbyId) : null;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 12 }}>
        <Link href={`/performers/${slug}`} style={{ color: '#00FFFF', textDecoration: 'none' }}>
          ← Back to Performer Profile
        </Link>
        <h1 style={{ margin: 0 }}>Performer Lobby</h1>
        <p style={{ marginTop: 0, color: 'rgba(255,255,255,0.75)' }}>
          Performer lobby route is now wired and runtime-backed.
        </p>

        <div style={{ border: '1px solid rgba(0,255,136,0.35)', borderRadius: 12, padding: 14 }}>
          <div>Lobby: {lobby?.lobbyName ?? 'Not available'}</div>
          <div>Type: {lobby?.lobbyType ?? 'n/a'}</div>
          <div>Theme: {lobby?.skinTheme ?? 'n/a'}</div>
          <div>Visits: {stats?.visits ?? 0}</div>
          <div>Occupancy: {stats ? `${Math.round(stats.occupancyPercent)}%` : '0%'}</div>
        </div>
      </div>
    </main>
  );
}
