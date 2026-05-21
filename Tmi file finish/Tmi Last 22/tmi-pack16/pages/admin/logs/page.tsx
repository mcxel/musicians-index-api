// apps/web/src/app/admin/logs/page.tsx
// Admin: Logs
// Layout: default | Auth: admin
// Copilot wires: usePlatformLogs({ level:'warn', limit:100})
// VS Code proves: logs load and filter
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Logs · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-logs">
      <div className="tmi-page__inner">
        {/* LogViewerPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Logs</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
