// apps/web/src/app/settings/privacy/page.tsx
// Settings: Privacy | Auth: auth
// Copilot wires: usePrivacySettings(userId), updatePrivacy()
// VS Code proves: privacy toggles save
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Settings: Privacy · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell + PrivacyPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings: Privacy</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
