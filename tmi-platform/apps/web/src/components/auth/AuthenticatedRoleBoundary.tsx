"use client";

/**
 * AuthenticatedRoleBoundary — auto / dashboard gateway only.
 * Never statically imports FanShell + PerformerShell (dual-graph hang).
 * Canonical HQ is /hub/fan and /hub/performer — this boundary redirects there.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import SessionRoleGate, {
  type SessionRoleReady,
} from "@/components/auth/SessionRoleGate";
import { hubPathForIdentity } from "@/lib/auth/sessionRole";

export type AuthenticatedRoleBoundaryMode =
  | "auto"
  | "fan-only"
  | "performer-only";

interface AuthenticatedRoleBoundaryProps {
  mode?: AuthenticatedRoleBoundaryMode;
  userId?: string;
  displayName?: string;
  children?: ReactNode;
}

function RedirectToRoleHub({ session }: { session: SessionRoleReady }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(hubPathForIdentity(session.identity, session.rawRole));
  }, [router, session.identity, session.rawRole]);
  return (
    <main
      data-role-boundary="REDIRECTING_HUB"
      style={{
        minHeight: "100vh",
        background: "#050510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        letterSpacing: "0.14em",
      }}
    >
      REDIRECTING…
    </main>
  );
}

export default function AuthenticatedRoleBoundary({
  mode = "auto",
  userId,
  displayName,
  children,
}: AuthenticatedRoleBoundaryProps) {
  return (
    <SessionRoleGate mode={mode} userId={userId} displayName={displayName}>
      {(session) => {
        if (children) return <>{children}</>;
        return <RedirectToRoleHub session={session} />;
      }}
    </SessionRoleGate>
  );
}
