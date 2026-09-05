import { redirect } from "next/navigation";
import { millHrefForExperience } from "@/lib/live/ExperienceRoomRegistry";

export default function ContestPerformanceRoomPage() {
  redirect(millHrefForExperience("CONTEST", { from: "rooms-contest-performance" }));
}
