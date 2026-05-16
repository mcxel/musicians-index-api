export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";

export async function POST(req: Request) {
  const rawBody = await req.json().catch(() => ({}));
  const token = typeof rawBody?.token === "string" ? rawBody.token : undefined;

  const forwardReq = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({ token }),
  });

  return proxyToApi(forwardReq, "/api/tickets/checkin");
}
