// apps/web/src/app/collab-room/page.tsx
// Collab Room
// Layout: default | Auth: auth
// Copilot wires: useCollabRoom(roomId)
// VS Code proves: multiple artists can collab
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Collab Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--collab-room">
      <div className="tmi-page__inner">
        {/* CollabRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Collab Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
