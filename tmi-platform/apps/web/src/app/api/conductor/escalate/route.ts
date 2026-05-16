import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

export async function POST(req: NextRequest) {
  return proxyToApi(req, "/conductor/escalate");
}
