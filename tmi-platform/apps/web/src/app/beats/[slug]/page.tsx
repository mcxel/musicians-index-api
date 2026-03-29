// apps/web/src/app/beats/[slug]/page.tsx
// Beat Detail | Auth: none
// Copilot wires: useBeat(slug), useLicenseBeat(beatId)
// VS Code proves: beat loads, license purchase works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Beat Detail · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* BeatDetailPanel, BeatCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Beat Detail</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
