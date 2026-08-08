import { redirect } from "next/navigation";

/**
 * /live index was a fake viewer-count card wall (Rule 20 violation).
 * Canonical Live Now destination: continuous Live Lobby Wall (Brady-Bunch video tiles).
 * Nav / Quick Panel LIVE open GlobalLiveDiscoveryOverlay; direct URL hits the wall route.
 */
export default function LiveIndexPage() {
  redirect("/live/lobby-wall");
}
