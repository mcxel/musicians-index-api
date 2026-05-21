// apps/web/src/app/loading.tsx
// Global loading state — shows during page segment transitions
// Copilot wires: replace with branded loader animation
// VS Code proves: loading state shows during slow navigation
export default function Loading() {
  return (
    <div className="tmi-loading-screen" aria-label="Loading" role="status">
      <div className="tmi-loading-screen__logo" aria-hidden="true">TMI</div>
      <div className="tmi-loading-screen__pulse" aria-hidden="true" />
      <span className="tmi-visually-hidden">Loading...</span>
    </div>
  );
}
