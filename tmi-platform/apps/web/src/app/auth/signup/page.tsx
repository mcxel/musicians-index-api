import { redirect } from "next/navigation";

export default function AuthSignupFallbackPage() {
  redirect("/signup");
}
