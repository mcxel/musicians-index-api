import { redirect } from "next/navigation";

/** Canonical writer draft entry — real article submit path (Rule 20). */
export default function EditorialWritePage() {
  redirect("/writers/submit");
}
