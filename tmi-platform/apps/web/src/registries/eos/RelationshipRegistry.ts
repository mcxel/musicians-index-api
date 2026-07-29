/**
 * EOS Layer 6 — RelationshipRegistry
 *
 * Canonical kind definitions + allowed from→to role pairs (Rule 26 aware).
 * Does not store edges — RelationshipGraphEngine owns the in-memory graph.
 * Does not replace Prisma Follow/Friendship/FanClub or lib/social/* (Rule 8).
 */

import type {
  RelationshipEntityRole,
  RelationshipKind,
} from "@/core/eos/relationshipContracts";

export interface RelationshipKindDefinition {
  kind: RelationshipKind;
  displayName: string;
  description: string;
  /** Directed: from initiates / owns the edge toward to */
  directed: boolean;
  /** Requires mutual acceptance (FRIEND) or one-way (FOLLOW) */
  requiresAcceptance: boolean;
  /** Roles allowed on the from side */
  allowedFromRoles: readonly RelationshipEntityRole[];
  /** Roles allowed on the to side */
  allowedToRoles: readonly RelationshipEntityRole[];
  notes: string;
}

const ALL_ACCOUNT: readonly RelationshipEntityRole[] = [
  "FAN",
  "PERFORMER",
  "BAND",
  "VENUE",
  "PROMOTER",
  "SPONSOR",
  "ADVERTISER",
  "WRITER",
  "JUDGE",
  "ADMIN",
  "STAFF",
  "USER",
] as const;

const CREATOR_ROLES: readonly RelationshipEntityRole[] = [
  "PERFORMER",
  "BAND",
  "DJ",
  "PRODUCER",
] as const;

const FAN_ONLY: readonly RelationshipEntityRole[] = ["FAN"] as const;

export const RELATIONSHIP_KIND_DEFINITIONS: Record<
  RelationshipKind,
  RelationshipKindDefinition
> = {
  FOLLOW: {
    kind: "FOLLOW",
    displayName: "Follow",
    description: "One-way follow — maps to Prisma Follow / social follow APIs.",
    directed: true,
    requiresAcceptance: false,
    allowedFromRoles: ALL_ACCOUNT,
    allowedToRoles: ALL_ACCOUNT,
    notes: "Any account may follow any other; product UI may narrow further.",
  },
  FRIEND: {
    kind: "FRIEND",
    displayName: "Friend",
    description: "Mutual friendship — maps to Prisma Friendship (accepted).",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ALL_ACCOUNT,
    allowedToRoles: ALL_ACCOUNT,
    notes: "ACTIVE only after acceptance; BLOCK supersedes.",
  },
  FAN_CLUB: {
    kind: "FAN_CLUB",
    displayName: "Fan Club",
    description: "Fan membership in a performer/band fan club.",
    directed: true,
    requiresAcceptance: false,
    allowedFromRoles: FAN_ONLY,
    allowedToRoles: ["PERFORMER", "BAND"] as const,
    notes: "Rule 26: fans join; performers/bands host — never reverse.",
  },
  BLOCK: {
    kind: "BLOCK",
    displayName: "Block",
    description: "Hard block — suppresses follow/friend/DM surfaces.",
    directed: true,
    requiresAcceptance: false,
    allowedFromRoles: ALL_ACCOUNT,
    allowedToRoles: ALL_ACCOUNT,
    notes: "Blocks win over all softer kinds when querying the graph.",
  },
  BAND_MEMBER: {
    kind: "BAND_MEMBER",
    displayName: "Band Member",
    description: "Performer membership in a BAND account.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["PERFORMER", "DJ", "PRODUCER"] as const,
    allowedToRoles: ["BAND"] as const,
    notes: "from = member, to = band entity.",
  },
  PRODUCER: {
    kind: "PRODUCER",
    displayName: "Producer Link",
    description: "Producer attached to a performer/band project.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["PRODUCER", "PERFORMER"] as const,
    allowedToRoles: ["PERFORMER", "BAND"] as const,
    notes: "Specialty edge — not a separate Fan resource.",
  },
  DJ: {
    kind: "DJ",
    displayName: "DJ Link",
    description: "DJ associated with a performer, band, or venue event.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["DJ", "PERFORMER"] as const,
    allowedToRoles: ["PERFORMER", "BAND", "VENUE"] as const,
    notes: "Does not grant World Dance Party create authority (Rule 21).",
  },
  VENUE_HOST: {
    kind: "VENUE_HOST",
    displayName: "Venue Host",
    description: "Host/staff relationship to a venue.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["HOST", "STAFF", "ADMIN", "PROMOTER", "PERFORMER"] as const,
    allowedToRoles: ["VENUE"] as const,
    notes: "Ticket authority remains Venue/Promoter only (Rule 17).",
  },
  PLAYLIST_COLLABORATOR: {
    kind: "PLAYLIST_COLLABORATOR",
    displayName: "Playlist Collaborator",
    description: "Shared edit/listen collaboration on a playlist.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ALL_ACCOUNT,
    allowedToRoles: ALL_ACCOUNT,
    notes: "Personal playlist collab is Fan-scoped product-side (Rule 26).",
  },
  MODERATOR: {
    kind: "MODERATOR",
    displayName: "Moderator",
    description: "Room or community moderation grant.",
    directed: true,
    requiresAcceptance: false,
    allowedFromRoles: ["ADMIN", "STAFF", "HOST", "VENUE", "PERFORMER", "BAND"] as const,
    allowedToRoles: ["FAN", "PERFORMER", "USER", "STAFF"] as const,
    notes: "from = granter / room owner; to = moderator.",
  },
  JUDGE: {
    kind: "JUDGE",
    displayName: "Judge",
    description: "Competition judge assignment relative to an event host.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["ADMIN", "HOST", "STAFF"] as const,
    allowedToRoles: ["JUDGE", "PERFORMER", "FAN"] as const,
    notes: "Official Automated Events may assign via bots — outcomes stay real (Rule 21).",
  },
  MANAGER: {
    kind: "MANAGER",
    displayName: "Manager",
    description: "Manager relationship for a performer or band.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["MANAGER", "USER", "PROMOTER", "STAFF"] as const,
    allowedToRoles: ["PERFORMER", "BAND"] as const,
    notes: "Does not imply ticket-sell authority (Rule 17).",
  },
  COLLABORATES_WITH: {
    kind: "COLLABORATES_WITH",
    displayName: "Collaborates With",
    description: "Symmetric creative collaboration link.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: [...CREATOR_ROLES, "WRITER", "FAN"] as const,
    allowedToRoles: [...CREATOR_ROLES, "WRITER", "FAN", "VENUE"] as const,
    notes: "Soft social/creative link — not a legal contract.",
  },
  INVITED_BY: {
    kind: "INVITED_BY",
    displayName: "Invited By",
    description: "Invite attribution — from was invited by to.",
    directed: true,
    requiresAcceptance: false,
    allowedFromRoles: ALL_ACCOUNT,
    allowedToRoles: ALL_ACCOUNT,
    notes: "Maps to invite / referral records when bridged.",
  },
  SPONSOR_OF: {
    kind: "SPONSOR_OF",
    displayName: "Sponsor Of",
    description: "Sponsor supporting an artist, event host, or venue.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["SPONSOR", "ADVERTISER", "ADMIN"] as const,
    allowedToRoles: ["PERFORMER", "BAND", "VENUE", "PROMOTER"] as const,
    notes: "Commerce remains on SponsorRegistry / Stripe paths.",
  },
  MENTOR: {
    kind: "MENTOR",
    displayName: "Mentor",
    description: "Optional mentor → mentee edge.",
    directed: true,
    requiresAcceptance: true,
    allowedFromRoles: ["PERFORMER", "BAND", "DJ", "PRODUCER", "WRITER", "JUDGE"] as const,
    allowedToRoles: ["FAN", "PERFORMER", "USER"] as const,
    notes: "Optional; no fake mentor lists.",
  },
};

export function getRelationshipKindDefinition(
  kind: RelationshipKind,
): RelationshipKindDefinition {
  return RELATIONSHIP_KIND_DEFINITIONS[kind];
}

export function listRelationshipKinds(): RelationshipKind[] {
  return Object.keys(RELATIONSHIP_KIND_DEFINITIONS) as RelationshipKind[];
}

/**
 * Rule 26-aware allowance check for a proposed edge.
 * Returns false when roles are outside the kind matrix.
 */
export function isRelationshipAllowed(
  kind: RelationshipKind,
  fromRole: RelationshipEntityRole,
  toRole: RelationshipEntityRole,
): boolean {
  const def = RELATIONSHIP_KIND_DEFINITIONS[kind];
  return (
    def.allowedFromRoles.includes(fromRole) &&
    def.allowedToRoles.includes(toRole)
  );
}

/** Boot / unit integrity — every kind has a non-empty role matrix. */
export function assertRelationshipRegistryIntegrity(): void {
  for (const kind of listRelationshipKinds()) {
    const def = RELATIONSHIP_KIND_DEFINITIONS[kind];
    if (!def.allowedFromRoles.length || !def.allowedToRoles.length) {
      throw new Error(`RelationshipRegistry: ${kind} missing role matrix`);
    }
  }
}
