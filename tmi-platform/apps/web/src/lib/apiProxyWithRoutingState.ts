import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import {
  clearRoutingStateCookie,
  setRoutingStateCookie,
  stateFromApiPayload,
} from "@/lib/routingState";

export async function proxyToApiWithRoutingState(req: Request, path: string) {
  const upstream = await proxyToApi(req, path);
  const bodyText = await upstream.text();
  const headers = new Headers(upstream.headers);
  headers.delete("content-length");

  const downstream = new NextResponse(bodyText, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });

  if (upstream.status === 401) {
    clearRoutingStateCookie(downstream);
    return downstream;
  }

  try {
    const payload = JSON.parse(bodyText) as unknown;
    const state = stateFromApiPayload(payload);
    if (state) {
      await setRoutingStateCookie(downstream, state);
    }
  } catch {
    // Non-JSON responses should pass through untouched.
  }

  return downstream;
}
