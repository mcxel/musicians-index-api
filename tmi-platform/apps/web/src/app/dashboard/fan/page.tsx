import { redirect } from "next/navigation";

// /hub/fan is the canonical Fan Hub (see middleware.ts roleDashboardPath()
// and api/auth/google/callback/route.ts roleToHub()). This route is kept
// only so old links/bookmarks still resolve somewhere real.
export default function DashboardFanRedirect() {
  redirect("/hub/fan");
}
