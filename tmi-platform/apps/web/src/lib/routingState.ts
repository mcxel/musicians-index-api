export type RoutingRole = "fan" | "artist" | "admin" | null;
export type RoutingOnboardingState = "no_role_selected" | "incomplete" | "complete";

export type RoutingState = {
  role: RoutingRole;
  onboardingState: RoutingOnboardingState;
};

type SignedRoutingState = RoutingState & {
  iat: number;
  exp: number;
  v: 1;
};

export const ROUTING_STATE_COOKIE = "phase14_routing";

const ROUTING_STATE_MAX_AGE_SECONDS = 60 * 60 * 24;
const encoder = new TextEncoder();

type CookieWriter = {
  cookies: {
    set: (options: {
      name: string;
      value: string;
      path?: string;
      maxAge?: number;
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
    }) => unknown;
  };
};

function getRoutingSecret(): string {
  const secret = process.env.ROUTING_STATE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("ROUTING_STATE_SECRET or NEXTAUTH_SECRET is required");
  }
  return secret;
}

function isRoutingRole(value: unknown): value is RoutingRole {
  return value === "fan" || value === "artist" || value === "admin" || value === null;
}

function isRoutingOnboardingState(value: unknown): value is RoutingOnboardingState {
  return value === "no_role_selected" || value === "incomplete" || value === "complete";
}

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4 || 4)) % 4)}`;

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(padded, "base64"));
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function parseSignedState(value: unknown): RoutingState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as Partial<SignedRoutingState>;
  if (!isRoutingRole(maybe.role) || !isRoutingOnboardingState(maybe.onboardingState)) {
    return null;
  }

  if (typeof maybe.exp !== "number" || maybe.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    role: maybe.role,
    onboardingState: maybe.onboardingState,
  };
}

export async function signRoutingState(state: RoutingState): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SignedRoutingState = {
    ...state,
    iat: now,
    exp: now + ROUTING_STATE_MAX_AGE_SECONDS,
    v: 1,
  };

  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${header}.${body}`;
  const key = await importHmacKey(getRoutingSecret());
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  return `${signingInput}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyRoutingState(token: string | undefined): Promise<RoutingState | null> {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const signingInput = `${header}.${body}`;
  const key = await importHmacKey(getRoutingSecret());
  const signatureBytes = fromBase64Url(signature);
  const signatureBuffer = new Uint8Array(signatureBytes);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    encoder.encode(signingInput),
  );

  if (!valid) {
    return null;
  }

  try {
    const payloadRaw = fromBase64Url(body);
    const payloadText = new TextDecoder().decode(payloadRaw);
    const payload = JSON.parse(payloadText) as unknown;
    return parseSignedState(payload);
  } catch {
    return null;
  }
}

export function destinationFromRoutingState(state: RoutingState): string {
  if (state.role === "admin") {
    return "/dashboard/admin";
  }

  if (!state.role || state.onboardingState === "no_role_selected") {
    return "/onboarding";
  }

  if (state.onboardingState === "incomplete") {
    return state.role === "artist" ? "/onboarding/artist" : "/onboarding/fan";
  }

  return state.role === "artist" ? "/dashboard/artist" : "/dashboard/fan";
}

export function clearRoutingStateCookie(response: CookieWriter) {
  response.cookies.set({
    name: ROUTING_STATE_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function setRoutingStateCookie(
  response: CookieWriter,
  state: RoutingState,
) {
  const token = await signRoutingState(state);
  response.cookies.set({
    name: ROUTING_STATE_COOKIE,
    value: token,
    path: "/",
    maxAge: ROUTING_STATE_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function stateFromApiPayload(payload: unknown): RoutingState | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as {
    authenticated?: boolean;
    user?: { role?: unknown; onboardingState?: unknown } | null;
  };

  if (root.authenticated === false || !root.user) {
    return null;
  }

  const role = root.user.role;
  const onboardingState = root.user.onboardingState;
  if (!isRoutingRole(role) || !isRoutingOnboardingState(onboardingState)) {
    return null;
  }

  return { role, onboardingState };
}
