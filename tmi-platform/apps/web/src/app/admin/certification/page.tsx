import { redirect } from "next/navigation";

/** Dead route closure — certification lives at runtime-check. */
export default function AdminCertificationRedirect() {
  redirect("/admin/runtime-check");
}
