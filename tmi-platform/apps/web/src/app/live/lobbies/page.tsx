/**
 * LEGACY shim — /live/lobbies → /live/lobby-wall (P0 lobby convergence).
 * Former demo check-in surface retired; do not remount fake cards.
 */

import { redirect } from "next/navigation";

export default function LiveLobbiesLegacyRedirect() {
  redirect("/live/lobby-wall");
}
