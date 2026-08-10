import { redirect } from "next/navigation";

/**
 * Legacy full-page living canvas — canonical YoPho is Universal Workspace on Performer Hub.
 */
export default function PerformerYoPhoCanvasPage() {
  redirect("/hub/performer?drawer=yopho");
}
