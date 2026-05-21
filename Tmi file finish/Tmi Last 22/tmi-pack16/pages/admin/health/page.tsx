// apps/web/src/app/admin/health/page.tsx
// Admin: Health
// Layout: default | Auth: admin
// Copilot wires: useSystemHealth(), useSLOStatus()
// VS Code proves: all health metrics show
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Health · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-health">
      <div className="tmi-page__inner">
        {/* HealthDashboardShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Health</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
