export async function proxyToApi(req: Request, path: string) {
  const base = process.env.API_BASE_URL;
  if (!base) return new Response("API_BASE_URL not set", { status: 500 });

  const url = new URL(path, base);
  const res = await fetch(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers as HeadersInit,
  });
}
