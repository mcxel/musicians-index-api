// apps/web/src/app/settings/account/page.tsx
// Settings: Account | Auth: auth
// Copilot wires: useAccount(userId), deleteAccount(), changePassword()
// VS Code proves: password change works, delete requires confirm
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Settings: Account · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell + AccountPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings: Account</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
