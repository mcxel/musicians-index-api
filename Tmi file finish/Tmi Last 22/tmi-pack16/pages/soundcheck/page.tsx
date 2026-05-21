// apps/web/src/app/soundcheck/page.tsx
// Soundcheck
// Layout: default | Auth: artist
// Copilot wires: useSoundcheck(userId, eventId)
// VS Code proves: mic/video/beat all testable
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Soundcheck · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ARTIST role required — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--soundcheck">
      <div className="tmi-page__inner">
        {/* SoundcheckRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Soundcheck</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
