import { redirect } from "next/navigation";

// /hub/promoter is the canonical Promoter Hub. This route is kept only so
// old links/bookmarks still resolve somewhere real.
export default function DashboardPromoterRedirect() {
  redirect("/hub/promoter");
}
