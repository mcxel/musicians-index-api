// apps/web/src/app/producer-room/page.tsx
// Producer Room
// Layout: default | Auth: auth
// Copilot wires: useProducerBeatLocker(producerId), useBeatCast(roomId)
// VS Code proves: producer casts beat, all in room hear it
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Producer Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--producer-room">
      <div className="tmi-page__inner">
        {/* ProducerRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Producer Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
