export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import {
  TMI_GOVERNANCE_CLUSTER,
  getMemberByEmail,
  getPersona,
  isGovernanceMember,
  type PersonaType as GovernancePersonaType,
} from '@/lib/auth/GovernanceClusterEngine';
import {
  PERSONA_META,
  CAPABILITY_MATRIX,
  isPersonaType,
  type PersonaType,
} from '@/lib/identity/MultiPersonaEngine';

/**
 * POST /api/auth/switch-persona
 *
 * Admin-only dashboard switching (Marcel Dickens, 2026-07-24: "fans and
 * performers cannot switch to each other's accounts. Only administrators
 * can do this."). Regular Fan/Performer/etc. accounts never get a persona
 * switcher, no matter how many real roles they hold.
 *
 * Governance members (Marcel/Justin/Jay Paul): body = { memberId, personaType }
 * Other ADMIN/STAFF accounts (oversight/QA preview, same bypass middleware.ts
 * already grants admins for /hub/*): body = { personaType }
 * Everyone else: 403.
 *
 * No logout — updates persona + role cookies server-side.
 *
 * GET /api/auth/switch-persona
 * Returns the cluster manifest (governance) or 403 for non-admin callers.
 */

const PERSONA_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setCookieHeader(name: string, value: string): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PERSONA_MAX_AGE}; SameSite=Lax`;
}

// ── GET — session manifest ────────────────────────────────────────────────────

const ADMIN_ROLES = new Set(['ADMIN', 'STAFF']);

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const currentPersona = req.cookies.get('tmi_persona')?.value ?? 'fan';

  // Governance members get the full cluster manifest
  const member = getMemberByEmail(auth.user.email);
  if (member) {
    return NextResponse.json({
      isGovernanceMember: true,
      clusterId:          TMI_GOVERNANCE_CLUSTER.clusterId,
      clusterName:        TMI_GOVERNANCE_CLUSTER.name,
      member: {
        memberId:   member.memberId,
        name:       member.name,
        personas:   member.personas,
        artistSlug: member.artistSlug,
        tier:       member.tier,
      },
      allMembers: TMI_GOVERNANCE_CLUSTER.members.map((m) => ({
        memberId: m.memberId,
        name:     m.name,
      })),
      currentPersona,
      currentMember:      req.cookies.get('tmi_cluster_member')?.value ?? member.memberId,
      sharedCapabilities: TMI_GOVERNANCE_CLUSTER.sharedCapabilities,
    });
  }

  // Admin-only dashboard switching (Rule: fans/performers cannot switch to
  // each other's accounts, only administrators can). Regular users get 403,
  // not a persona list — this is deliberately not self-service.
  if (!ADMIN_ROLES.has(auth.user.role.toUpperCase())) {
    return NextResponse.json({ error: 'Forbidden: dashboard switching is admin-only' }, { status: 403 });
  }

  const availablePersonas = Object.keys(PERSONA_META) as PersonaType[];
  return NextResponse.json({
    isGovernanceMember: false,
    email:              auth.user.email,
    currentPersona:     isPersonaType(currentPersona) ? currentPersona : 'fan',
    availablePersonas,
    capabilities:       CAPABILITY_MATRIX[isPersonaType(currentPersona) ? currentPersona as PersonaType : 'fan'],
  });
}

// ── POST — switch persona ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();

  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { memberId?: string; personaType?: string; userId?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { memberId, personaType, userId } = body;

  if (!personaType) {
    return NextResponse.json({ error: 'personaType required' }, { status: 400 });
  }

  // ── Branch A: Governance cluster switch (Marcel/Justin/Jay Paul) ──────────

  if (memberId && isGovernanceMember(auth.user.email)) {
    const governanceTypes: GovernancePersonaType[] = ['admin', 'artist', 'fan'];
    if (!governanceTypes.includes(personaType as GovernancePersonaType)) {
      return NextResponse.json({ error: `Governance personaType must be one of: ${governanceTypes.join(', ')}` }, { status: 400 });
    }

    const persona = getPersona(memberId, personaType as GovernancePersonaType);
    if (!persona) {
      return NextResponse.json({ error: `No governance persona found for ${memberId}:${personaType}` }, { status: 404 });
    }

    const res = NextResponse.json({
      ok:             true,
      mode:           'governance',
      memberId,
      personaType,
      personaId:      persona.personaId,
      role:           persona.role,
      dashboardRoute: persona.dashboardRoute,
      displayName:    persona.displayName,
      switchedAt:     new Date().toISOString(),
    });

    res.headers.append('Set-Cookie', setCookieHeader('tmi_persona', personaType));
    res.headers.append('Set-Cookie', setCookieHeader('tmi_cluster_member', memberId));
    res.headers.append('Set-Cookie', setCookieHeader('tmi_role', persona.role));
    res.headers.append('Set-Cookie', setCookieHeader('phase11_role', persona.role));

    return res;
  }

  // ── Branch B: Admin/Staff oversight preview (never regular users) ─────────
  // Same bypass middleware.ts already grants admins for /hub/* ("Admin/staff
  // can preview any hub for oversight/QA without holding that role
  // themselves") - never available to Fan/Performer/etc. accounts, no matter
  // how many real roles they hold. Fans and performers cannot switch to each
  // other's accounts; only administrators can (Marcel Dickens, 2026-07-24).

  if (!ADMIN_ROLES.has(auth.user.role.toUpperCase())) {
    return NextResponse.json({ error: 'Forbidden: dashboard switching is admin-only' }, { status: 403 });
  }

  if (!isPersonaType(personaType)) {
    const validTypes = Object.keys(PERSONA_META).join(', ');
    return NextResponse.json({ error: `Unknown personaType. Must be one of: ${validTypes}` }, { status: 400 });
  }

  const typedPersona = personaType as PersonaType;
  const meta         = PERSONA_META[typedPersona];
  const capabilities = CAPABILITY_MATRIX[typedPersona];

  // Map persona to a coarse session role for legacy middleware compatibility
  const sessionRole = _personaToSessionRole(typedPersona);

  const res = NextResponse.json({
    ok:             true,
    mode:           'platform',
    userId:         userId ?? auth.user.id ?? null,
    personaType:    typedPersona,
    label:          meta.label,
    dashboardRoute: meta.dashboardRoute,
    analyticsRoute: meta.analyticsRoute,
    capabilities,
    switchedAt:     new Date().toISOString(),
  });

  res.headers.append('Set-Cookie', setCookieHeader('tmi_persona', typedPersona));
  res.headers.append('Set-Cookie', setCookieHeader('tmi_role', sessionRole));
  res.headers.append('Set-Cookie', setCookieHeader('phase11_role', sessionRole));

  return res;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _personaToSessionRole(personaType: PersonaType): string {
  const roleMap: Partial<Record<PersonaType, string>> = {
    admin:     'admin',
    moderator: 'moderator',
    artist:    'artist',
    producer:  'artist',
    performer: 'artist',
    dj:        'artist',
    venue:     'venue',
    sponsor:   'sponsor',
    advertiser: 'advertiser',
    host:      'host',
    fan:       'fan',
    'group-member': 'artist',
  };
  return roleMap[personaType] ?? 'fan';
}
