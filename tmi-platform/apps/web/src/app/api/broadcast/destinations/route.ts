/**
 * GET  /api/broadcast/destinations — public destination list (no secrets)
 * POST /api/broadcast/destinations — link | unlink | start | stop | enable | disable
 *
 * Rule 20: never returns stream keys/tokens. ● live only with ingestAck.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CANONICAL_BEZEL_PROVIDERS,
  destinationIdFor,
  type BroadcastDestinationPublic,
  type BroadcastProvider,
} from "@/lib/broadcast/BroadcastDestinationTypes";
import {
  attemptExternalIngest,
  isDestinationLinked,
  linkDestinationSecrets,
  providerEnvConfigured,
  unlinkDestinationSecrets,
} from "@/lib/broadcast/broadcastDestinationSecrets.server";

export const dynamic = "force-dynamic";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (email) {
    const dbUser = await prisma.user
      .findUnique({ where: { email }, select: { id: true } })
      .catch(() => null);
    if (dbUser?.id) return dbUser.id;
  }
  return req.cookies.get("tmi_session_id")?.value ?? null;
}

function isProvider(v: unknown): v is BroadcastProvider {
  return (
    v === "youtube" ||
    v === "instagram" ||
    v === "facebook" ||
    v === "kick" ||
    v === "twitch" ||
    v === "other"
  );
}

function buildPublicList(userId: string): BroadcastDestinationPublic[] {
  return CANONICAL_BEZEL_PROVIDERS.map((p) => {
    const linked = isDestinationLinked(userId, p.provider);
    const configured = providerEnvConfigured(p.provider);
    return {
      destinationId: destinationIdFor(userId, p.provider),
      provider: p.provider,
      label: p.label,
      shortCode: p.shortCode,
      connectionStatus: linked ? "off" : configured ? "off" : "locked",
      authState: linked ? "linked" : "unlinked",
      ingestType: "rtmp",
      enabled: false,
      health: "unknown",
      retryState: { attempts: 0, nextRetryAt: null },
      latencyMs: null,
      statusLine: linked
        ? "Ready"
        : configured
          ? "Tap to link"
          : "OAuth not configured",
    };
  });
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { destinations: buildPublicList(userId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    provider?: string;
    destinationId?: string;
    roomId?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const action = String(body.action ?? "").toLowerCase();

  if (action === "link") {
    const provider = isProvider(body.provider) ? body.provider : null;
    if (!provider) {
      return NextResponse.json({ ok: false, reason: "invalid_provider" }, { status: 400 });
    }
    const result = linkDestinationSecrets(userId, provider);
    if (!result.ok) {
      const dest: BroadcastDestinationPublic = {
        destinationId: destinationIdFor(userId, provider),
        provider,
        label: CANONICAL_BEZEL_PROVIDERS.find((p) => p.provider === provider)?.label ?? provider,
        shortCode: CANONICAL_BEZEL_PROVIDERS.find((p) => p.provider === provider)?.shortCode ?? "?",
        connectionStatus: "locked",
        authState: "unlinked",
        ingestType: "rtmp",
        enabled: false,
        health: "unknown",
        retryState: { attempts: 0, nextRetryAt: null },
        latencyMs: null,
        statusLine: "OAuth / stream key not configured",
      };
      return NextResponse.json({
        ok: false,
        reason: result.reason ?? "oauth_not_configured",
        connectionStatus: "locked",
        destination: dest,
        // Honest stub: no fake oauthUrl that pretends to work
        oauthUrl: undefined,
      });
    }
    const dest: BroadcastDestinationPublic = {
      destinationId: destinationIdFor(userId, provider),
      provider,
      label: CANONICAL_BEZEL_PROVIDERS.find((p) => p.provider === provider)?.label ?? provider,
      shortCode: CANONICAL_BEZEL_PROVIDERS.find((p) => p.provider === provider)?.shortCode ?? "?",
      connectionStatus: "off",
      authState: "linked",
      ingestType: "rtmp",
      enabled: false,
      health: "unknown",
      retryState: { attempts: 0, nextRetryAt: null },
      latencyMs: null,
      statusLine: "Linked — toggle when live",
    };
    return NextResponse.json({ ok: true, destination: dest });
  }

  if (action === "unlink") {
    const provider = isProvider(body.provider)
      ? body.provider
      : parseProviderFromDestinationId(body.destinationId);
    if (!provider) {
      return NextResponse.json({ ok: false, reason: "invalid_provider" }, { status: 400 });
    }
    unlinkDestinationSecrets(userId, provider);
    return NextResponse.json({ ok: true });
  }

  if (action === "start") {
    const provider =
      parseProviderFromDestinationId(body.destinationId) ??
      (isProvider(body.provider) ? body.provider : null);
    if (!provider) {
      return NextResponse.json({ ok: false, reason: "invalid_provider" }, { status: 400 });
    }
    if (!isDestinationLinked(userId, provider)) {
      return NextResponse.json({
        ok: false,
        authState: "unlinked",
        connectionStatus: "locked",
        statusLine: "Link account required",
      });
    }
    const roomId = String(body.roomId ?? "").trim();
    // Never block TMI — ingest attempt is best-effort
    const ingest = await attemptExternalIngest(userId, provider, roomId || "unknown");
    if (ingest.status === "live") {
      return NextResponse.json({
        ok: true,
        ingestAck: true,
        connectionStatus: "live",
        statusLine: "Live (ingest confirmed)",
        latencyMs: ingest.latencyMs ?? null,
      });
    }
    if (ingest.status === "connecting") {
      return NextResponse.json({
        ok: true,
        ingestAck: false,
        connectionStatus: "connecting",
        statusLine:
          ingest.reason === "rtmp_bridge_not_active"
            ? "Connected — awaiting RTMP ingest acknowledgement"
            : "Connecting — awaiting ingest acknowledgement",
      });
    }
    return NextResponse.json({
      ok: false,
      ingestAck: false,
      connectionStatus: "error",
      statusLine: ingest.reason === "not_linked" ? "Not linked" : "Ingest failed — TMI still live",
    });
  }

  if (action === "stop" || action === "disable") {
    return NextResponse.json({ ok: true, connectionStatus: "selected_off" });
  }

  if (action === "enable") {
    return NextResponse.json({
      ok: true,
      note: "Use action start while LIVE — enable alone does not prove ingest",
    });
  }

  return NextResponse.json({ ok: false, reason: "unknown_action" }, { status: 400 });
}

function parseProviderFromDestinationId(id?: string): BroadcastProvider | null {
  if (!id) return null;
  const providers: BroadcastProvider[] = [
    "youtube",
    "instagram",
    "facebook",
    "kick",
    "twitch",
    "other",
  ];
  for (const p of providers) {
    if (id.endsWith(`-${p}`)) return p;
  }
  return null;
}
