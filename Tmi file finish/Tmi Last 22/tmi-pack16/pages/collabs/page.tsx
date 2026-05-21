// apps/web/src/app/collabs/page.tsx
// Collabs
// Layout: default | Auth: auth
// Copilot wires: useCollabs(userId)
// VS Code proves: active collabs load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Collabs · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--collabs">
      <div className="tmi-page__inner">
        {/* CollabPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Collabs</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
