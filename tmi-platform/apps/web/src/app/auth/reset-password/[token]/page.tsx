import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import SafeNotFoundSurface from "@/components/routing/SafeNotFoundSurface";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";

type Props = {
  params: { token: string };
  searchParams?: { email?: string };
};

export default function ResetPasswordTokenPage({ params, searchParams }: Props) {
  const email = (searchParams?.email ?? "").trim().toLowerCase();
  registerRoute("/auth/reset-password/[token]", "open", {
    returnRoute: "/auth/forgot-password",
    fallbackRoute: "/auth/forgot-password",
    nextAction: "reset-password",
  });
  registerReturnPath({
    fromRoute: "/auth/reset-password/[token]",
    toRoute: "/auth/forgot-password",
    label: "Back to Forgot Password",
  });
  resolveSlug("event", params.token);
  SocketRecoveryEngine.register("guest-user", `sock_reset_${params.token.slice(0, 6)}`, "auth-reset");

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em" }}>Reset Password</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Use your single-use reset token to secure your account.
        </p>
        <ResetPasswordForm token={params.token} email={email} />
        <Link href="/auth/forgot-password" style={{ color: "#93c5fd", fontSize: 13 }}>
          Request a new reset link
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <SocketStatusBadge userId="guest-user" />
          <ReconnectButton userId="guest-user" />
          <ReturnPathButton />
        </div>
        <RouteRecoveryCard route="/auth/reset-password/[token]" />
        <SlugFallbackPanel entity="event" slug={params.token} />
        <SafeNotFoundSurface title="Reset Path Recovery" body="If token validation fails, use the safe return path to request a new link." homeHref="/auth/forgot-password" />
      </div>
    </main>
  );
}
