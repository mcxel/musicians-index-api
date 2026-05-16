import { proxyToApi } from "@/lib/apiProxy";

export async function POST(req: Request) {
  return proxyToApi(req, "/api/beats/submit");
}
