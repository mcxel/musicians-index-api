import WorkspaceManager from "@/components/admin/overseer/workspace/WorkspaceManager";

export const metadata = {
  title: "Overseer Deck | TMI Admin",
  description: "Canonical broadcast command deck for administration operations.",
};

/**
 * /admin/overseer → WorkspaceManager → OverseerFlightDeck only.
 * CanonOverseerShell is a re-export of OverseerFlightDeck (no oval top bar).
 * Admin Cam = center gem / 📷 OverlayHost. No TMIVideoMonitor / VoiceDirector floaters.
 */
export default function OverseerDeckPage() {
  return <WorkspaceManager />;
}
