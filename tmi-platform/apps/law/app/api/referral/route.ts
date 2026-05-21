import { NextRequest, NextResponse } from "next/server";
import { validateLawReferralSignature } from "@/security/SecurityController";
import { MODULE_CONFIG } from "@/config/module.config";
import { randomUUID } from "crypto";

// POST /api/referral
// Handles inbound referrals from TMI (and any other authorized module).
// Validates HMAC signature before processing.

interface ReferralRequest {
  correlationId: string;
  artist: { id: string; name: string; email?: string };
  reason: string;
  context?: Record<string, string>;
  signature: string;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  if (!MODULE_CONFIG.isolation.allowedOrigins.some((o) => origin.startsWith(o))) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ref = body as ReferralRequest;
  if (!ref.correlationId || !ref.artist?.id || !ref.signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const secret = process.env.TMI_REFERRAL_SECRET ?? "";
  const payload = JSON.stringify({
    correlationId: ref.correlationId,
    artistId: ref.artist.id,
    reason: ref.reason,
  });

  if (!validateLawReferralSignature(payload, ref.signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const referralId = randomUUID();
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30-minute intake link

  return NextResponse.json({
    referralId,
    intakeUrl: `https://${MODULE_CONFIG.domain}/intake?ref=${referralId}`,
    expiresAt,
  });
}
