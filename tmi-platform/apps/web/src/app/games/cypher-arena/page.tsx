import { redirect } from "next/navigation";

/**
 * /games/cypher-arena → canonical live Cipher Arena.
 *
 * LEGACY: This route previously rendered fabricated LIVE_ROUNDS / viewer
 * counters (Rule 20 violation). Canonical mount is CipherArenaShell on
 * /rooms/cypher. Do not restore the fake lobby telemetry page.
 */
export default function CypherArenaGamesRedirect() {
  redirect("/rooms/cypher");
}
