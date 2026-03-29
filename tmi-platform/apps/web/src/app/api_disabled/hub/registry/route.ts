import { proxyToApi } from "@/lib/apiProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  return proxyToApi(req, "/v1/hub/registry");
}
