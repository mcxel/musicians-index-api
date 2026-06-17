import { redirect } from "next/navigation";

// /hub/performer is the canonical Performer Hub (see middleware.ts
// roleDashboardPath() and api/auth/google/callback/route.ts roleToHub()).
// This route is kept only so old links/bookmarks still resolve somewhere real.
export default function DashboardPerformerRedirect() {
  redirect("/hub/performer");
}
