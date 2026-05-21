// apps/web/src/app/awards-room/page.tsx
// Awards Room
// Layout: default | Auth: auth
// Copilot wires: useAwardsRoom(roomId), useAwardResults()
// VS Code proves: winner reveal animates correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Awards Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--awards-room">
      <div className="tmi-page__inner">
        {/* AwardsRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Awards Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
