import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  return proxyToApi(req, `/api/tickets/${id}`);
}
