export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
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
 * Platform-wide persona switch — works for every authenticated user.
 *
 * Governance members: body = { memberId, personaType } (GovernancePersonaType)
 * All other users:    body = { personaType }           (full PersonaType from MultiPersonaEngine)
 *
 * No logout — updates persona + role cookies server-side.
 *
 * GET /api/auth/switch-persona
 * Returns the cluster manifest (governance) or available personas (general user).
 */

const PERSONA_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setCookieHeader(name: string, value: string): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PERSONA_MAX_AGE}; SameSite=Lax`;
}

// ── GET — session manifest ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const currentPersona = req.cookies.get('tmi_persona')?.value ?? 'fan';

  // Governance members get the full cluster manifest
  const member = getMemberByEmail(token.email as string);
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

  // General users get their available personas + capabilities
  const availablePersonas = Object.keys(PERSONA_META) as PersonaType[];
  return NextResponse.json({
    isGovernanceMember: false,
    email:              token.email,
    currentPersona:     isPersonaType(currentPersona) ? currentPersona : 'fan',
    availablePersonas,
    capabilities:       CAPABILITY_MATRIX[isPersonaType(currentPersona) ? currentPersona as PersonaType : 'fan'],
  });
}

// ── POST — switch persona ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { memberId?: string; personaType?: string; userId?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { memberId, personaType, userId } = body;

  if (!personaType) {
    return NextResponse.json({ error: 'personaType required' }, { status: 400 });
  }

  // ── Branch A: Governance cluster switch ───────────────────────────────────

  if (memberId && isGovernanceMember(token.email as string)) {
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

  // ── Branch B: Platform-wide persona switch (any user) ─────────────────────

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
    userId:         userId ?? token.sub ?? null,
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
