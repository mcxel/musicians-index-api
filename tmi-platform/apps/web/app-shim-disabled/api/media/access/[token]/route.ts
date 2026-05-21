import { proxyToApi } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const scope = new URL(req.url).searchParams.get("scope");
  const suffix = scope ? `?scope=${encodeURIComponent(scope)}` : "";
  return proxyToApi(req, `/api/media/access/${params.token}${suffix}`);
}
