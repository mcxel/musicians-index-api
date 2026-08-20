import { redirect } from "next/navigation";

export default function LegacyMagazineIssuePage() {
  redirect("/magazine/issue/current");
}
