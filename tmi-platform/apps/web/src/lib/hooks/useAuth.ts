"use client";

/**
 * useAuth — global session hook.
 * Fetches /api/auth/session once on mount, caches result in module-level
 * variable so subsequent mounts within the same browser session don't
 * re-fetch unnecessarily.
 *
 * Returns:
 *   user       — { id, email, name, role, tier } | null
 *   role       — uppercase string | null
 *   tier       — uppercase string | null
 *   isLoading  — true until first fetch completes
 *   isAuthenticated — true when cookies valid
 *   refresh()  — force re-fetch (call after login/logout)
 */

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  onboardingState?: string;
}

export interface AuthState {
  user: AuthUser | null;
  role: string | null;
  tier: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => void;
}

// Module-level cache so multiple components share one fetch
let cachedState: { user: AuthUser | null; role: string | null; tier: string | null; authenticated: boolean } | null = null;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

async function fetchSession(): Promise<void> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
    const data = await res.json() as {
      authenticated: boolean;
      user?: AuthUser;
      role?: string;
      tier?: string;
    };
    cachedState = {
      user: data.authenticated && data.user ? data.user : null,
      role: data.role ?? null,
      tier: data.tier ?? null,
      authenticated: data.authenticated === true,
    };
  } catch {
    cachedState = { user: null, role: null, tier: null, authenticated: false };
  } finally {
    fetchPromise = null;
    notify();
  }
}

function triggerFetch(): void {
  if (!fetchPromise) {
    fetchPromise = fetchSession();
  }
}

export function useAuth(): AuthState {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const rerender = () => forceRender((n) => n + 1);
    listeners.add(rerender);
    // Kick off fetch if cache is empty
    if (cachedState === null) triggerFetch();
    return () => { listeners.delete(rerender); };
  }, []);

  const refresh = useCallback(() => {
    cachedState = null;
    triggerFetch();
  }, []);

  if (cachedState === null) {
    return { user: null, role: null, tier: null, isLoading: true, isAuthenticated: false, refresh };
  }

  return {
    user: cachedState.user,
    role: cachedState.role,
    tier: cachedState.tier,
    isLoading: false,
    isAuthenticated: cachedState.authenticated,
    refresh,
  };
}

/** Imperative helper for non-hook contexts (server actions, form handlers) */
export async function getAuthState(): Promise<{ authenticated: boolean; user: AuthUser | null; role: string | null; tier: string | null }> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
    const data = await res.json() as { authenticated: boolean; user?: AuthUser; role?: string; tier?: string };
    return { authenticated: data.authenticated === true, user: data.user ?? null, role: data.role ?? null, tier: data.tier ?? null };
  } catch {
    return { authenticated: false, user: null, role: null, tier: null };
  }
}

/**
 * Three real states, not two. Any consumer that gates a login prompt on
 * auth state (Canister/Inventory Vault, role-gated panels, etc.) must derive
 * it through here — never from "not yet authenticated" alone, which is
 * indistinguishable from "still loading" and is exactly the mobile-Safari
 * false-login-flash bug this exists to prevent. Authentication and role are
 * deliberately separate inputs: a role check (e.g. "is this a Fan") must
 * never substitute for "does an authenticated session exist."
 */
export type AuthPhase = "AUTH_LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED";

export function resolveAuthPhase(isLoading: boolean, isAuthenticated: boolean): AuthPhase {
  if (isLoading) return "AUTH_LOADING";
  return isAuthenticated ? "AUTHENTICATED" : "UNAUTHENTICATED";
}

// ── Test-only accessors ──────────────────────────────────────────────────
// Exercise the real module-level cache/fetch mechanics (the actual thing
// that makes every useAuth() consumer on a page share one session — the
// "shell and Canister share identity" guarantee) without requiring a React
// render harness, matching this repo's plain-function test convention.
export function __resetAuthCacheForTest(): void {
  cachedState = null;
  fetchPromise = null;
}
export function __triggerFetchForTest(): Promise<void> {
  triggerFetch();
  return fetchPromise ?? Promise.resolve();
}
export function __peekAuthCacheForTest() {
  return cachedState;
}
