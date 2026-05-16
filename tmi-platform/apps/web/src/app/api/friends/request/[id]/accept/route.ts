import { proxyToApi } from "@/lib/apiProxy";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return proxyToApi(req, `/api/friends/request/${params.id}/accept`);
}
