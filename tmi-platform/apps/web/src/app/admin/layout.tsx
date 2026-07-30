"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import AdminConciergePanel from "@/components/admin/AdminConciergePanel";

// Roles that may access /admin/* — checked against live session before any child renders.
// Matches the real Prisma Role enum (STAFF/ADMIN only — no OWNER/SUPERADMIN role exists).
const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

type AuthStatus = "checking" | "authorized" | "denied";

const ADMIN_SESSION_TIMEOUT_MS = 8000;

type OperatorPolicy = {
  key: "marcel" | "big-ace" | "justin" | "jay" | "admin";
  label: string;
  fullControl: boolean;
  canAutoApplyFixes: boolean;
};

function resolveOperatorPolicy(identity: string): OperatorPolicy {
  const v = identity.toLowerCase();
  if (v.includes("big ace") || v.includes("big-ace") || v.includes("bigace")) {
    return { key: "big-ace", label: "Big Ace", fullControl: true, canAutoApplyFixes: true };
  }
  if (v.includes("marcel")) {
    return { key: "marcel", label: "Marcel", fullControl: true, canAutoApplyFixes: true };
  }
  if (v.includes("justin")) {
    return { key: "justin", label: "Justin", fullControl: false, canAutoApplyFixes: false };
  }
  if (v.includes("jay") || v.includes("jaypaul")) {
    return { key: "jay", label: "Jay", fullControl: false, canAutoApplyFixes: false };
  }
  return { key: "admin", label: "Admin", fullControl: false, canAutoApplyFixes: false };
}

/** Flight Deck / Observatory own their chrome — no layout top bar. */
function isFlightDeckRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/admin/overseer" ||
    pathname.startsWith("/admin/overseer/") ||
    pathname === "/admin/observatory" ||
    pathname.startsWith("/admin/observatory/")
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [sessionRole, setSessionRole] = useState<string | undefined>();
  const [sessionUserId, setSessionUserId] = useState<string | undefined>();
  const [sessionName, setSessionName] = useState<string | undefined>();
  const [sessionEmail, setSessionEmail] = useState<string | undefined>();
  const [submittingFix, setSubmittingFix] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), ADMIN_SESSION_TIMEOUT_MS);

    fetch("/api/auth/session", { cache: "no-store", credentials: "include", signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const data = d as {
          authenticated?: boolean;
          role?: string;
          user?: { id?: string; role?: string; name?: string; email?: string } | null;
        };
        const authed = Boolean(data?.authenticated);
        const role = data?.role ?? data?.user?.role ?? "";
        const userId = data?.user?.id;
        const name = data?.user?.name ?? undefined;
        const email = data?.user?.email ?? undefined;
        setSessionRole(role || undefined);
        setSessionUserId(userId);
        setSessionName(name);
        setSessionEmail(email);
        setStatus(authed && ADMIN_ROLES.has(role) ? "authorized" : "denied");
      })
      .catch(() => {
        if (active) setStatus("denied");
      });

    return () => {
      active = false;
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07070f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              color: "#00FFFF",
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            ADMIN PANEL
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Verifying access…</div>
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  const operatorIdentity = `${sessionName ?? ""} ${sessionEmail ?? ""}`.trim();
  const operatorPolicy = resolveOperatorPolicy(operatorIdentity);
  const flightDeck = isFlightDeckRoute(pathname);

  async function submitFixIntake() {
    const issue = window.prompt("What should we fix right now?");
    if (!issue || !issue.trim()) return;

    setSubmittingFix(true);
    try {
      const response = await fetch("/api/admin/fix-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: issue.trim(),
          operator: operatorPolicy.label,
          autoApply: operatorPolicy.canAutoApplyFixes,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        ticketId?: string;
        error?: string;
      };
      if (!response.ok) {
        window.alert(payload.error ?? "Could not submit fix intake.");
        return;
      }
      window.alert(
        `${payload.status === "auto-fixed" ? "Auto-fixed" : "Queued"} as ${payload.ticketId ?? "ticket"}.`,
      );
    } catch {
      window.alert("Network error while sending fix intake.");
    } finally {
      setSubmittingFix(false);
    }
  }

  return (
    <>
      {/* Flight Deck / Observatory: no top horizontal switcher — Admin Concierge lives in the deck dock. */}
      {!flightDeck ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 60,
            background: "rgba(5,5,16,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#00FFFF",
                textTransform: "uppercase",
              }}
            >
              TMI Admin
            </div>
            <button
              type="button"
              onClick={() => setConciergeOpen(true)}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                border: "1.5px solid #D4AF37",
                background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)",
                color: "#ffe3a3",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Admin
            </button>
            <div
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: operatorPolicy.fullControl ? "#FFD700" : "rgba(255,255,255,0.5)",
                border: `1px solid ${
                  operatorPolicy.fullControl ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.12)"
                }`,
                borderRadius: 999,
                padding: "5px 8px",
              }}
            >
              {operatorPolicy.label}: {operatorPolicy.fullControl ? "Full Control" : "Limited Controls"}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <PersonaSwitcher currentRole={sessionRole} userId={sessionUserId} compact showAdd={false} />
            </div>
          </div>
        </div>
      ) : null}

      {children}

      <AdminConciergePanel
        open={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        includeWorkspaces={false}
        operatorLabel={operatorPolicy.label}
        fullControl={operatorPolicy.fullControl}
        canAutoApplyFixes={operatorPolicy.canAutoApplyFixes}
        onSuggestFix={submitFixIntake}
        submittingFix={submittingFix}
      />
      {/* Admin Cam is on-demand only — mounted by OverseerFlightDeck OverlayHost when Camera is pressed. Never permanent in admin layout. */}
    </>
  );
}
