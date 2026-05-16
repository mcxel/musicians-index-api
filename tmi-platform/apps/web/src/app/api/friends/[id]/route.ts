import { proxyToApi } from "@/lib/apiProxy";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return proxyToApi(req, `/api/friends/${params.id}`);
}
