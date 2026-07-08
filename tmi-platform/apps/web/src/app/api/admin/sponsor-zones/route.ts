export const dynamic = 'force-dynamic';

import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_utils/require-admin';
import {
  listActiveSponsorZones,
  upsertActiveSponsorZone,
  removeActiveSponsorZone,
  type ActiveSponsorDisplay,
} from '@/lib/commerce/SponsorRegistry';

// File-backed persistence — zones survive server restarts.
const STORE_DIR  = path.join(process.cwd(), '.tmi-data');
const STORE_FILE = path.join(STORE_DIR, 'sponsor-zones.json');
let _hydrated = false;

function hydrateRegistry(): void {
  if (_hydrated) return;
  _hydrated = true;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8').trim();
    if (!raw) return;
    const zones = JSON.parse(raw) as Record<string, ActiveSponsorDisplay>;
    for (const [zone, sponsor] of Object.entries(zones)) {
      upsertActiveSponsorZone(zone, sponsor);
    }
  } catch { /* corrupt file — start fresh */ }
}

function persistRegistry(): void {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(listActiveSponsorZones(), null, 2), 'utf8');
  } catch { /* best-effort */ }
}

interface SponsorZonePayload {
  zone?: string;
  sponsorId?: string;
  name?: string;
  tagline?: string;
  logoUrl?: string;
  accentColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function validatePayload(payload: SponsorZonePayload): { ok: true; zone: string; sponsor: ActiveSponsorDisplay } | { ok: false; error: string } {
  const zone = payload.zone?.trim();
  if (!zone) return { ok: false, error: 'zone is required' };

  const sponsorId = payload.sponsorId?.trim();
  const name = payload.name?.trim();
  const tagline = payload.tagline?.trim();
  const accentColor = payload.accentColor?.trim();
  const ctaLabel = payload.ctaLabel?.trim();
  const ctaHref = payload.ctaHref?.trim();

  if (!sponsorId || !name || !tagline || !accentColor || !ctaLabel || !ctaHref) {
    return { ok: false, error: 'sponsorId, name, tagline, accentColor, ctaLabel, ctaHref are required' };
  }

  return {
    ok: true,
    zone,
    sponsor: {
      sponsorId,
      name,
      tagline,
      logoUrl: payload.logoUrl?.trim() || undefined,
      accentColor,
      ctaLabel,
      ctaHref,
    },
  };
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  hydrateRegistry();
  const zones = listActiveSponsorZones();
  return NextResponse.json({ zones, count: Object.keys(zones).length });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  hydrateRegistry();
  const body = await req.json() as SponsorZonePayload;
  const validated = validatePayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const sponsor = upsertActiveSponsorZone(validated.zone, validated.sponsor);
  persistRegistry();
  return NextResponse.json({ ok: true, zone: validated.zone, sponsor }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  hydrateRegistry();
  const body = await req.json().catch(() => ({})) as { zone?: string };
  const zone = body.zone?.trim();
  if (!zone) {
    return NextResponse.json({ error: 'zone is required' }, { status: 400 });
  }

  const removed = removeActiveSponsorZone(zone);
  if (!removed) {
    return NextResponse.json({ error: 'zone not found' }, { status: 404 });
  }

  persistRegistry();
  return NextResponse.json({ ok: true, zone });
}
