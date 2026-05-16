import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request) {
  return proxyToApi(req, "/api/messages/conversations");
}

export async function POST(req: Request) {
  return proxyToApi(req, "/api/messages");
}
