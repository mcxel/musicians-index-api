import { redirect } from "next/navigation";

export default function LegacyCurrentIssueRedirectPage() {
  redirect("/magazine/issue/current");
}
