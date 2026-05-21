// apps/web/src/app/radio-room/page.tsx
// Radio Room
// Layout: default | Auth: auth
// Copilot wires: useRadioRoom(roomId), useStreamBroadcast()
// VS Code proves: stream broadcasts correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Radio Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--radio-room">
      <div className="tmi-page__inner">
        {/* RadioRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Radio Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
