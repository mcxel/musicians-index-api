import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyToApi(req as unknown as Request, `/artist/${slug}`);
}
