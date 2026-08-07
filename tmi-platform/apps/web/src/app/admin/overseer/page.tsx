import { Suspense } from "react";
import WorkspaceManager from "@/components/admin/overseer/workspace/WorkspaceManager";

export const metadata = {
  title: "Overseer Deck | TMI Admin",
  description: "Canonical broadcast command deck for administration operations.",
};

/**
 * /admin/overseer → WorkspaceManager → OverseerFlightDeck only.
 * CanonOverseerShell is a re-export of OverseerFlightDeck (no oval top bar).
 * Admin Camera toggle removed (2026-08-04, Marcel) — was reported reappearing after
 * concurrent-edit regressions; no camera/mic overlay on this deck. No TMIVideoMonitor /
 * VoiceDirector floaters either. Workspace from session only — no ?workspace= auth.
 */
export default function OverseerDeckPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800 }}>LOADING DECK…</div>
      </div>
    }>
      <WorkspaceManager />
    </Suspense>
  );
}
