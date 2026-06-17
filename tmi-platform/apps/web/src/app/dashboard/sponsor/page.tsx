import { redirect } from "next/navigation";

// /hub/sponsor is the canonical Sponsor Hub. This route is kept only so
// old links/bookmarks still resolve somewhere real.
export default function DashboardSponsorRedirect() {
  redirect("/hub/sponsor");
}
