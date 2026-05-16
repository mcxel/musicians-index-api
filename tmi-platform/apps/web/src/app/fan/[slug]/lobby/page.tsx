import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import { getLobbyStats, listLobbiesByEntity } from '@/lib/lobbies/PersonalLobbyEngine';
import Link from 'next/link';

type FanLobbyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FanLobbyPage({ params }: FanLobbyPageProps) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'fan',
    displayName: slug,
    routePath: `/fan/${slug}/lobby`,
  });

  const lobby = listLobbiesByEntity(slug, 'fan')[0] ?? null;
  const stats = lobby ? getLobbyStats(lobby.lobbyId) : null;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 12 }}>
        <Link href={`/fan/${slug}`} style={{ color: '#00FFFF', textDecoration: 'none' }}>
          ← Back to Fan Profile
        </Link>
        <h1 style={{ margin: 0 }}>Fan Lobby</h1>
        <p style={{ marginTop: 0, color: 'rgba(255,255,255,0.75)' }}>
          Personal lobby route is now active and wired to PersonalLobbyEngine.
        </p>

        <div style={{ border: '1px solid rgba(0,255,255,0.35)', borderRadius: 12, padding: 14 }}>
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
