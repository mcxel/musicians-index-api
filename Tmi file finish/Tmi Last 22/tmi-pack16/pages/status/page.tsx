// apps/web/src/app/status/page.tsx
// Platform Status
// Layout: default | Auth: none
// Copilot wires: useSystemHealth()
// VS Code proves: health states display
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Platform Status · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--status">
      <div className="tmi-page__inner">
        {/* SystemStatusCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Platform Status</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
