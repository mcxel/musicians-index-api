import { proxyToApiWithRoutingState } from "@/lib/apiProxyWithRoutingState";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return proxyToApiWithRoutingState(req, "/api/users/me");
}

export async function PATCH(req: Request) {
  return proxyToApiWithRoutingState(req, "/api/users/me");
}
