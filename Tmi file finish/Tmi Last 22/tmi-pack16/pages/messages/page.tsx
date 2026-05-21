// apps/web/src/app/messages/page.tsx
// Messages
// Layout: default | Auth: auth
// Copilot wires: useMessages(userId)
// VS Code proves: messages load and send
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Messages · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--messages">
      <div className="tmi-page__inner">
        {/* MessageListShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Messages</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
