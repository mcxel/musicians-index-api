import { redirect } from "next/navigation";

export default function HomeRankingFallbackPage() {
  redirect("/home/5");
}
