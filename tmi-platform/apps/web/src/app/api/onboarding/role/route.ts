import { proxyToApiWithRoutingState } from "@/lib/apiProxyWithRoutingState";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyToApiWithRoutingState(req, "/api/onboarding/role");
}
