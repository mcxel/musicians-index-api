import { proxyToApi } from "@/lib/apiProxy";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyToApi(req, "/api/official-links");
}
