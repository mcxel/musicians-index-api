import { redirect } from "next/navigation";

type AuthSignupFallbackPageProps = {
  searchParams?: {
    role?: string;
  };
};

const ROLE_REDIRECTS: Record<string, string> = {
  fan: "/signup/fan",
  artist: "/signup/performer",
  performer: "/signup/performer",
  sponsor: "/signup/sponsor",
  advertiser: "/signup/advertiser",
};

export default function AuthSignupFallbackPage({ searchParams }: AuthSignupFallbackPageProps) {
  const role = searchParams?.role?.toLowerCase();
  redirect(ROLE_REDIRECTS[role ?? ""] ?? "/signup");
}
