// apps/web/src/app/producers/[slug]/rooms/page.tsx
// Producer Rooms
// Layout: default | Auth: none
// Copilot wires: useProducerRooms(slug)
// VS Code proves: room history loads
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Producer Rooms · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--producers-slug-rooms">
      <div className="tmi-page__inner">
        {/* ProducerRoomHistoryPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Producer Rooms</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
