/**
 * canonicalEndpointResolver — ONE resolver for same-app vs external service URLs.
 *
 * Same-app Next APIs → relative `/api/...` (browser) or request-origin absolute (SSR).
 * Separate services → env only; NO silent localhost / :3002 fallback.
 *
 * Locked for Live Publication P0-1 (2026-08-31).
 */

export type EndpointKind = "same_origin_api" | "external_service";

export class CanonicalEndpointError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "CanonicalEndpointError";
    this.code = code;
  }
}

/** Normalize to a leading-/api path. Rejects absolute http(s) hosts. */
export function toSameOriginApiPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new CanonicalEndpointError("empty_api_path", "API path is required.");
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    throw new CanonicalEndpointError(
      "absolute_api_path_forbidden",
      `Same-origin APIs must be relative paths, got: ${trimmed.slice(0, 80)}`,
    );
  }
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!withSlash.startsWith("/api/") && withSlash !== "/api") {
    // Allow callers to pass "live/go" → "/api/live/go"
    return `/api${withSlash.startsWith("/") ? withSlash : `/${withSlash}`}`;
  }
  return withSlash;
}

/**
 * Browser / isomorphic: return a relative same-origin API path for fetch().
 * Never injects host or port.
 */
export function resolveSameOriginApi(path: string): string {
  return toSameOriginApiPath(path);
}

/**
 * SSR absolute URL for same-origin Next APIs (server components / route handlers).
 * Prefer request host headers; never falls back to localhost:3002.
 */
export function resolveSameOriginApiAbsolute(
  path: string,
  opts?: {
    host?: string | null;
    proto?: string | null;
    /** Explicit origin override (e.g. NEXTAUTH_URL) — must not be a dead localhost port. */
    origin?: string | null;
  },
): string {
  const apiPath = toSameOriginApiPath(path);
  const origin = resolveAppOrigin(opts);
  return `${origin}${apiPath}`;
}

/**
 * Resolve the running app origin. Fails closed if no host can be derived —
 * never invents localhost:3002 / :3001.
 */
export function resolveAppOrigin(opts?: {
  host?: string | null;
  proto?: string | null;
  origin?: string | null;
}): string {
  const explicit = (opts?.origin ?? "").trim().replace(/\/$/, "");
  if (explicit && !isDeadLocalhostFallback(explicit)) {
    return explicit;
  }

  const host = (opts?.host ?? "").trim();
  if (host) {
    const proto = (opts?.proto ?? "http").trim() || "http";
    return `${proto}://${host}`;
  }

  const fromEnv =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    "";
  if (fromEnv && !isDeadLocalhostFallback(fromEnv)) {
    return fromEnv.replace(/\/$/, "");
  }

  // Last resort for local Next default — only :3000 (the actual Next listen port),
  // never :3002 (Nest/legacy dead binding that caused ERR_CONNECTION_REFUSED).
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new CanonicalEndpointError(
    "app_origin_unresolved",
    "Cannot resolve app origin — set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL.",
  );
}

/** True when URL is the known-dead Nest/API ports that must never be silent fallbacks. */
export function isDeadLocalhostFallback(url: string): boolean {
  try {
    const u = new URL(url.includes("://") ? url : `http://${url}`);
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return false;
    const port = u.port || (u.protocol === "https:" ? "443" : "80");
    return port === "3001" || port === "3002" || port === "4000" || port === "8080";
  } catch {
    return /localhost:(3001|3002|4000|8080)|127\.0\.0\.1:(3001|3002|4000|8080)/i.test(url);
  }
}

/**
 * External / separate service base URL from env.
 * Missing or empty → throws (fail explicitly). No silent localhost fallback.
 */
export function resolveExternalServiceBase(
  envKey: string,
  opts?: { required?: boolean },
): string | null {
  const raw = (process.env[envKey] ?? "").trim().replace(/\/$/, "");
  if (!raw) {
    if (opts?.required === false) return null;
    throw new CanonicalEndpointError(
      "external_service_unconfigured",
      `${envKey} is not configured — refusing silent localhost fallback.`,
    );
  }
  if (isDeadLocalhostFallback(raw)) {
    throw new CanonicalEndpointError(
      "dead_localhost_binding",
      `${envKey} points at a dead localhost port (${raw}). Use a live service URL.`,
    );
  }
  return raw;
}

export function joinExternalServiceUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}
