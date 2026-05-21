'use client';
// NotFoundShell.tsx — Custom 404 page content
// Used by: apps/web/src/app/not-found.tsx
// Proof: 404 routes render this, search bar works, lobby link works
export function NotFoundShell() {
  return (
    <div className="tmi-not-found">
      <div className="tmi-not-found__stage" aria-hidden="true">
        <span className="tmi-not-found__code">404</span>
        <span className="tmi-not-found__icon">🎤</span>
      </div>
      <h1 className="tmi-not-found__title">This stage is empty</h1>
      <p className="tmi-not-found__body">The page you're looking for doesn't exist or has moved.</p>
      <div className="tmi-not-found__actions">
        <a href="/" className="tmi-btn-primary">Back to Home</a>
        <a href="/lobby" className="tmi-btn-ghost">Go to Lobby</a>
        <a href="/discover" className="tmi-btn-ghost">Discover Artists</a>
      </div>
    </div>
  );
}
