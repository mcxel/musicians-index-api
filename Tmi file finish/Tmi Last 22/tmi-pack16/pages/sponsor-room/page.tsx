// apps/web/src/app/sponsor-room/page.tsx
// Sponsor Room
// Layout: default | Auth: auth
// Copilot wires: useSponsorRoom(roomId), useSponsorCampaign()
// VS Code proves: sponsor content displays correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Sponsor Room · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--sponsor-room">
      <div className="tmi-page__inner">
        {/* SponsorRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Sponsor Room</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
