import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | TMI",
  description: "Redirects to the canonical Overseer command deck.",
};

export default function AdminRootPage() {
  redirect("/admin/overseer");
}
