import { redirect } from "next/navigation";

export default function GamesBattleFallbackPage() {
  redirect("/games");
}
