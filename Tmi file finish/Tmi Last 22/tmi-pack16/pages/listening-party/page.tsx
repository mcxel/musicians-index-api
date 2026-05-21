// apps/web/src/app/listening-party/page.tsx
// Listening Party
// Layout: default | Auth: auth
// Copilot wires: useAlbumSync(roomId)
// VS Code proves: all hear same track at same timestamp
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Listening Party · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--listening-party">
      <div className="tmi-page__inner">
        {/* ListeningPartyRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Listening Party</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
