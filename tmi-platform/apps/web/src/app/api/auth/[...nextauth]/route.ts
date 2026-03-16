import { NextResponse } from "next/server";
import {
  clearRoutingStateCookie,
  setRoutingStateCookie,
  stateFromApiPayload,
} from "@/lib/routingState";

export const runtime = "nodejs";

function getAuthAction(req: Request): string {
  const url = new URL(req.url);
  const marker = "/api/auth/";
  const idx = url.pathname.indexOf(marker);
  return idx >= 0 ? url.pathname.slice(idx + marker.length) : "";
}

function getBackendBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:4000";
}

function splitCombinedSetCookieHeader(headerValue: string): string[] {
  return headerValue
    .split(/,(?=\s*[A-Za-z0-9!#$%&'*+.^_`|~-]+=)/g)
    .map((value) => value.trim())
    .filter(Boolean);
}

function getSetCookieHeaders(upstream: Response): string[] {
  const setCookies = (upstream.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
  if (setCookies.length > 0) {
    return setCookies;
  }

  const combined = upstream.headers.get("set-cookie");
  if (!combined) {
    return [];
  }
  return splitCombinedSetCookieHeader(combined);
}

function applySetCookieHeaders(response: NextResponse, cookieHeaders: string[]): void {
  for (const cookieHeader of cookieHeaders) {
    const parts = cookieHeader.split(";").map((part) => part.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx <= 0) {
      continue;
    }

    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    let path = "/";
    let secure = false;
    let httpOnly = false;
    let sameSite: "lax" | "strict" | "none" = "lax";
    let maxAge: number | undefined;
    let expires: Date | undefined;

    for (const attr of attrs) {
      const [rawKey, ...rawValueParts] = attr.split("=");
      const key = rawKey.toLowerCase();
      const rawValue = rawValueParts.join("=");

      if (key === "path" && rawValue) {
        path = rawValue;
      } else if (key === "secure") {
        secure = true;
      } else if (key === "httponly") {
        httpOnly = true;
      } else if (key === "samesite") {
        const normalized = rawValue.toLowerCase();
        if (normalized === "strict" || normalized === "lax" || normalized === "none") {
          sameSite = normalized;
        }
      } else if (key === "max-age") {
        const parsed = Number.parseInt(rawValue, 10);
        if (!Number.isNaN(parsed)) {
          maxAge = parsed;
        }
      } else if (key === "expires" && rawValue) {
        const parsed = new Date(rawValue);
        if (!Number.isNaN(parsed.getTime())) {
          expires = parsed;
        }
      }
    }

    response.cookies.set({
      name,
      value,
      path,
      secure,
      httpOnly,
      sameSite,
      maxAge,
      expires,
    });
  }
}

async function proxyToBackend(req: Request): Promise<Response> {
  const action = getAuthAction(req);
  const incomingUrl = new URL(req.url);
  const targetUrl = new URL(`/api/auth/${action}`, getBackendBaseUrl());
  targetUrl.search = incomingUrl.search;

  const forwardedHeaders = new Headers();
  const cookie = req.headers.get("cookie");
  const csrf = req.headers.get("x-csrf-token");
  const contentType = req.headers.get("content-type");

  if (cookie) {
    forwardedHeaders.set("cookie", cookie);
  }
  if (csrf) {
    forwardedHeaders.set("x-csrf-token", csrf);
  }
  if (contentType) {
    forwardedHeaders.set("content-type", contentType);
  }

  const method = req.method.toUpperCase();
  const shouldSendBody = method !== "GET" && method !== "HEAD";
  const body = shouldSendBody ? await req.text() : undefined;

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers: forwardedHeaders,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const cookieHeaders = getSetCookieHeaders(upstream);
  const downstreamHeaders = new Headers(upstream.headers);
  downstreamHeaders.delete("set-cookie");
  const responseBody = await upstream.text();

  const downstream = new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: downstreamHeaders,
  });

  applySetCookieHeaders(downstream, cookieHeaders);

  if (action === "logout") {
    clearRoutingStateCookie(downstream);
    return downstream;
  }

  if (action === "session" || action === "login") {
    try {
      const payload = JSON.parse(responseBody) as unknown;
      const state = stateFromApiPayload(payload);
      if (state) {
        await setRoutingStateCookie(downstream, state);
      } else {
        clearRoutingStateCookie(downstream);
      }
    } catch {
      if (action === "session") {
        clearRoutingStateCookie(downstream);
      }
    }
  }

  return downstream;
}

async function handleAuthProxy(req: Request): Promise<Response> {
  try {
    return await proxyToBackend(req);
  } catch {
    return Response.json({ error: "Auth backend unavailable" }, { status: 503 });
  }
}

export const GET = handleAuthProxy;
export const POST = handleAuthProxy;

export async function OPTIONS(req: Request) {
  return proxyToBackend(req);
}
