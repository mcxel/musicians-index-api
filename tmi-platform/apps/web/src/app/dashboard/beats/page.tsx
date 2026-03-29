// apps/web/src/app/dashboard/beats/page.tsx
// My Beats | Auth: artist
// Copilot wires: useProducerBeats(producerId), publishBeat(), unpublishBeat()
// VS Code proves: all beats show, publish/unpublish works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "My Beats · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: ARTIST role required
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* ProducerBeatDashboard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>My Beats</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
