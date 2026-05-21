// apps/web/src/app/admin/crown/page.tsx
// Admin: Crown
// Layout: default | Auth: admin
// Copilot wires: useCrownState(), overrideCrown()
// VS Code proves: crown state shows, override works
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Crown · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-crown">
      <div className="tmi-page__inner">
        {/* CrownAdminPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Crown</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
