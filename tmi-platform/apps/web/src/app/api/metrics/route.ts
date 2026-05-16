import { NextResponse } from 'next/server';

export async function GET() {
  const mem = process.memoryUsage();
  return NextResponse.json({
    ok: true,
    moduleId: 'web',
    metrics: {
      uptime_seconds: Math.floor(process.uptime()),
      memory_rss: mem.rss,
      memory_heap_used: mem.heapUsed,
      memory_heap_total: mem.heapTotal,
      timestamp: Date.now(),
    },
  });
}
