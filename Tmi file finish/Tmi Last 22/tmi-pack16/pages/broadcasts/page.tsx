// apps/web/src/app/broadcasts/page.tsx
// Broadcasts
// Layout: default | Auth: auth
// Copilot wires: useBroadcasts()
// VS Code proves: broadcasts load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Broadcasts · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--broadcasts">
      <div className="tmi-page__inner">
        {/* BroadcastPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Broadcasts</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
