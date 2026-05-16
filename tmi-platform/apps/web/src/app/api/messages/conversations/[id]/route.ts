import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return proxyToApi(req, `/api/messages/conversations/${params.id}`);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return proxyToApi(req, `/api/messages/conversations/${params.id}/read`);
}
