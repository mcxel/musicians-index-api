// apps/web/src/app/premiere-room/page.tsx
// Premiere Room
// Layout: default | Auth: auth
// Copilot wires: usePremiereRoom(roomId), useCountdown(targetDate)
// VS Code proves: countdown fires, release triggers at T=0
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Premiere Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--premiere-room">
      <div className="tmi-page__inner">
        {/* PremiereRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Premiere Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
