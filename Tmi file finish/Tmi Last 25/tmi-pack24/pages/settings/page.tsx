// apps/web/src/app/settings/page.tsx
// Settings | Auth: auth
// Copilot wires: redirect to /settings/profile
// VS Code proves: redirects correctly
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Settings · The Musician's Index' };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell (redirects to /profile) — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
