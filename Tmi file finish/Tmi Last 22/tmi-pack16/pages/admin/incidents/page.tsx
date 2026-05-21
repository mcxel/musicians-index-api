// apps/web/src/app/admin/incidents/page.tsx
// Admin: Incidents
// Layout: default | Auth: admin
// Copilot wires: useIncidentLog({ limit:50 })
// VS Code proves: incident log loads
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Incidents · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-incidents">
      <div className="tmi-page__inner">
        {/* IncidentTimelinePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Incidents</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
