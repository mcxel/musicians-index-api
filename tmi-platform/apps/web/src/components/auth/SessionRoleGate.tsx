"use client";

/**
 * Lightweight session → shell-identity gate.
 * Must NOT import FanShell / PerformerShell (keeps hydration + role fetch fast).
 */

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  classifyShellIdentity,
  hubPathForIdentity,
  type ShellRoleIdentity,
} from "@/lib/auth/sessionRole";

export type SessionRoleGateMode = "auto" | "fan-only" | "performer-only";

export type SessionRoleReady = {
  identity: ShellRoleIdentity;
  rawRole: string;
  userId: string;
  displayName: string;
};

type Phase = "ROLE_RESOLVING" | "READY" | "UNAUTH" | "ROLE_ERROR";

interface SessionPayload {
  authenticated?: boolean;
  role?: string;
  user?: { id?: string; name?: string; role?: string; activeRole?: string | null };
}

function roleFromSession(d: SessionPayload): string {
  return (d.user?.activeRole ?? d.user?.role ?? d.role ?? "").toString().trim();
}

function RoleResolvingSkeleton({ label = "RESOLVING ROLE…" }: { label?: string }) {
  return (
    <main
      data-role-boundary="ROLE_RESOLVING"
      style={{
        minHeight: "100vh",
        background: "#050510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(0,255,255,0.25)",
          borderTopColor: "#00FFFF",
          animation: "tmiRoleSpin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.14em", margin: 0 }}>
        {label}
      </p>
      <style>{`@keyframes tmiRoleSpin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

function RoleErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main
      data-role-boundary="ROLE_ERROR"
      style={{
        minHeight: "100vh",
        background: "#050510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 14,
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ color: "rgba(255,80,80,0.9)", fontSize: 12, letterSpacing: "0.12em", margin: 0 }}>
        ROLE UNAVAILABLE
      </p>
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, maxWidth: 360, margin: 0, lineHeight: 1.45 }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: 8,
          background: "transparent",
          border: "1px solid rgba(0,255,255,0.45)",
          color: "#00FFFF",
          padding: "8px 16px",
          fontSize: 11,
          letterSpacing: "0.1em",
          cursor: "pointer",
        }}
      >
        RETRY
      </button>
    </main>
  );
}

interface SessionRoleGateProps {
  mode?: SessionRoleGateMode;
  userId?: string;
  displayName?: string;
  children: (session: SessionRoleReady) => ReactNode;
}

export default function SessionRoleGate({
  mode = "auto",
  userId: userIdProp,
  displayName: displayNameProp,
  children,
}: SessionRoleGateProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ROLE_RESOLVING");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [ready, setReady] = useState<SessionRoleReady | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase("ROLE_RESOLVING");
      setErrorMessage("");
      setReady(null);
      for (let attempt = 0; attempt < 12 && !cancelled; attempt++) {
        try {
          const r = await fetch("/api/auth/session", {
            credentials: "include",
            cache: "no-store",
          });
          const d = (await r.json()) as SessionPayload;
          if (cancelled) return;
          if (!d.authenticated || !d.user) {
            if (attempt >= 11) {
              setPhase("UNAUTH");
              return;
            }
          } else {
            const raw = roleFromSession(d);
            const classified = classifyShellIdentity(raw);
            if (!classified) {
              if (attempt >= 11) {
                setErrorMessage(
                  raw
                    ? `Session role "${raw}" is not a Fan or Performer shell role.`
                    : "Signed in, but no role was returned on the session.",
                );
                setPhase("ROLE_ERROR");
                return;
              }
            } else {
              setReady({
                identity: classified,
                rawRole: raw.toUpperCase(),
                userId: d.user.id ?? userIdProp ?? "",
                displayName:
                  displayNameProp?.trim() ||
                  d.user.name?.trim() ||
                  (classified === "PERFORMER" ? "Performer" : "Fan"),
              });
              setPhase("READY");
              return;
            }
          }
        } catch {
          /* retry */
        }
        await new Promise((res) => setTimeout(res, 250 + attempt * 100));
      }
      if (!cancelled) {
        setErrorMessage("Timed out waiting for session role. Check connection and retry.");
        setPhase("ROLE_ERROR");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userIdProp, displayNameProp, retryToken]);

  useEffect(() => {
    if (phase === "UNAUTH") {
      const next =
        mode === "performer-only"
          ? "/hub/performer"
          : mode === "fan-only"
            ? "/hub/fan"
            : "/dashboard";
      router.replace(`/auth?next=${encodeURIComponent(next)}`);
    }
  }, [phase, mode, router]);

  useEffect(() => {
    if (phase !== "READY" || !ready) return;
    const { identity, rawRole } = ready;
    if (mode === "fan-only" && identity !== "FAN") {
      router.replace(hubPathForIdentity(identity, rawRole));
      return;
    }
    if (mode === "performer-only" && identity !== "PERFORMER") {
      if (identity === "FAN") router.replace("/hub/fan");
      else router.replace(hubPathForIdentity(identity, rawRole));
      return;
    }
    if (mode === "auto" && identity === "OTHER") {
      router.replace(hubPathForIdentity("OTHER", rawRole));
    }
  }, [phase, ready, mode, router]);

  if (phase === "ROLE_ERROR") {
    return (
      <RoleErrorPanel
        message={errorMessage || "Unable to resolve account role."}
        onRetry={() => setRetryToken((n) => n + 1)}
      />
    );
  }

  if (phase === "ROLE_RESOLVING" || phase === "UNAUTH" || !ready) {
    return <RoleResolvingSkeleton />;
  }

  if (mode === "fan-only" && ready.identity !== "FAN") {
    return <RoleResolvingSkeleton label="REDIRECTING…" />;
  }
  if (mode === "performer-only" && ready.identity !== "PERFORMER") {
    return <RoleResolvingSkeleton label="REDIRECTING…" />;
  }
  if (mode === "auto" && ready.identity === "OTHER") {
    return <RoleResolvingSkeleton label="REDIRECTING…" />;
  }

  return <>{children(ready)}</>;
}
