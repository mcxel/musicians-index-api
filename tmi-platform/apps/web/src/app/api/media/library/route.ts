import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request) {
  return proxyToApi(req, "/api/media/library");
}
