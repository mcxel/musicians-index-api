export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/observatory/stream
 *
 * Server-Sent Events stream for the Observatory dashboard.
 * Pushes a JSON snapshot every 5 seconds so the client never needs manual refresh.
 *
 * Payload shape: ObservatoryStreamEvent
 *
 * Auth: requires tmi_role=admin cookie (same guard as all admin routes).
 * The stream closes automatically when the client disconnects.
 */

import { NextRequest } from "next/server";
import { getActiveSessions } from "@/lib/live/GlobalLiveSessionRegistry";
import { getFleetSummary } from "@/lib/qa/QACertificationFleet";
import { getPipelineSummary } from "@/lib/qa/RevenuePipelineLedger";

function isAdmin(req: NextRequest): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  const parsed = req.cookies.get("tmi_role")?.value ?? "";
  return (
    cookie.includes("tmi_role=admin") ||
    cookie.includes("tmi_role=ADMIN") ||
    parsed.toLowerCase() === "admin"
  );
}

function buildSnapshot() {
  const live = (() => {
    try { return getActiveSessions(); } catch { return []; }
  })();

  const fleet = (() => {
    try { return getFleetSummary(); } catch { return null; }
  })();

  const revenue = (() => {
    try { return getPipelineSummary(); } catch { return null; }
  })();

  return {
    ts: new Date().toISOString(),
    liveSessionCount: live.length,
    liveSessions: live.slice(0, 12).map((s) => ({
      roomId:    s.roomId,
      performer: s.displayName,
      genre:     s.category,
      audience:  s.viewerCount,
    })),
    fleet: fleet
      ? {
          total:               fleet.total,
          pass:                fleet.pass,
          fail:                fleet.fail,
          pending:             fleet.pending,
          platformHealthScore: fleet.platformHealthScore,
          recommendation:      fleet.releaseGate.recommendation,
          revenueCertification:fleet.releaseGate.revenueCertification,
        }
      : null,
    revenue: revenue
      ? {
          overallCertification: revenue.overallRevenueCertification,
          greenPipelines:       revenue.greenPipelines,
          holdPipelines:        revenue.holdPipelines,
          pendingPipelines:     revenue.pendingPipelines,
          blockingFailures:     revenue.blockingFailures.slice(0, 5),
        }
      : null,
  };
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return new Response(JSON.stringify({ error: "admin_required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function push() {
        try {
          const snapshot = buildSnapshot();
          const data = `data: ${JSON.stringify(snapshot)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // non-fatal — client will retry
        }
      }

      // Send immediately on connect
      push();

      // Then every 5 seconds
      const interval = setInterval(push, 5_000);

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering for SSE
    },
  });
}
