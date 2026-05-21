// apps/web/src/app/hall-of-fame/page.tsx
// Hall of Fame
// Layout: default | Auth: none
// Copilot wires: useHallOfFame()
// VS Code proves: hall of fame entries load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Hall of Fame · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--hall-of-fame">
      <div className="tmi-page__inner">
        {/* HallOfFamePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Hall of Fame</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
