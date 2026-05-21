// apps/web/src/app/cypher/mini/page.tsx
// Mini Cypher
// Layout: default | Auth: auth
// Copilot wires: useOpenCypher(roomId), useMatchmaking()
// VS Code proves: drop-in/drop-out works freely
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Mini Cypher · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--cypher-mini">
      <div className="tmi-page__inner">
        {/* MiniCypherRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Mini Cypher</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
