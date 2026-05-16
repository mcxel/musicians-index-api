export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  return proxyToApi(req, `/conductor/tasks${params ? `?${params}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyToApi(req, "/conductor/tasks");
}
