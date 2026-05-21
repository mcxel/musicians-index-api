// apps/web/src/app/lobby/wall/page.tsx
// Lobby Wall
// Layout: default | Auth: none
// Copilot wires: useRoomList({ sort:'viewers_asc', limit:32 })
// VS Code proves: all rooms load sorted by viewers ascending
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Lobby Wall · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--lobby-wall">
      <div className="tmi-page__inner">
        {/* LobbyWallPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Lobby Wall</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
