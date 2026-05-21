// apps/web/src/app/podcast-room/page.tsx
// Podcast Room
// Layout: default | Auth: auth
// Copilot wires: usePodcastRoom(roomId)
// VS Code proves: podcast format renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Podcast Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--podcast-room">
      <div className="tmi-page__inner">
        {/* PodcastRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Podcast Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
