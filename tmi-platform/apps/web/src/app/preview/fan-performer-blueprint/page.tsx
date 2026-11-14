import { redirect } from "next/navigation";

/**
 * LEGACY — unmounted 2026-09-10.
 * Former mount of TMILiveRoomExperience with fabricated Diamond tier,
 * viewer counts, and chat. Not a certified production surface (Rule 20).
 * Canonical live entry: /live/lobby-wall → LobbyEntryFlow → UVR.
 * XR / first-person VR intentionally NOT started (Step 5A gate).
 */
export default function FanPerformerBlueprintPreviewPage() {
  redirect("/live/lobby-wall");
}
