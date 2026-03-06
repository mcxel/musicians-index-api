import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const runtimeUrl = process.env.RUNTIME_API_URL || 'http://localhost:8000/status';
    const res = await fetch(runtimeUrl);
    if (!res.ok) {
      throw new Error(`Runtime API at ${runtimeUrl} not ready: ${res.statusText}`);
    }
    const data = await res.json();
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        runtimeApi: {
          status: 'ready',
          url: runtimeUrl,
          data: data,
        },
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        dependencies: {
          runtimeApi: {
            status: 'not_ready',
            error: msg,
          },
        },
      },
      { status: 503 }
    );
  }
}
