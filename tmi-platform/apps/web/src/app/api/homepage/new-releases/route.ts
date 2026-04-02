import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "6";
  return proxyToApi(req as unknown as Request, `/artist/releases/new?limit=${limit}`);
}
