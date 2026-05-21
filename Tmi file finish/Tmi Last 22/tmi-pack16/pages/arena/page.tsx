// apps/web/src/app/arena/page.tsx
// Arena Room
// Layout: default | Auth: auth
// Copilot wires: useRoom(roomId), useSharedPreview(), useTurnQueue()
// VS Code proves: room loads, preview works, queue advances
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Arena Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--arena">
      <div className="tmi-page__inner">
        {/* ArenaRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Arena Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
