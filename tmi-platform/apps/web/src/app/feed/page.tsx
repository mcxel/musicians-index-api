// apps/web/src/app/feed/page.tsx
// Activity Feed | Auth: auth
// Copilot wires: useActivityFeed(userId, { limit:20 })
// VS Code proves: feed loads, cards render by type
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Activity Feed · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* ActivityFeedPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Activity Feed</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
