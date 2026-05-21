// apps/web/src/app/admin/recovery/page.tsx
// Admin: Recovery
// Layout: default | Auth: admin
// Copilot wires: useRecovery()
// VS Code proves: recovery actions available
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Recovery · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-recovery">
      <div className="tmi-page__inner">
        {/* RecoveryActionsPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Recovery</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
