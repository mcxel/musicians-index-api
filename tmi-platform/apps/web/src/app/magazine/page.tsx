import { redirect } from "next/navigation";

/** MAGAZINE nav opens the active issue spread reader, not the article-card feed. */
export default function MagazinePage() {
  redirect("/magazine/issue/current");
}
