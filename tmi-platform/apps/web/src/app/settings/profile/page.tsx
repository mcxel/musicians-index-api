// apps/web/src/app/settings/profile/page.tsx
// Settings: Profile | Auth: auth
// Copilot wires: useProfile(userId), updateProfile(data)
// VS Code proves: edits save, avatar upload works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Settings: Profile · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell + ProfileEditForm — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings: Profile</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
