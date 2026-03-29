// apps/web/src/app/notifications/page.tsx
// Notifications | Auth: auth
// Copilot wires: useNotifications(userId, { limit:50 }), markAllRead()
// VS Code proves: all types load, mark-read works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Notifications · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* NotificationPanel full-page variant — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Notifications</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
