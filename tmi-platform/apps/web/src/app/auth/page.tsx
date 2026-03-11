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
  const nextParam = searchParams.get("next") || "/dashboard";
  const nextRoute = nextParam.startsWith("/") ? nextParam : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<SessionPayload>({
    authenticated: false,
    csrfToken: null,
    user: null,
    expires: null,
  });
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const loadSession = async (): Promise<SessionPayload> => {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await res.json();
    const parsed = toSessionPayload(data);
    setSession(parsed);
    return parsed;
  };

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

  useEffect(() => {
    let active = true;
    const init = async () => {
      const s = await loadSession();
      if (active && s.authenticated) {
        router.replace(nextRoute);
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, [nextRoute, router]);

  const register = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await postWithCsrfRetry("/api/auth/register", JSON.stringify({ email, password }));

      if (res.status === 201) {
        setMessage("Registration succeeded.");
      } else if (res.status === 409) {
        setMessage("User already exists.");
      } else {
        setMessage(`Register failed (${res.status}).`);
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
      const res = await postWithCsrfRetry("/api/auth/login", JSON.stringify({ email, password }));

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
        <p className="text-white/70">Frontend auth now uses backend `/api/auth/*` as source of truth.</p>

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
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md bg-blue-600 disabled:opacity-50" type="submit" disabled={busy}>
              Login
            </button>
            <button className="px-4 py-2 rounded-md bg-emerald-600 disabled:opacity-50" type="button" onClick={() => void register()} disabled={busy}>
              Register
            </button>
            <button className="px-4 py-2 rounded-md bg-zinc-700 disabled:opacity-50" type="button" onClick={() => void logout()} disabled={busy}>
              Logout
            </button>
          </div>
        </form>

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
