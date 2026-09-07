/**
 * LEGACY shim — /lobbies → /live/lobby-wall (P0 lobby convergence).
 * Lobby skins commerce remains at /store/lobbies.
 * Former fake room grid retired (Rule 20).
 */

import { redirect } from "next/navigation";

export default function LobbiesLegacyRedirect() {
  redirect("/live/lobby-wall");
}
