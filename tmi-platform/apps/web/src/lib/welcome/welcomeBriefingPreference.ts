/**
 * Device-local welcome preference.
 * No server settings row exists for this briefing, and no schema change is authorized.
 * Visit dismissal lives in sessionStorage. Explicit opt-out lives in localStorage.
 * A version change does not clear an explicit opt-out.
 */

export const FAN_WELCOME_VERSION = "fan-welcome-v1";
export const PERFORMER_WELCOME_VERSION = "performer-welcome-v1";

export type WelcomeRole = "fan" | "performer";

export function welcomeVersionForRole(role: WelcomeRole): string {
  return role === "performer" ? PERFORMER_WELCOME_VERSION : FAN_WELCOME_VERSION;
}

type Store = Pick<Storage, "getItem" | "setItem">;

function localStore(): Store | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function sessionStore(): Store | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function optOutKey(role: WelcomeRole): string {
  return `tmi.welcome.autoShow.${welcomeVersionForRole(role)}`;
}

function visitKey(role: WelcomeRole): string {
  return `tmi.welcome.visitDismissed.${role}`;
}

/** Absent or "1" means the automatic briefing may appear. "0" is explicit opt-out. */
export function welcomeAutoShowEnabled(role: WelcomeRole, store: Store | null = localStore()): boolean {
  if (!store) return false;
  return store.getItem(optOutKey(role)) !== "0";
}

export function setWelcomeAutoShow(role: WelcomeRole, enabled: boolean, store: Store | null = localStore()): void {
  store?.setItem(optOutKey(role), enabled ? "1" : "0");
}

export function welcomeDismissedThisVisit(role: WelcomeRole, store: Store | null = sessionStore()): boolean {
  if (!store) return false;
  return store.getItem(visitKey(role)) === "1";
}

export function dismissWelcomeForVisit(role: WelcomeRole, store: Store | null = sessionStore()): void {
  store?.setItem(visitKey(role), "1");
}

export function openWelcomeCommand(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tmi:open-welcome"));
}
