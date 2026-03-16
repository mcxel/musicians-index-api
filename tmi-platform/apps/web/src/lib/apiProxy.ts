export async function proxyToApi(req: Request, path: string) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return new Response(
      JSON.stringify({ error: "API_BASE_URL not set", path }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  try {
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
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Upstream API unreachable",
        path,
        detail: error instanceof Error ? error.message : "Unknown proxy error",
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
