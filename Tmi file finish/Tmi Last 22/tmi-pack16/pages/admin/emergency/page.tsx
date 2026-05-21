// apps/web/src/app/admin/emergency/page.tsx
// Admin: Emergency
// Layout: default | Auth: admin
// Copilot wires: useBroadcast(), useEmergencyMode()
// VS Code proves: broadcast sends to all surfaces
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Emergency · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-emergency">
      <div className="tmi-page__inner">
        {/* EmergencyBroadcastPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Emergency</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
