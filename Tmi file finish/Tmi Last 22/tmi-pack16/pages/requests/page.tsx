// apps/web/src/app/requests/page.tsx
// Requests
// Layout: default | Auth: auth
// Copilot wires: useRequests(userId)
// VS Code proves: requests load, respond works
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Requests · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--requests">
      <div className="tmi-page__inner">
        {/* RequestQueuePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Requests</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
