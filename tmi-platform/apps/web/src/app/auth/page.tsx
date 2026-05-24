"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type SessionPayload = {
  authenticated: boolean;
  csrfToken: string | null;
  user: { id: string; email: string } | null;
  expires: string | null;
};

function toSessionPayload(data: unknown): SessionPayload {
  const d = data as {
    authenticated?: boolean;
    csrfToken?: string;
    user?: { id?: string; email?: string } | null;
    expires?: string | null;
  };
  return {
    authenticated: Boolean(d?.authenticated),
    csrfToken: d?.csrfToken || null,
    user: d?.user?.id && d?.user?.email ? { id: d.user.id, email: d.user.email } : null,
    expires: d?.expires || null,
  };
}

function roleToHub(role?: string): string {
  const r = (role ?? "").toLowerCase();
  if (r === "admin" || r === "staff") return "/admin";
  if (r === "artist")     return "/dashboard/artist";
  if (r === "performer")  return "/dashboard/performer";
  if (r === "sponsor")    return "/dashboard/sponsor";
  if (r === "advertiser") return "/dashboard/advertiser";
  if (r === "venue")      return "/dashboard/venue";
  if (r === "writer")     return "/dashboard/writer";
  if (r === "promoter")   return "/dashboard/promoter";
  if (r === "fan")        return "/dashboard/fan";
  return "/onboarding";
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") || "";
  const nextRoute = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [session, setSession] = useState<SessionPayload>({
    authenticated: false, csrfToken: null, user: null, expires: null,
  });

  const loadSession = async (): Promise<SessionPayload> => {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    const parsed = toSessionPayload(data);
    setSession(parsed);
    return parsed;
  };

  useEffect(() => {
    // Persist invite code from URL to localStorage so returning users keep it
    const codeFromUrl = searchParams?.get("code") ?? "";
    if (codeFromUrl) {
      localStorage.setItem("tmi_invite_code", codeFromUrl);
      setInviteCode(codeFromUrl);
    } else {
      const saved = localStorage.getItem("tmi_invite_code") ?? "";
      if (saved) setInviteCode(saved);
    }

    let active = true;
    loadSession().then((s) => {
      if (active && s.authenticated) {
        const role = (s as unknown as { role?: string }).role ?? "";
        router.replace(nextRoute || roleToHub(role));
      }
    });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waitForAuthenticatedSession = async (): Promise<boolean> => {
    for (let i = 0; i < 5; i++) {
      const s = await loadSession();
      if (s.authenticated) return true;
      await new Promise(r => setTimeout(r, 150));
    }
    return false;
  };

  const login = async () => {
    setBusy(true);
    setMessage("");
    try {
      const csrfRes = await loadSession();
      const csrf = csrfRes.csrfToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrf) headers["X-CSRF-Token"] = csrf;

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: "include",
      });

      if (res.status === 200) {
        const data = await res.json().catch(() => ({} as { role?: string }));
        const authenticated = await waitForAuthenticatedSession();
        if (authenticated) {
          const dest = nextRoute || roleToHub(data.role);
          router.replace(dest);
        } else {
          setMessage("Login completed but session was not confirmed. Please try again.");
        }
      } else if (res.status === 401) {
        setMessage("Incorrect email or password.");
      } else if (res.status === 403) {
        setMessage("Security token mismatch — please refresh and try again.");
      } else {
        setMessage(`Sign in failed (${res.status}).`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>THE MUSICIANS INDEX</div>
          {inviteCode ? (
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>YOU&apos;RE INVITED</div>
          ) : (
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>SIGN IN</div>
          )}
        </div>

        {/* Invite mode — show create account CTA first */}
        {inviteCode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "rgba(255,213,0,0.06)", border: "1px solid rgba(255,213,0,0.3)", borderRadius: 14, padding: "20px 22px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💎</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", marginBottom: 6 }}>VIP ACCESS GRANTED</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 18 }}>
              Create your account to activate your invite and enter the platform.
            </div>
            <motion.a
              href={`/signup?token=${inviteCode}`}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ display: "block", padding: "14px", fontSize: 12, fontWeight: 900, letterSpacing: "0.15em", background: "linear-gradient(135deg,#FFD700,#FF9500)", color: "#050510", borderRadius: 9, textDecoration: "none", marginBottom: 10 }}
            >
              CREATE MY ACCOUNT →
            </motion.a>
            <button
              onClick={() => setInviteCode("")}
              style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}
            >
              Already have an account? Sign in below
            </button>
          </motion.div>
        )}

        {/* Sign-in form — always visible, de-emphasised in invite mode */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", opacity: inviteCode ? 0.7 : 1 }}
        >
          {inviteCode && (
            <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 14, textAlign: "center" }}>
              SIGN IN (RETURNING USERS)
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); void login(); }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 6, fontWeight: 700 }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{ width: "100%", padding: "11px 13px", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <label style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", fontWeight: 700 }}>PASSWORD</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 9, color: "rgba(0,255,255,0.6)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                style={{ width: "100%", padding: "11px 13px", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {message && (
              <div style={{ fontSize: 11, color: message.toLowerCase().includes("success") || message.toLowerCase().includes("redirect") ? "#00FF88" : "#FF6B6B", padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 7 }}>
                {message}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={busy}
              style={{
                width: "100%", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
                background: busy ? "rgba(0,255,255,0.15)" : "linear-gradient(135deg,#00FFFF,#00FFFF99)",
                color: "#050510", border: "none", borderRadius: 8, cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "SIGNING IN..." : "SIGN IN →"}
            </motion.button>
          </form>
        </motion.div>

        {/* Create account CTA (shown only in non-invite mode) */}
        {!inviteCode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ marginTop: 20, textAlign: "center" }}
          >
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Don&apos;t have an account?</div>
            <Link href="/signup" style={{ display: "block", padding: "12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.7)", textDecoration: "none", background: "rgba(255,255,255,0.03)" }}>
              CREATE YOUR TMI ACCOUNT →
            </Link>
          </motion.div>
        )}

        {/* Debug session strip (dev only) */}
        {process.env.NODE_ENV !== "production" && (
          <div style={{ marginTop: 24, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
            Session: {session.authenticated ? `authenticated · ${session.user?.email}` : "unauthenticated"} · CSRF: {session.csrfToken ? "present" : "missing"}
            {inviteCode && ` · Invite: ${inviteCode}`}
          </div>
        )}
      </motion.div>
    </main>
  );
}
