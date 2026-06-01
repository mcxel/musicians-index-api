import { redirect } from "next/navigation";

// Legacy /live/lobby — now redirects to the billboard lobby wall
// The new flow: browse rooms visually → click tile → enter venue → auto-sit
export default function LiveLobbyPage() {
  redirect("/live/rooms");
}
