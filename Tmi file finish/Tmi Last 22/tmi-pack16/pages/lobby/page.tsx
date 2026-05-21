// apps/web/src/app/lobby/page.tsx
// Lobby
// Layout: default | Auth: none
// Copilot wires: useRoomList({ sort:'viewers_asc' }), useMatchmaking
// VS Code proves: position 1 = 0-viewer artist (CRITICAL)
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Lobby · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--lobby">
      <div className="tmi-page__inner">
        {/* LobbyWallPanel, RandomJoinGatewayCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Lobby</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
