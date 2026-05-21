// apps/web/src/app/battle/page.tsx
// Battle Room
// Layout: default | Auth: auth
// Copilot wires: useBattleRoom(roomId), useTurnQueue(), useSharedPreview()
// VS Code proves: turn lock enforced, both artists hear preview
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Battle Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--battle">
      <div className="tmi-page__inner">
        {/* BattleRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Battle Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
