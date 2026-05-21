// apps/web/src/app/lobby/random/page.tsx
// Random Join
// Layout: default | Auth: none
// Copilot wires: useMatchmaking() — routes by role/genre/capacity
// VS Code proves: user lands in open room
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Random Join · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--lobby-random">
      <div className="tmi-page__inner">
        {/* RandomJoinGatewayCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Random Join</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
