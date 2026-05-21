// apps/web/src/app/admin/feature-flags/page.tsx
// Admin: Feature Flags
// Layout: default | Auth: admin
// Copilot wires: useFeatureFlags(), toggleFlag(name,value)
// VS Code proves: flags toggle within 60s
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Admin: Feature Flags · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ADMIN role (Big Ace) required — middleware enforces
  // Redirect to /unauthorized if role != admin
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--admin-feature-flags">
      <div className="tmi-page__inner">
        {/* KillSwitchPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Admin: Feature Flags</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
