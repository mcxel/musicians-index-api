"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";

// Roles that may access /admin/* — checked against live session before any child renders
const ADMIN_ROLES = new Set(["admin", "superadmin", "owner", "ADMIN"]);

type AuthStatus = "checking" | "authorized" | "denied";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [sessionRole, setSessionRole] = useState<string | undefined>();
  const [sessionUserId, setSessionUserId] = useState<string | undefined>();
  const [sessionName, setSessionName] = useState<string | undefined>();
  const [sessionEmail, setSessionEmail] = useState<string | undefined>();
  const [submittingFix, setSubmittingFix] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const data = d as { authenticated?: boolean; role?: string; user?: { id?: string; role?: string; name?: string; email?: string } | null };
        const authed = Boolean(data?.authenticated);
        const role   = data?.role ?? data?.user?.role ?? "";
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

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div style={{
        minHeight: "100vh", background: "#07070f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>
            ADMIN PANEL
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Verifying access…</div>
        </div>
      </div>
    );
  }

  // "denied" — null render; redirect fires in the effect above
  if (status === "denied") return null;

  const operatorIdentity = `${sessionName ?? ""} ${sessionEmail ?? ""}`.trim();
  const operatorPolicy = resolveOperatorPolicy(operatorIdentity);

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
      const payload = (await response.json().catch(() => ({}))) as { status?: string; ticketId?: string; error?: string };
      if (!response.ok) {
        window.alert(payload.error ?? "Could not submit fix intake.");
        return;
      }
      window.alert(`${payload.status === "auto-fixed" ? "Auto-fixed" : "Queued"} as ${payload.ticketId ?? "ticket"}.`);
    } catch {
      window.alert("Network error while sending fix intake.");
    } finally {
      setSubmittingFix(false);
    }
  }

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 60, background: 'rgba(5,5,16,0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.22em', color: '#00FFFF', textTransform: 'uppercase' }}>
            Admin Quick Switch
          </div>
          <Link href="/admin/overseer" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,215,0,0.35)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Overseer Deck
          </Link>
          <Link href="/admin/runtime-check" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,136,0.55)', background: 'rgba(0,255,136,0.12)', color: '#00FF88', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            ✅ Runtime Check
          </Link>
          <Link href="/admin/observatory" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,255,0.25)', background: 'rgba(0,255,255,0.06)', color: '#00FFFF', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Observatory
          </Link>
          <Link href="/dashboard/fan" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,136,0.25)', background: 'rgba(0,255,136,0.06)', color: '#00FF88', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Fan Page
          </Link>
          <Link href="/dashboard/performer" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,45,170,0.25)', background: 'rgba(255,45,170,0.06)', color: '#FF2DAA', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Performer Page
          </Link>
          <Link href="/admin/global-pulse" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(170,45,255,0.35)', background: 'rgba(170,45,255,0.08)', color: '#AA2DFF', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Global Pulse
          </Link>
          <Link href="/admin/venue-health" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.07)', color: '#00FF88', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Venue Health
          </Link>
          <Link href="/admin/world-memory" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.07)', color: '#FFD700', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            World Memory
          </Link>
          <Link href="/admin/humanity-benchmark" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(170,45,255,0.3)', background: 'rgba(170,45,255,0.07)', color: '#AA2DFF', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Humanity Test
          </Link>
          <Link href="/admin/social-graph" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,45,170,0.3)', background: 'rgba(255,45,170,0.07)', color: '#FF2DAA', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Social Graph
          </Link>
          <Link href="/admin/social-dynamics" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.07)', color: '#00FF88', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Dynamics Deck
          </Link>
          <Link href="/admin/mythology" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,215,0,0.35)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Mythology
          </Link>
          <Link href="/admin/world-premiere" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,45,170,0.35)', background: 'rgba(255,45,170,0.08)', color: '#FF2DAA', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            World Premiere
          </Link>
          <Link href="/admin/benchmark-history" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(0,255,136,0.35)', background: 'rgba(0,255,136,0.08)', color: '#00FF88', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Bench History
          </Link>
          <Link href="/account" style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textDecoration: 'none' }}>
            Account
          </Link>
          <button
            type="button"
            disabled={submittingFix}
            onClick={() => { void submitFixIntake(); }}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid ${operatorPolicy.canAutoApplyFixes ? 'rgba(255,215,0,0.45)' : 'rgba(0,255,255,0.25)'}`,
              background: operatorPolicy.canAutoApplyFixes ? 'rgba(255,215,0,0.10)' : 'rgba(0,255,255,0.06)',
              color: operatorPolicy.canAutoApplyFixes ? '#FFD700' : '#00FFFF',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.1em',
              cursor: submittingFix ? 'default' : 'pointer',
              opacity: submittingFix ? 0.6 : 1,
            }}
          >
            {submittingFix ? 'Submitting...' : (operatorPolicy.canAutoApplyFixes ? 'Auto Fix Intake' : 'Suggest Fix')}
          </button>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: operatorPolicy.fullControl ? '#FFD700' : 'rgba(255,255,255,0.5)', border: `1px solid ${operatorPolicy.fullControl ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 999, padding: '5px 8px' }}>
            {operatorPolicy.label}: {operatorPolicy.fullControl ? 'Full Control' : 'Limited Controls'}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <PersonaSwitcher currentRole={sessionRole} userId={sessionUserId} compact showAdd={false} />
          </div>
        </div>
      </div>
      {children}
      <TMIVideoMonitor label="ADMIN CAM" position="bottom-right" />
    </>
  );
}
