// apps/web/src/app/live-world/page.tsx
// Live World
// Layout: default | Auth: none
// Copilot wires: useRoomList, useWorldActivity
// VS Code proves: lobby wall loads, rooms sorted discovery-first
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Live World · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--live-world">
      <div className="tmi-page__inner">
        {/* LiveWorldExtendedShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Live World</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
