import { redirect } from "next/navigation";

export default function AuthSigninFallbackPage() {
  redirect("/auth");
}
