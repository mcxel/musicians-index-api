/**
 * PersonaSwitchEngine.ts
 *
 * Session-level persona switching for governance cluster members.
 * No logout required — persona state persists via cookies + localStorage.
 *
 * Persona cookies:
 *   tmi_persona       = 'admin' | 'artist' | 'fan'
 *   tmi_cluster_member = 'marcel' | 'justin' | 'jaypaul'
 *   tmi_role          = updated to match persona role
 *
 * Session continuity:
 *   auth token remains unchanged across persona switches
 *   wallet/XP/achievements are keyed to the underlying userId
 *   only the surface/HUD changes
 */

import type { PersonaType } from './GovernanceClusterEngine';
import { getPersona, getMemberById, TMI_GOVERNANCE_CLUSTER } from './GovernanceClusterEngine';
import { setSession, getSessionToken, getRoleCookie } from './session';
import type { TMIRole } from './roles';

const PERSONA_COOKIE    = 'tmi_persona';
const MEMBER_COOKIE     = 'tmi_cluster_member';
const PERSONA_MAX_AGE   = 60 * 60 * 24 * 7; // 7 days

// ── Cookie helpers (client-side) ─────────────────────────────────────────────

export function setPersonaCookie(personaType: PersonaType): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${PERSONA_COOKIE}=${personaType}; path=/; max-age=${PERSONA_MAX_AGE}; SameSite=Lax`;
}

export function setMemberCookie(memberId: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${MEMBER_COOKIE}=${memberId}; path=/; max-age=${PERSONA_MAX_AGE}; SameSite=Lax`;
}

export function getActiveMemberId(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )tmi_cluster_member=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function getActivePersonaType(): PersonaType | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )tmi_persona=([^;]*)/);
  const v = m ? decodeURIComponent(m[1]) : null;
  return v === 'admin' || v === 'artist' || v === 'fan' ? v : null;
}

// ── Switch ───────────────────────────────────────────────────────────────────

export interface PersonaSwitchResult {
  ok:             boolean;
  memberId:       string;
  personaType:    PersonaType;
  role:           TMIRole;
  dashboardRoute: string;
  displayName:    string;
  error?:         string;
}

export function switchPersona(memberId: string, personaType: PersonaType): PersonaSwitchResult {
  const persona = getPersona(memberId, personaType);
  if (!persona) {
    return {
      ok:             false,
      memberId,
      personaType,
      role:           'MEMBER',
      dashboardRoute: '/dashboard',
      displayName:    '',
      error:          `No persona found for ${memberId}:${personaType}`,
    };
  }

  // Persist session token (unchanged) but update role cookie
  const currentToken = getSessionToken();
  if (currentToken) {
    setSession(currentToken, persona.role);
  }

  setPersonaCookie(personaType);
  setMemberCookie(memberId);

  // Persist to localStorage for HUD state
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tmi_active_persona', JSON.stringify({
      memberId,
      personaType,
      personaId:    persona.personaId,
      role:         persona.role,
      displayName:  persona.displayName,
      dashboardRoute: persona.dashboardRoute,
      switchedAt:   Date.now(),
    }));
  }

  return {
    ok:             true,
    memberId,
    personaType,
    role:           persona.role,
    dashboardRoute: persona.dashboardRoute,
    displayName:    persona.displayName,
  };
}

// ── Read current state ───────────────────────────────────────────────────────

export interface ActivePersonaState {
  memberId:       string | null;
  personaType:    PersonaType | null;
  role:           TMIRole | null;
  displayName:    string | null;
  dashboardRoute: string | null;
  isGovernance:   boolean;
}

export function getActivePersonaState(): ActivePersonaState {
  const memberId    = getActiveMemberId();
  const personaType = getActivePersonaType();
  const roleCookie  = getRoleCookie();

  if (!memberId || !personaType) {
    return {
      memberId:       null,
      personaType:    null,
      role:           roleCookie,
      displayName:    null,
      dashboardRoute: null,
      isGovernance:   false,
    };
  }

  const persona = getPersona(memberId, personaType);

  return {
    memberId,
    personaType,
    role:           persona?.role ?? roleCookie,
    displayName:    persona?.displayName ?? null,
    dashboardRoute: persona?.dashboardRoute ?? null,
    isGovernance:   true,
  };
}

export function getAvailablePersonas(memberId: string) {
  const member = getMemberById(memberId);
  return member?.personas ?? [];
}

export function getClusterMembers() {
  return TMI_GOVERNANCE_CLUSTER.members.map((m) => ({
    memberId:   m.memberId,
    name:       m.name,
    adminEmail: m.adminEmail,
    personas:   m.personas,
  }));
}
