/**
 * GovernanceClusterEngine.ts
 *
 * TMI 3-Way Governance Cluster — Canonical Definition
 *
 * Architecture:
 *   One User record per member (ADMIN role = full permissions).
 *   Each member has an ArtistProfile + FanProfile for non-admin surfaces.
 *   PersonaType controls which HUD/dashboard is rendered — no second login required.
 *
 *   Shared:  observatory, diagnostics, moderation, telemetry, analytics, recovery logs
 *   Separate: wallet, XP, artist rankings, fan activity, achievements, chats, purchases
 */

import type { TMIRole, TMIPermission } from './roles';

// ── Types ────────────────────────────────────────────────────────────────────

export type PersonaType = 'admin' | 'artist' | 'fan';

export interface GovernancePersona {
  personaId:      string;       // 'marcel-admin', 'marcel-artist', etc.
  personaType:    PersonaType;
  role:           TMIRole;
  displayName:    string;
  username:       string;
  dashboardRoute: string;
  color:          string;
}

export interface GovernanceMember {
  memberId:     string;         // 'marcel' | 'justin' | 'jaypaul'
  name:         string;
  adminEmail:   string;         // Primary ADMIN account email
  personas:     GovernancePersona[];
  artistSlug:   string;         // For /artists/[slug] routing
  tier:         'diamond';
}

export interface GovernanceCluster {
  clusterId:             string;
  name:                  string;
  members:               GovernanceMember[];
  sharedCapabilities:    string[];
  separatedCapabilities: string[];
}

// ── Cluster Definition ───────────────────────────────────────────────────────

export const TMI_GOVERNANCE_CLUSTER: GovernanceCluster = {
  clusterId: 'tmi-launch-governance-v1',
  name:      'TMI Launch Governance Cluster',

  members: [
    {
      memberId:   'marcel',
      name:       'Marcel Dickens',
      adminEmail: 'berntmusic33@gmail.com',
      artistSlug: 'berntmusic',
      tier:       'diamond',
      personas: [
        {
          personaId:      'marcel-admin',
          personaType:    'admin',
          role:           'ADMIN',
          displayName:    'Marcel — Admin',
          username:       'marcel',
          dashboardRoute: '/admin/observatory',
          color:          '#ff6b1a',
        },
        {
          personaId:      'marcel-artist',
          personaType:    'artist',
          role:           'ARTIST',
          displayName:    'Bernt Music',
          username:       'berntmusic',
          dashboardRoute: '/hub/artist',
          color:          '#00FFFF',
        },
        {
          personaId:      'marcel-fan',
          personaType:    'fan',
          role:           'MEMBER',
          displayName:    'Marcel — Fan',
          username:       'marcelFan',
          dashboardRoute: '/hub/fan',
          color:          '#FF2DAA',
        },
      ],
    },
    {
      memberId:   'justin',
      name:       'Justin King',
      adminEmail: process.env.JUSTIN_EMAIL ?? '[JUSTIN_EMAIL_ENV_VAR_REQUIRED]',
      artistSlug: 'justinking',
      tier:       'diamond',
      personas: [
        {
          personaId:      'justin-admin',
          personaType:    'admin',
          role:           'ADMIN',
          displayName:    'Justin King — Admin',
          username:       'justin',
          dashboardRoute: '/admin/observatory',
          color:          '#ff6b1a',
        },
        {
          personaId:      'justin-artist',
          personaType:    'artist',
          role:           'ARTIST',
          displayName:    'Justin King',
          username:       'justinking',
          dashboardRoute: '/hub/artist',
          color:          '#00FFFF',
        },
        {
          personaId:      'justin-fan',
          personaType:    'fan',
          role:           'MEMBER',
          displayName:    'Justin — Fan',
          username:       'justinfan',
          dashboardRoute: '/hub/fan',
          color:          '#FF2DAA',
        },
      ],
    },
    {
      memberId:   'jaypaul',
      name:       'Jay Paul Sanchez',
      adminEmail: process.env.JPAUL_EMAIL ?? '[JPAUL_EMAIL_ENV_VAR_REQUIRED]',
      artistSlug: 'jaypaulsanchez',
      tier:       'diamond',
      personas: [
        {
          personaId:      'jaypaul-admin',
          personaType:    'admin',
          role:           'ADMIN',
          displayName:    'Jay Paul — Admin',
          username:       'jaypaul',
          dashboardRoute: '/admin/observatory',
          color:          '#ff6b1a',
        },
        {
          personaId:      'jaypaul-artist',
          personaType:    'artist',
          role:           'ARTIST',
          displayName:    'Jay Paul Sanchez',
          username:       'jaypaulsanchez',
          dashboardRoute: '/hub/artist',
          color:          '#00FFFF',
        },
        {
          personaId:      'jaypaul-fan',
          personaType:    'fan',
          role:           'MEMBER',
          displayName:    'Jay Paul — Fan',
          username:       'jaypaulfan',
          dashboardRoute: '/hub/fan',
          color:          '#FF2DAA',
        },
      ],
    },
  ],

  sharedCapabilities: [
    'observatory:view',
    'observatory:actions',
    'diagnostics:all',
    'telemetry:view',
    'telemetry:export',
    'moderation:view',
    'moderation:actions',
    'analytics:diamond',
    'analytics:cluster',
    'recovery:view',
    'recovery:override',
    'sponsor:oversight',
    'performer:oversight',
    'venue:oversight',
    'onboarding:metrics',
    'bot:metrics',
    'ticketing:metrics',
    'stripe:diagnostics',
    'livestream:diagnostics',
    'email:diagnostics',
  ],

  separatedCapabilities: [
    'wallet:balance',
    'wallet:transactions',
    'xp:points',
    'xp:tier',
    'artist:rankings',
    'artist:stats',
    'fan:activity',
    'fan:follows',
    'achievements:earned',
    'chat:history',
    'purchases:history',
    'beats:uploads',
    'nfts:owned',
    'collectibles:library',
  ],
};

// ── Resolution Helpers ───────────────────────────────────────────────────────

export function getMemberByEmail(email: string): GovernanceMember | null {
  return TMI_GOVERNANCE_CLUSTER.members.find(
    (m) => m.adminEmail.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

export function getMemberById(memberId: string): GovernanceMember | null {
  return TMI_GOVERNANCE_CLUSTER.members.find((m) => m.memberId === memberId) ?? null;
}

export function getPersona(memberId: string, personaType: PersonaType): GovernancePersona | null {
  const member = getMemberById(memberId);
  return member?.personas.find((p) => p.personaType === personaType) ?? null;
}

export function getAllPersonas(): GovernancePersona[] {
  return TMI_GOVERNANCE_CLUSTER.members.flatMap((m) => m.personas);
}

export function isGovernanceMember(email: string): boolean {
  return getMemberByEmail(email) !== null;
}

export function hasSharedCapability(capability: string): boolean {
  return TMI_GOVERNANCE_CLUSTER.sharedCapabilities.includes(capability);
}

export function getPersonaRoute(memberId: string, personaType: PersonaType): string {
  const persona = getPersona(memberId, personaType);
  return persona?.dashboardRoute ?? '/dashboard';
}

export function clusterMemberEmails(): string[] {
  return TMI_GOVERNANCE_CLUSTER.members.map((m) => m.adminEmail);
}
