import { redirect } from "next/navigation";

// Monday Cypher → LobbyTheaterShell slug=cypher-monday (Theater venue, 2,730 cap)
export default function MondayCypherPage() {
  redirect("/rooms/cypher-monday?autoSeat=1");
}
