/**
 * Auth critical-path detection.
 * These routes must not mount platform chrome (HUD, live, bots, dock, etc.).
 */
export function isAuthCriticalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return true;
  if (pathname === "/signup" || pathname.startsWith("/signup/")) return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/join" || pathname.startsWith("/join/")) return true;
  if (
    pathname === "/support/account-recovery" ||
    pathname.startsWith("/support/account-recovery/")
  ) {
    return true;
  }
  return false;
}
