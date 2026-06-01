import { redirect } from "next/navigation";

// Cypher Arena → open mic rotation room (Theater, 2,730 cap)
export default function CypherArenaPage() {
  redirect("/rooms/cypher");
}
