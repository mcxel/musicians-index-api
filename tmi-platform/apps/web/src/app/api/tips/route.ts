import { proxyToApi } from "@/lib/apiProxy";

// Proxies to /api/tips on NestJS backend.
// Copilot: add TipsModule with POST /tips { recipientId, amount, roomId } to wallet service.
export async function POST(req: Request) {
  return proxyToApi(req, "/api/tips");
}
