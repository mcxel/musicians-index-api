import { redirect } from "next/navigation";

export default function ReleasesFallbackPage() {
  redirect("/news");
}
