import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | TMI",
  description: "Redirects to the canonical Overseer command deck.",
};

export default function AdminObservatoryPage() {
  redirect("/admin/overseer");
}
