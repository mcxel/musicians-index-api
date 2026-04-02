import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return proxyToApi(req as unknown as Request, "/contest/seasons/active");
}
