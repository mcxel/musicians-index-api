// apps/web/src/app/watch-room/page.tsx
// Watch Room
// Layout: default | Auth: auth
// Copilot wires: useSharedMedia(roomId), useWatchPartySync(roomId)
// VS Code proves: all viewers see/hear same content
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Watch Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--watch-room">
      <div className="tmi-page__inner">
        {/* WatchRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Watch Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
