/**
 * MultiPersonaEngine.ts
 *
 * TMI Multi-Persona Identity Orchestration Engine
 *
 * Architecture: one identity → multiple personas → multiple capabilities
 *
 * A single TMI user can simultaneously hold:
 *   fan · artist · producer · performer · dj · host
 *   sponsor · advertiser · venue · group-member · admin · moderator
 *
 * Each persona is:
 *   - independently activated/deactivated
 *   - backed by its own capability slice
 *   - linked to separate analytics, XP, and rankings
 *   - switchable without logout (session token unchanged)
 *
 * Shared across all personas of an identity:
 *   - notifications
 *   - observatory/diagnostics (if permitted)
 *   - platform membership
 *   - linked group/collective memberships
 *
 * Kept strictly separate per persona:
 *   - wallet
 *   - XP
 *   - rankings
 *   - achievements
 *   - storefront
 *   - fan metrics
 *   - purchase history
 *   - release analytics
 */

// ── Persona Types ────────────────────────────────────────────────────────────

export type PersonaType =
  | 'fan'           // consume, vote, chat, buy, attend
  | 'artist'        // releases, charts, profile, storefront, NFTs, livestream
  | 'producer'      // beats, instrumentals, licensing, battle/cypher/game submissions
  | 'performer'     // live performance, cypher, battles (no full artist discography)
  | 'dj'            // mixing sets, live events, DJ charts
  | 'host'          // event hosting, room control, AMA moderation
  | 'sponsor'       // sponsorship dashboards, brand placement, contest backing
  | 'advertiser'    // ad campaigns, placements, analytics
  | 'venue'         // venue management, booking, seating, ticketing
  | 'group-member'  // collective/band/label membership, shared assets
  | 'admin'         // platform administration, observatory, moderation
  | 'moderator';    // content moderation, community enforcement (subset of admin)

// ── Capabilities ─────────────────────────────────────────────────────────────

export type Capability =
  // Fan
  | 'fan:attend-events'     | 'fan:vote'           | 'fan:chat'
  | 'fan:tip'               | 'fan:buy-nfts'        | 'fan:buy-tickets'
  | 'fan:collectibles'      | 'fan:xp-earn'
  // Artist
  | 'artist:profile'        | 'artist:releases'     | 'artist:chart'
  | 'artist:storefront'     | 'artist:nft-mint'     | 'artist:livestream'
  | 'artist:beat-vault'     | 'artist:backstage'    | 'artist:analytics'
  | 'artist:article'        | 'artist:cypher'       | 'artist:booking'
  | 'artist:xp-earn'
  // Producer
  | 'producer:beat-upload'  | 'producer:beat-license'   | 'producer:beat-vault'
  | 'producer:submit-battles'| 'producer:submit-cyphers' | 'producer:submit-games'
  | 'producer:attribution'  | 'producer:analytics'      | 'producer:royalty-split'
  | 'producer:storefront'   | 'producer:xp-earn'
  // Performer
  | 'performer:live'        | 'performer:cypher'    | 'performer:battle'
  | 'performer:green-room'  | 'performer:xp-earn'
  // DJ
  | 'dj:sets'               | 'dj:chart'            | 'dj:live-mix'
  | 'dj:livestream'         | 'dj:xp-earn'
  // Host
  | 'host:events'           | 'host:room-control'   | 'host:ama'
  | 'host:moderation-light' | 'host:xp-earn'
  // Sponsor
  | 'sponsor:dashboard'     | 'sponsor:placement'   | 'sponsor:campaigns'
  | 'sponsor:contest-back'  | 'sponsor:analytics'   | 'sponsor:rewards'
  // Advertiser
  | 'advertiser:campaigns'  | 'advertiser:placements'| 'advertiser:analytics'
  | 'advertiser:billing'
  // Venue
  | 'venue:profile'         | 'venue:booking'       | 'venue:seating'
  | 'venue:ticketing'       | 'venue:livestream'    | 'venue:analytics'
  // Group
  | 'group:shared-releases' | 'group:shared-assets' | 'group:split-royalties'
  | 'group:shared-calendar' | 'group:shared-analytics'
  // Admin
  | 'admin:users'           | 'admin:revenue'       | 'admin:bots'
  | 'admin:moderation'      | 'admin:system'        | 'admin:observatory'
  | 'admin:diagnostics'     | 'admin:telemetry'     | 'admin:recovery'
  // Moderator
  | 'mod:content-review'    | 'mod:user-flags'      | 'mod:ban'
  | 'mod:restore'           | 'mod:audit-log';

// ── Capability Matrix ────────────────────────────────────────────────────────

export const CAPABILITY_MATRIX: Record<PersonaType, Capability[]> = {
  fan: [
    'fan:attend-events', 'fan:vote', 'fan:chat', 'fan:tip',
    'fan:buy-nfts', 'fan:buy-tickets', 'fan:collectibles', 'fan:xp-earn',
  ],
  artist: [
    'fan:attend-events', 'fan:vote', 'fan:chat', 'fan:tip', 'fan:xp-earn',
    'artist:profile', 'artist:releases', 'artist:chart', 'artist:storefront',
    'artist:nft-mint', 'artist:livestream', 'artist:beat-vault', 'artist:backstage',
    'artist:analytics', 'artist:article', 'artist:cypher', 'artist:booking', 'artist:xp-earn',
  ],
  producer: [
    'fan:attend-events', 'fan:chat', 'fan:xp-earn',
    'producer:beat-upload', 'producer:beat-license', 'producer:beat-vault',
    'producer:submit-battles', 'producer:submit-cyphers', 'producer:submit-games',
    'producer:attribution', 'producer:analytics', 'producer:royalty-split',
    'producer:storefront', 'producer:xp-earn',
  ],
  performer: [
    'fan:attend-events', 'fan:vote', 'fan:chat', 'fan:xp-earn',
    'performer:live', 'performer:cypher', 'performer:battle',
    'performer:green-room', 'performer:xp-earn',
  ],
  dj: [
    'fan:attend-events', 'fan:chat', 'fan:xp-earn',
    'dj:sets', 'dj:chart', 'dj:live-mix', 'dj:livestream', 'dj:xp-earn',
  ],
  host: [
    'fan:attend-events', 'fan:chat', 'fan:xp-earn',
    'host:events', 'host:room-control', 'host:ama', 'host:moderation-light', 'host:xp-earn',
  ],
  sponsor: [
    'fan:attend-events', 'fan:chat',
    'sponsor:dashboard', 'sponsor:placement', 'sponsor:campaigns',
    'sponsor:contest-back', 'sponsor:analytics', 'sponsor:rewards',
  ],
  advertiser: [
    'fan:chat',
    'advertiser:campaigns', 'advertiser:placements', 'advertiser:analytics', 'advertiser:billing',
  ],
  venue: [
    'fan:attend-events', 'fan:chat',
    'venue:profile', 'venue:booking', 'venue:seating',
    'venue:ticketing', 'venue:livestream', 'venue:analytics',
  ],
  'group-member': [
    'fan:attend-events', 'fan:vote', 'fan:chat', 'fan:xp-earn',
    'group:shared-releases', 'group:shared-assets', 'group:split-royalties',
    'group:shared-calendar', 'group:shared-analytics',
  ],
  admin: [
    'fan:attend-events', 'fan:vote', 'fan:chat', 'fan:tip', 'fan:xp-earn',
    'artist:profile', 'artist:releases', 'artist:chart', 'artist:storefront',
    'artist:nft-mint', 'artist:livestream', 'artist:beat-vault', 'artist:backstage',
    'artist:analytics', 'artist:article', 'artist:cypher', 'artist:booking',
    'producer:beat-upload', 'producer:beat-vault', 'producer:attribution',
    'host:events', 'host:room-control', 'host:ama',
    'admin:users', 'admin:revenue', 'admin:bots', 'admin:moderation',
    'admin:system', 'admin:observatory', 'admin:diagnostics', 'admin:telemetry', 'admin:recovery',
    'mod:content-review', 'mod:user-flags', 'mod:ban', 'mod:restore', 'mod:audit-log',
  ],
  moderator: [
    'fan:attend-events', 'fan:chat',
    'host:moderation-light',
    'mod:content-review', 'mod:user-flags', 'mod:ban', 'mod:restore', 'mod:audit-log',
  ],
};

// ── Persona Metadata ─────────────────────────────────────────────────────────

export interface PersonaMeta {
  type:           PersonaType;
  label:          string;
  icon:           string;
  color:          string;
  description:    string;
  dashboardRoute: string;
  analyticsRoute?: string;
}

export const PERSONA_META: Record<PersonaType, PersonaMeta> = {
  fan:          { type:'fan',          label:'Fan',          icon:'🎧', color:'#FF2DAA', description:'Attend events, vote, collect, support artists.',        dashboardRoute:'/hub/fan'                },
  artist:       { type:'artist',       label:'Artist',       icon:'🎤', color:'#00FFFF', description:'Releases, charts, storefront, livestream.',              dashboardRoute:'/hub/artist',             analyticsRoute:'/artists/dashboard' },
  producer:     { type:'producer',     label:'Producer',     icon:'🎛️', color:'#FFD700', description:'Beats, licensing, battle/cypher/game submissions.',     dashboardRoute:'/hub/producer',           analyticsRoute:'/producer/analytics' },
  performer:    { type:'performer',    label:'Performer',    icon:'🎭', color:'#FF9500', description:'Live performance, cypher, battles.',                     dashboardRoute:'/hub/performer'          },
  dj:           { type:'dj',           label:'DJ',           icon:'🎚️', color:'#AA2DFF', description:'Sets, DJ charts, live mixes.',                          dashboardRoute:'/hub/dj'                 },
  host:         { type:'host',         label:'Host',         icon:'🎙️', color:'#00FF88', description:'Event hosting, room control, AMAs.',                   dashboardRoute:'/hub/host'               },
  sponsor:      { type:'sponsor',      label:'Sponsor',      icon:'🏆', color:'#FFD700', description:'Sponsorship dashboards, brand placement.',              dashboardRoute:'/sponsor/dashboard',      analyticsRoute:'/sponsor/analytics' },
  advertiser:   { type:'advertiser',   label:'Advertiser',   icon:'📢', color:'#FF6B35', description:'Ad campaigns, placements, analytics.',                  dashboardRoute:'/advertiser/dashboard',   analyticsRoute:'/advertiser/analytics' },
  venue:        { type:'venue',        label:'Venue',        icon:'🏟️', color:'#00FF88', description:'Venue management, booking, ticketing.',                 dashboardRoute:'/venues/dashboard'       },
  'group-member':{ type:'group-member',label:'Group',        icon:'👥', color:'#8B5CF6', description:'Collective/band membership, shared releases.',           dashboardRoute:'/hub/group'              },
  admin:        { type:'admin',        label:'Admin',        icon:'⚡', color:'#ff6b1a', description:'Full platform administration and governance.',           dashboardRoute:'/admin/observatory',      analyticsRoute:'/admin/analytics' },
  moderator:    { type:'moderator',    label:'Moderator',    icon:'🛡️', color:'#6B7280', description:'Content moderation and community enforcement.',         dashboardRoute:'/admin/moderation'       },
};

// ── User Persona Profile (in-memory / session layer) ─────────────────────────

export interface UserPersonaProfile {
  userId:        string;
  activePersona: PersonaType;
  personas:      PersonaType[];    // all personas this user has activated
  switchedAt:    number;
}

const ACTIVE_PERSONA_KEY    = 'tmi_active_persona';
const ACTIVE_PERSONAS_KEY   = 'tmi_user_personas';
const PERSONA_COOKIE_NAME   = 'tmi_persona';
const PERSONA_MAX_AGE       = 60 * 60 * 24 * 7;

// ── Session Helpers ──────────────────────────────────────────────────────────

export function getActivePersonaFromCookie(): PersonaType | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )tmi_persona=([^;]*)/);
  const v = m ? decodeURIComponent(m[1]) : null;
  return isPersonaType(v) ? v : null;
}

export function isPersonaType(v: unknown): v is PersonaType {
  return typeof v === 'string' && v in CAPABILITY_MATRIX;
}

export function getUserPersonas(): PersonaType[] {
  if (typeof localStorage === 'undefined') return ['fan'];
  try {
    const stored = localStorage.getItem(ACTIVE_PERSONAS_KEY);
    if (!stored) return ['fan'];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isPersonaType) : ['fan'];
  } catch { return ['fan']; }
}

export function setUserPersonas(personas: PersonaType[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ACTIVE_PERSONAS_KEY, JSON.stringify([...new Set(personas)]));
}

export function addPersona(personaType: PersonaType): PersonaType[] {
  const current = getUserPersonas();
  if (current.includes(personaType)) return current;
  const updated = [...current, personaType];
  setUserPersonas(updated);
  return updated;
}

export function removePersona(personaType: PersonaType): PersonaType[] {
  const current = getUserPersonas().filter((p) => p !== personaType && p !== 'fan');
  const withFan: PersonaType[] = current.includes('fan') ? current : ['fan', ...current];
  setUserPersonas(withFan);
  return withFan;
}

// ── Switching ────────────────────────────────────────────────────────────────

export interface PersonaSwitchResult {
  ok:             boolean;
  personaType:    PersonaType;
  capabilities:   Capability[];
  dashboardRoute: string;
  label:          string;
  error?:         string;
}

export function switchPersonaLocal(personaType: PersonaType): PersonaSwitchResult {
  if (!isPersonaType(personaType)) {
    return { ok: false, personaType: 'fan', capabilities: [], dashboardRoute: '/hub/fan', label: 'Fan', error: `Unknown persona: ${personaType}` };
  }

  // Update persona cookie
  if (typeof document !== 'undefined') {
    document.cookie = `${PERSONA_COOKIE_NAME}=${personaType}; path=/; max-age=${PERSONA_MAX_AGE}; SameSite=Lax`;
  }

  // Update localStorage state
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify({
      personaType,
      switchedAt: Date.now(),
    }));
    // Ensure this persona is in the user's list
    const current = getUserPersonas();
    if (!current.includes(personaType)) {
      setUserPersonas([...current, personaType]);
    }
  }

  const meta         = PERSONA_META[personaType];
  const capabilities = CAPABILITY_MATRIX[personaType];

  return {
    ok:             true,
    personaType,
    capabilities,
    dashboardRoute: meta.dashboardRoute,
    label:          meta.label,
  };
}

// ── Capability Checks ────────────────────────────────────────────────────────

export function getCapabilities(personaType: PersonaType): Capability[] {
  return CAPABILITY_MATRIX[personaType] ?? [];
}

export function hasCapability(personaType: PersonaType, capability: Capability): boolean {
  return CAPABILITY_MATRIX[personaType]?.includes(capability) ?? false;
}

export function getCapabilitiesForPersonas(personas: PersonaType[]): Set<Capability> {
  const caps = new Set<Capability>();
  for (const p of personas) {
    for (const c of CAPABILITY_MATRIX[p] ?? []) caps.add(c);
  }
  return caps;
}

export function canAccess(personas: PersonaType[], capability: Capability): boolean {
  return getCapabilitiesForPersonas(personas).has(capability);
}

// ── Telemetry Tagging ────────────────────────────────────────────────────────

export interface PersonaTelemetryTag {
  activePersona: PersonaType;
  personas:      PersonaType[];
  taggedAt:      number;
}

export function getPersonaTelemetryTag(): PersonaTelemetryTag {
  const activePersona = getActivePersonaFromCookie() ?? 'fan';
  const personas      = getUserPersonas();
  return { activePersona, personas, taggedAt: Date.now() };
}

// ── Routing ──────────────────────────────────────────────────────────────────

export function getPersonaDashboard(personaType: PersonaType): string {
  return PERSONA_META[personaType]?.dashboardRoute ?? '/dashboard';
}

export function getPersonaAnalyticsRoute(personaType: PersonaType): string | null {
  return PERSONA_META[personaType]?.analyticsRoute ?? null;
}

export function getDefaultPersonaForRole(role: string): PersonaType {
  const map: Record<string, PersonaType> = {
    ADMIN:      'admin',
    ARTIST:     'artist',
    PERFORMER:  'performer',
    SPONSOR:    'sponsor',
    ADVERTISER: 'advertiser',
    VENUE:      'venue',
    MEMBER:     'fan',
    BOT:        'fan',
  };
  return map[role] ?? 'fan';
}

// ── Analytics Separation Note ────────────────────────────────────────────────
// Each persona's analytics are keyed by: userId + personaType
// e.g., getAnalyticsSnapshot(userId, 'producer') vs getAnalyticsSnapshot(userId, 'artist')
// This ensures beat stats ≠ artist stats ≠ fan stats
// even when all three belong to the same identity.
