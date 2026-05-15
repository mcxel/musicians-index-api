"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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


export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") || "/rooms/world-dance-party";
  const nextRoute = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/rooms/world-dance-party";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [originalityAccepted, setOriginalityAccepted] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [session, setSession] = useState<SessionPayload>({
    authenticated: false,
    csrfToken: null,
    user: null,
    expires: null,
  });
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const loadSession = async (): Promise<SessionPayload> => {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    const parsed = toSessionPayload(data);
    setSession(parsed);
    return parsed;
  };
  // Load session once on mount — redirect if already authenticated
  useEffect(() => {
    let active = true;
    loadSession().then((s) => {
      if (active && s.authenticated) router.replace(nextRoute);
    });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waitForCsrfCookie = async (): Promise<boolean> => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (document.cookie.includes("phase11_csrf=")) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  };

  const loadFreshCsrf = async (): Promise<string | null> => {
    const current = await loadSession();
    if (!current.csrfToken) {
      return null;
    }
    await waitForCsrfCookie();
    return current.csrfToken;
  };

  const buildAuthHeaders = (csrfToken: string | null): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    return headers;
  };

  const postWithCsrfRetry = async (url: string, body: string) => {
    let csrf = await loadFreshCsrf();
    let res = await fetch(url, {
      method: "POST",
      headers: buildAuthHeaders(csrf),
      body,
    });

    if (res.status !== 403) {
      return res;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    csrf = await loadFreshCsrf();
    res = await fetch(url, {
      method: "POST",
      headers: buildAuthHeaders(csrf),
      body,
    });
    return res;
  };

  const waitForAuthenticatedSession = async (): Promise<boolean> => {
    // Give the browser a brief window to persist Set-Cookie from the login response.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const current = await loadSession();
      if (current.authenticated) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return false;
  };

  const register = async () => {
    setBusy(true);
    setMessage("");
    try {
      // Always refresh session/CSRF before register
      await loadSession();
      // Calculate age and minor status
      let minor = false;
      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }
        minor = age < 18;
      }
      setIsMinor(minor);
      const payload: Record<string, unknown> = {
        email,
        password,
        dateOfBirth,
        termsAccepted,
        originalityAccepted,
      };
      if (minor && parentEmail) {
        payload.parentEmail = parentEmail;
      }

      const res = await postWithCsrfRetry("/api/auth/register", JSON.stringify(payload));

      if (res.status === 201 || res.status === 200) {
        // Auto-provision the new account (wallet, avatar, onboarding bots, role workspace)
        const regData = await res.json().catch(() => ({}) as Record<string, unknown>);
        const userId: string | undefined = typeof regData?.userId === "string" ? regData.userId : undefined;
        if (userId) {
          await fetch("/api/auth/provision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, accountType: "MEMBER" }),
          }).catch(() => {});
        }
        setMessage("Registration succeeded. You can now sign in.");
      } else if (res.status === 409) {
        setMessage("User already exists.");
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(`Register failed (${res.status})${err?.message ? ": " + err.message : ""}`);
      }
    } finally {
      await loadSession();
      setBusy(false);
    }
  };

  const login = async () => {
    setBusy(true);
    setMessage("");
    try {
      // Always refresh session/CSRF before login
      await loadSession();

      const res = await postWithCsrfRetry("/api/auth/signin", JSON.stringify({ email, password }));

      if (res.status === 200) {
        const authenticated = await waitForAuthenticatedSession();
        if (authenticated) {
          setMessage(`Login succeeded. Redirecting to ${nextRoute}.`);
          router.replace(nextRoute);
        } else {
          setMessage("Login completed but session was not restored. Please retry.");
        }
      } else if (res.status === 401) {
        setMessage("Invalid credentials.");
      } else if (res.status === 403) {
        setMessage("Missing or invalid CSRF token.");
      } else {
        setMessage(`Login failed (${res.status}).`);
      }
    } finally {
      await loadSession();
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await postWithCsrfRetry("/api/auth/logout", "{}");
      setMessage(res.status === 200 ? "Logged out." : `Logout failed (${res.status}).`);
      if (res.status === 200) {
        router.replace("/auth");
      }
    } finally {
      await loadSession();
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Account Access</h1>
        <p className="text-white/70">This screen uses backend credentials auth via `/api/auth/*`.</p>
        <p className="text-xs text-white/50">GitHub OAuth is not active on this route in the current runtime path.</p>

        <form
          className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void login();
          }}
        >
          <label htmlFor="auth-email" className="block text-sm">Email</label>
          <input
            id="auth-email"
            className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
          <label htmlFor="auth-password" className="block text-sm">Password</label>
          <input
            id="auth-password"
            className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter password"
            minLength={8}
            required
          />
          <label htmlFor="auth-dob" className="block text-sm">Date of Birth</label>
          <input
            id="auth-dob"
            className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            type="date"
            required
          />
          {/* Show parent email if under 18 */}
          {(() => {
            let minor = false;
            if (dateOfBirth) {
              const dob = new Date(dateOfBirth);
              const now = new Date();
              let age = now.getFullYear() - dob.getFullYear();
              const m = now.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                age--;
              }
              minor = age < 18;
            }
            if (minor) {
              return (
                <>
                  <label htmlFor="auth-parent-email" className="block text-sm">Parent/Guardian Email (required if under 18)</label>
                  <input
                    id="auth-parent-email"
                    className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    type="email"
                    required={minor}
                  />
                </>
              );
            }
            return null;
          })()}
          <div className="flex items-center gap-2">
            <input
              id="auth-terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="auth-terms" className="text-sm">I agree to the <a href="/terms" className="underline">Terms of Service</a></label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="auth-originality"
              type="checkbox"
              checked={originalityAccepted}
              onChange={(e) => setOriginalityAccepted(e.target.checked)}
            />
            <label htmlFor="auth-originality" className="text-sm">I agree to the <a href="/originality-policy" className="underline">Originality Policy</a></label>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md bg-blue-600 disabled:opacity-50" type="submit" disabled={busy}>
              Sign in (Credentials)
            </button>
            <button className="px-4 py-2 rounded-md bg-emerald-600 disabled:opacity-50" type="button" onClick={() => void register()} disabled={busy}>
              Register
            </button>
            <button className="px-4 py-2 rounded-md bg-zinc-700 disabled:opacity-50" type="button" onClick={() => void logout()} disabled={busy}>
              Sign out
            </button>
          </div>
        </form>

        {/* Legal text block */}
        <div className="mt-6 p-4 bg-white/10 border border-white/20 rounded-xl text-sm">
          <strong>AGE & CONTENT AGREEMENT</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You are at least 16 years old.</li>
            <li>If you are under 18, you have permission from a parent or guardian.</li>
            <li>All content you upload is your original work or you have rights to use it.</li>
            <li>You agree to the <a href="/terms" className="underline">Terms of Service</a>, <a href="/privacy" className="underline">Privacy Policy</a>, and <a href="/guidelines" className="underline">Community Guidelines</a>.</li>
          </ul>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p>Status: {session.authenticated ? "authenticated" : "unauthenticated"}</p>
          <p>User: {session.user ? `${session.user.email} (${session.user.id})` : "none"}</p>
          <p>Expires: {session.expires || "none"}</p>
          <p>CSRF: {session.csrfToken ? "present" : "missing"}</p>
        </div>

        {message ? <p className="text-sm text-amber-300">{message}</p> : null}
      </div>
    </main>
  );
}
