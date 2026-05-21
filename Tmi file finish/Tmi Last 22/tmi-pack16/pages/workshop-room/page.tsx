// apps/web/src/app/workshop-room/page.tsx
// Workshop Room
// Layout: default | Auth: auth
// Copilot wires: useWorkshop(roomId), useHostControls()
// VS Code proves: host can manage speakers
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Workshop Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--workshop-room">
      <div className="tmi-page__inner">
        {/* WorkshopRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Workshop Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
