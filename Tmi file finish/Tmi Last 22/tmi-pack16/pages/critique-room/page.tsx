// apps/web/src/app/critique-room/page.tsx
// Critique Room
// Layout: default | Auth: auth
// Copilot wires: useCritiqueRoom(roomId)
// VS Code proves: critique format renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Critique Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--critique-room">
      <div className="tmi-page__inner">
        {/* CritiqueRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Critique Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
