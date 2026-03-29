import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.RUNTIME_STATUS_BASE_URL ?? "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${base}/internal/runtime/status`, { cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: "runtime_status_unreachable", message: msg ?? "Unknown error" }, { status: 503 });
  }
}
