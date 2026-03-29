'use client';
// SessionExpiredModal.tsx — Shown when session expires mid-session
// Copilot wires: useSessionExpiry() — fires when NextAuth session is invalid
// Proof: modal appears on 401 from API, login redirect preserves return URL
export function SessionExpiredModal({ returnUrl }: { returnUrl?: string }) {
  return (
    <div className="tmi-session-expired-modal" role="dialog" aria-modal="true" aria-label="Session expired">
      <div className="tmi-session-expired-modal__content">
        <div className="tmi-session-expired-modal__icon" aria-hidden="true">🔒</div>
        <h2 className="tmi-session-expired-modal__title">Your session expired</h2>
        <p className="tmi-session-expired-modal__body">Log back in to continue.</p>
        <a
          href={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
          className="tmi-btn-primary"
        >
          Log In
        </a>
      </div>
    </div>
  );
}
