'use client';
// PWAInstallPrompt.tsx — "Add to Home Screen" banner
// Copilot wires: beforeinstallprompt event on non-iOS, manual instructions on iOS
// Proof: shows after 2nd page visit if not dismissed, install triggers add-to-home
export function PWAInstallPrompt() {
  return (
    <div className="tmi-pwa-prompt" role="banner" aria-label="Install TMI app">
      <div className="tmi-pwa-prompt__content">
        <span className="tmi-pwa-prompt__icon" aria-hidden="true">📱</span>
        <div className="tmi-pwa-prompt__text">
          <strong>Add to Home Screen</strong>
          <span>One-tap access to live music</span>
        </div>
      </div>
      <div className="tmi-pwa-prompt__actions">
        <button className="tmi-btn-primary tmi-btn--sm" data-action="install">Add</button>
        <button className="tmi-btn-ghost tmi-btn--sm" data-action="dismiss">Not now</button>
      </div>
    </div>
  );
}
