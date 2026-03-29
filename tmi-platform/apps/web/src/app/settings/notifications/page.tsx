// apps/web/src/app/settings/notifications/page.tsx
// Settings: Notifications | Auth: auth
// Copilot wires: useNotificationPreferences(userId), savePreferences()
// VS Code proves: prefs save and persist
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Settings: Notifications · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell + NotificationPreferencesPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings: Notifications</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
