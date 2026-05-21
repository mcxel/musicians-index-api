'use client';
// PlatformErrorShell.tsx — Custom 500 error page content
// Used by: apps/web/src/app/error.tsx and apps/web/src/app/global-error.tsx
// Proof: server errors render this, retry button works
export function PlatformErrorShell({ reset }: { reset?: () => void }) {
  return (
    <div className="tmi-platform-error">
      <div className="tmi-platform-error__icon" aria-hidden="true">⚠️</div>
      <h1 className="tmi-platform-error__title">Something went wrong</h1>
      <p className="tmi-platform-error__body">
        The platform hit an unexpected error. Our team has been notified.
      </p>
      <div className="tmi-platform-error__actions">
        {reset && <button onClick={reset} className="tmi-btn-primary">Try Again</button>}
        <a href="/" className="tmi-btn-ghost">Go Home</a>
        <a href="/status" className="tmi-btn-ghost">Check Status</a>
      </div>
    </div>
  );
}
