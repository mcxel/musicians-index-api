// apps/web/src/app/green-room/page.tsx
// Green Room
// Layout: default | Auth: artist
// Copilot wires: useGreenRoom(userId, eventId)
// VS Code proves: performer can review set
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Green Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ARTIST role required — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--green-room">
      <div className="tmi-page__inner">
        {/* GreenRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Green Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
