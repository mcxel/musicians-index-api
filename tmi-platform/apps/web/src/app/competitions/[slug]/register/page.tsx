// apps/web/src/app/competitions/[slug]/register/page.tsx
// Register for Competition | Auth: artist
// Copilot wires: useCompetitionRegister(slug)
// VS Code proves: registration submits, confirmation shows
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Register for Competition · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: ARTIST role required
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* CompetitionRegistrationForm — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Register for Competition</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
