import { redirect } from "next/navigation";
import { millHrefForExperience } from "@/lib/live/ExperienceRoomRegistry";

export default function NameThatTuneRoomPage() {
  redirect(millHrefForExperience("NAME_THAT_TUNE", { from: "rooms-name-that-tune" }));
}
