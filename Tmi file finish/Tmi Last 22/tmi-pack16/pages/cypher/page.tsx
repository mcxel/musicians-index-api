// apps/web/src/app/cypher/page.tsx
// Cypher Room
// Layout: default | Auth: auth
// Copilot wires: useCypherRoom(roomId), useProducerBeat(roomId)
// VS Code proves: queue advances, beat preview plays for all
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Cypher Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--cypher">
      <div className="tmi-page__inner">
        {/* CypherRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Cypher Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
