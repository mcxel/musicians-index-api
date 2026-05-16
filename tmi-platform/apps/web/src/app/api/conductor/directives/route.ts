export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: NextRequest) {
  const activeOnly = req.nextUrl.searchParams.get("activeOnly") ?? "true";
  return proxyToApi(req, `/conductor/directives?activeOnly=${activeOnly}`);
}

export async function POST(req: NextRequest) {
  return proxyToApi(req, "/conductor/directives");
}
