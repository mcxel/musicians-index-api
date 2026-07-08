import { redirect } from "next/navigation";

export const metadata = {
  title: "Overview | TMI Admin",
  description: "Redirects to the canonical Overseer Deck shell.",
};

export default function AdminOverviewPage() {
  redirect("/admin/overseer");
}
