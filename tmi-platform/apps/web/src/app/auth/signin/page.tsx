import { redirect } from "next/navigation";

export default function AuthSigninFallbackPage({ searchParams }: { searchParams?: { next?: string } }) {
  const nextParam = searchParams?.next ?? "";
  if (nextParam && nextParam.startsWith("/")) {
    redirect(`/auth?next=${encodeURIComponent(nextParam)}`);
  }
  redirect("/auth");
}
