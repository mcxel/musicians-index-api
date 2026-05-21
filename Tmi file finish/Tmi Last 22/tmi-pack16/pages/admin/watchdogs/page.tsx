// apps/web/src/app/admin/watchdogs/page.tsx
// Admin: Watchdogs
// Layout: default | Auth: admin
// Copilot wires: useRoomWatchdog(), useSystemHealth()
// VS Code proves: watchdog states report correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Watchdogs · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-watchdogs">
      <div className="tmi-page__inner">
        {/* WatchdogGridPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Watchdogs</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
