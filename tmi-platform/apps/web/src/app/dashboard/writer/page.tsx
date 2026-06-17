import { redirect } from "next/navigation";

// /hub/writer is the canonical Writer Hub. This route is kept only so
// old links/bookmarks still resolve somewhere real.
export default function DashboardWriterRedirect() {
  redirect("/hub/writer");
}
