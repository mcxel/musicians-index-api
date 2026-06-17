import { redirect } from "next/navigation";

// /hub/venue is the canonical Venue Hub. This route is kept only so
// old links/bookmarks still resolve somewhere real.
export default function DashboardVenueRedirect() {
  redirect("/hub/venue");
}
