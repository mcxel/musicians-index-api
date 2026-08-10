import { redirect } from "next/navigation";

/**
 * Legacy full-page YoPho route — canonical studio is Universal Workspace on Fan Hub.
 * Server redirect only (no client replace loop).
 */
export default function FanYoPhoCanvasPage() {
  redirect("/hub/fan?drawer=yopho");
}
