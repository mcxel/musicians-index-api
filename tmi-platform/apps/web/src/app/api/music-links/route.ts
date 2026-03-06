import { proxyToApi } from "@/lib/apiProxy";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyToApi(req, "/v1/music-links");
}

export async function GET(req: Request) {
  return proxyToApi(req, "/v1/music-links");
}
