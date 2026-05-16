import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return proxyToApi(req, `/api/rooms/${params.id}/members`);
}
