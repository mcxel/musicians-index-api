import { redirect } from "next/navigation";

// /hub/advertiser is the canonical Advertiser Hub. This route is kept only
// so old links/bookmarks still resolve somewhere real.
export default function DashboardAdvertiserRedirect() {
  redirect("/hub/advertiser");
}
