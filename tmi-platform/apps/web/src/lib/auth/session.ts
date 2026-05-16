// lib/auth/session.ts — Session management helpers for TMI platform
import type { TMIRole } from "./roles";

export type { TMIRole };

export type TMISession = {
  userId: string;
  name: string;
  email: string;
  role: TMIRole;
  avatarUrl?: string;
  walletBalance?: number;
  xp?: number;
  subscriptionTier?: "FREE" | "PRO" | "VIP";
  isVerified?: boolean;
  token: string;
  expiresAt: number;
};

export function setSession(token: string, role: TMIRole): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `phase11_session=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `phase11_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  // Backward compatibility cookies for existing clients/middleware.
  document.cookie = `tmi_session=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `tmi_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = "phase11_session=; path=/; max-age=0";
  document.cookie = "phase11_role=; path=/; max-age=0";
  document.cookie = "tmi_session=; path=/; max-age=0";
  document.cookie = "tmi_role=; path=/; max-age=0";
}

export function getSessionToken(): string | null {
  if (typeof document === "undefined") return null;
  const phase11Match = document.cookie.match(/(?:^|; )phase11_session=([^;]*)/);
  if (phase11Match) return decodeURIComponent(phase11Match[1]);
  const legacyMatch = document.cookie.match(/(?:^|; )tmi_session=([^;]*)/);
  return legacyMatch ? decodeURIComponent(legacyMatch[1]) : null;
}

export function getRoleCookie(): TMIRole | null {
  if (typeof document === "undefined") return null;
  const phase11Match = document.cookie.match(/(?:^|; )phase11_role=([^;]*)/);
  if (phase11Match) return decodeURIComponent(phase11Match[1]) as TMIRole;
  const legacyMatch = document.cookie.match(/(?:^|; )tmi_role=([^;]*)/);
  return legacyMatch ? (decodeURIComponent(legacyMatch[1]) as TMIRole) : null;
}

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

export function hasRole(...roles: TMIRole[]): boolean {
  const r = getRoleCookie();
  return r ? roles.includes(r) : false;
}
