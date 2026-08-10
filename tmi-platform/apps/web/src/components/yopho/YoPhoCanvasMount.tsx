"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import YoPhoStudio, { type YoPhoStudioRole } from "@/components/yopho/YoPhoStudio";
import {
  useYoPhoCanvasGate,
  type YoPhoCanvasSessionUser,
} from "@/lib/yopho/useYoPhoCanvasGate";
import {
  yoPhoCanvasPathForRole,
  type YoPhoCanvasRoute,
} from "@/lib/yopho/yophoCanvasAccess";

const BG = "#050510";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

function StudioChrome({
  role,
  user,
  children,
}: {
  role: YoPhoStudioRole;
  user: YoPhoCanvasSessionUser;
  children: ReactNode;
}) {
  const hubHref = role === "fan" ? "/hub/fan" : "/hub/performer";
  const displayName = user.name ?? user.email.split("@")[0] ?? "Member";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff" }}>
      <header
        style={{
          borderBottom: "1px solid rgba(0,255,255,0.22)",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                color: CYAN,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              YoPho Studio
            </div>
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 900 }}>
              {role === "fan" ? "Fan Portrait Engine" : "Performer Living Canvas"}
            </div>
            <div style={{ marginTop: 2, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              {displayName}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={hubHref}
              style={{
                fontSize: 9,
                color: CYAN,
                textDecoration: "none",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid rgba(0,255,255,0.28)",
                borderRadius: 6,
                padding: "6px 10px",
              }}
            >
              Command Center
            </Link>
            <Link
              href={role === "fan" ? "/fan/canvas" : "/performer/canvas"}
              style={{
                fontSize: 9,
                color: role === "fan" ? FUCHSIA : GOLD,
                textDecoration: "none",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: `1px solid ${role === "fan" ? FUCHSIA : GOLD}44`,
                borderRadius: 6,
                padding: "6px 10px",
              }}
            >
              Full studio
            </Link>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ color: CYAN, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>
        LOADING YOPHO STUDIO…
      </div>
    </div>
  );
}

function RoleMismatchPanel({
  route,
  role,
  effectiveRole,
}: {
  route: YoPhoCanvasRoute;
  role: YoPhoStudioRole;
  effectiveRole: string;
}) {
  const correctPath = yoPhoCanvasPathForRole(effectiveRole);
  const expectedLabel = role === "fan" ? "Fan YoPho Studio" : "Performer YoPho Studio";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          border: "1px solid rgba(255,45,170,0.35)",
          borderRadius: 12,
          padding: 24,
          background: "rgba(255,45,170,0.06)",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: FUCHSIA }}>
          ROLE GATE
        </div>
        <div style={{ marginTop: 10, fontSize: 16, fontWeight: 800 }}>
          This URL is for {expectedLabel} only
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          Your active role ({effectiveRole}) does not match this canvas route. Open your correct studio
          or return to your hub — this page will not show another role&apos;s rollout shell.
        </p>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {correctPath !== route ? (
            <Link
              href={correctPath}
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(0,255,255,0.12)",
                border: "1px solid rgba(0,255,255,0.35)",
                color: CYAN,
                fontWeight: 800,
                fontSize: 11,
                textDecoration: "none",
              }}
            >
              Open my YoPho studio →
            </Link>
          ) : null}
          <Link
            href={role === "fan" ? "/hub/fan" : "/hub/performer"}
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 700,
              fontSize: 11,
              textDecoration: "none",
            }}
          >
            Back to Command Center
          </Link>
          <Link
            href="/auth"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            Sign in with a different account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function YoPhoCanvasMount({
  route,
  role,
}: {
  route: YoPhoCanvasRoute;
  role: YoPhoStudioRole;
}) {
  const gate = useYoPhoCanvasGate(route);

  if (gate.loading) {
    return <LoadingShell />;
  }

  if (gate.accessDenied) {
    return (
      <RoleMismatchPanel route={route} role={role} effectiveRole={gate.effectiveRole ?? "UNKNOWN"} />
    );
  }

  if (!gate.user) {
    return <LoadingShell />;
  }

  const displayName = gate.user.name ?? gate.user.email.split("@")[0] ?? "Member";

  return (
    <StudioChrome role={role} user={gate.user}>
      <YoPhoStudio
        role={role}
        userId={gate.user.id}
        displayName={displayName}
        tier={gate.user.tier}
        profileImageUrl={gate.user.image}
      />
    </StudioChrome>
  );
}
