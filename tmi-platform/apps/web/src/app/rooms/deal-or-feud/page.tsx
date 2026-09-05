import { redirect } from "next/navigation";
import { millHrefForExperience } from "@/lib/live/ExperienceRoomRegistry";

/** Alias → canonical mill. HUD modules mount on /live/rooms/[id] + UVR. */
export default function DealOrFeudRoomPage() {
  redirect(millHrefForExperience("DEALERS_CHOICE", { from: "rooms-deal-or-feud" }));
}
