import { redirect } from "next/navigation";

/**
 * Alias → canonical CipherArenaShell mount at /rooms/cypher.
 * LEGACY path name retained for discovery links; do not reintroduce a second shell.
 */
export default function CypherArenaPage() {
  redirect("/rooms/cypher");
}
