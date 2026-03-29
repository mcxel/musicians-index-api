import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
    const backendHealthUrl = new URL('/api/healthz', baseUrl).toString();
    const res = await fetch(backendHealthUrl);
    if (!res.ok) {
      throw new Error(`Backend health check at ${backendHealthUrl} failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        backendApi: {
          status: 'ready',
          url: backendHealthUrl,
          data,
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
          backendApi: {
            status: 'not_ready',
            error: msg,
          },
        },
      },
      { status: 503 }
    );
  }
}
