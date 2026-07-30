import { redirect } from "next/navigation";

// Canonical Fan Lobby route is /rooms/fan-lobby (matches this app's established
// /rooms/* convention - world-dance-party, vip-lounge, party-lobby, etc).
// This path previously imported a FlightDeckShell that doesn't exist anywhere
// in the repo and passed a prop shape FanLobbyVenue no longer accepts - rather
// than duplicate the route or stub a fake shell component, it redirects.
export default function FanLobbyRedirectPage() {
  redirect("/rooms/fan-lobby");
}
