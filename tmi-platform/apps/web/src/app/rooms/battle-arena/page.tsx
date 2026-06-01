import { redirect } from "next/navigation";

// Battle Arena → LobbyTheaterShell with battle venue skin (Arena, 18,500 cap)
// The [slug] route handles "battle-arena" and maps to venueIndex=1 via slugToVenueConfig
export default function BattleArenaPage() {
  redirect("/battles/live");
}
