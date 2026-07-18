"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type SessionPayload = {
  authenticated: boolean;
  csrfToken: string | null;
  user: { id: string; email: string } | null;
  role: string | null;
  expires: string | null;
};

function toSessionPayload(data: unknown): SessionPayload {
  const d = data as {
    authenticated?: boolean;
    csrfToken?: string;
    user?: { id?: string; email?: string } | null;
    role?: string;
    expires?: string | null;
  };
  return {
    authenticated: Boolean(d?.authenticated),
    csrfToken: d?.csrfToken || null,
    user: d?.user?.id && d?.user?.email ? { id: d.user.id, email: d.user.email } : null,
    role: d?.role || null,
    expires: d?.expires || null,
  };
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [session, setSession] = useState<SessionPayload>({
    authenticated: false, csrfToken: null, user: null, role: null, expires: null,
  });

  const loadSession = async (): Promise<SessionPayload> => {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    const parsed = toSessionPayload(data);
    setSession(parsed);
    return parsed;
  };

  useEffect(() => {
    const authError = (searchParams?.get("error") ?? "").toLowerCase();
    if (authError === "oauth_not_configured") {
      setMessage("Google sign-in is temporarily unavailable. Please use email + password for now.");
    } else if (authError.startsWith("oauth_")) {
      setMessage("Google sign-in could not be completed. Please try again or use email + password.");
    }

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
        router.replace("/onboarding");
      }
    });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async () => {
    setBusy(true);
    setMessage("");
    try {
      const csrfRes = await loadSession();
      const csrf = csrfRes.csrfToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrf) headers["X-CSRF-Token"] = csrf;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: "include",
      });

      if (res.status === 200) {
        const data = await res.json().catch(() => ({} as { streak?: { current: number; longest: number; isNewDay: boolean; multiplier: number; xpGranted: number } }));
        if (data.streak) {
          try {
            localStorage.setItem('tmi_streak', JSON.stringify(data.streak));
            window.dispatchEvent(new CustomEvent('tmi:streak', { detail: data.streak }));
          } catch { /* localStorage unavailable */ }
        }
        window.location.replace("/onboarding");
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
              <label htmlFor="auth-email" style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 6, fontWeight: 700 }}>Email</label>
              <input
                id="auth-email"
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
                <label htmlFor="auth-password" style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", fontWeight: 700 }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 9, color: "rgba(0,255,255,0.6)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <input
                id="auth-password"
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
              <div style={{ fontSize: 11, color: "#FF6B6B", padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 7 }}>
                {message}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={busy}
              style={{
                width: "100%", padding: "13px", minHeight: "44px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
                background: busy ? "rgba(0,255,255,0.15)" : "linear-gradient(135deg,#00FFFF,#00FFFF99)",
                color: "#050510", border: "none", borderRadius: 8, cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "..." : "Login"}
            </motion.button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Google Sign-In */}
            <a href="/api/auth/google"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", padding: "12px", minHeight: "44px", fontSize: 11, fontWeight: 700,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, color: "#fff", textDecoration: "none", cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </form>
        </motion.div>

        {/* Create account CTA (shown only in non-invite mode) */}
        {!inviteCode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ marginTop: 20, textAlign: "center" }}
          >
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Don&apos;t have an account?</div>
            <Link href="/signup" style={{ display: "block", padding: "12px", minHeight: "44px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.7)", textDecoration: "none", background: "rgba(255,255,255,0.03)", lineHeight: "20px" }}>
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
