import { ensureProfileEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import { getLobbyStats, listLobbiesByEntity } from '@/lib/lobbies/PersonalLobbyEngine';
import Link from 'next/link';

type ArtistLobbyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArtistLobbyPage({ params }: ArtistLobbyPageProps) {
  const { slug } = await params;

  ensureProfileEconomyRuntime({
    slug,
    entityType: 'artist',
    displayName: slug,
    routePath: `/artists/${slug}/lobby`,
  });

  const lobby = listLobbiesByEntity(slug, 'artist')[0] ?? null;
  const stats = lobby ? getLobbyStats(lobby.lobbyId) : null;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 12 }}>
        <Link href={`/artists/${slug}`} style={{ color: '#00FFFF', textDecoration: 'none' }}>
          ← Back to Artist Profile
        </Link>
        <h1 style={{ margin: 0 }}>Artist Lobby</h1>
        <p style={{ marginTop: 0, color: 'rgba(255,255,255,0.75)' }}>
          Artist personal lobby is now active with route-level runtime wiring.
        </p>

        <div style={{ border: '1px solid rgba(255,45,170,0.35)', borderRadius: 12, padding: 14 }}>
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
