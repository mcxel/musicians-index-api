// apps/web/src/app/admin/bots/page.tsx
// Admin: Bots
// Layout: default | Auth: admin
// Copilot wires: useBotManifests(), useBotStatus()
// VS Code proves: all 26+ bots show status
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Bots · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-bots">
      <div className="tmi-page__inner">
        {/* BotStatusPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Bots</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
