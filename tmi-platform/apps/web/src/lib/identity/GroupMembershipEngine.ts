/**
 * GroupMembershipEngine.ts
 *
 * TMI Group Identity Runtime
 *
 * Supports: rap groups · bands · producer collectives · labels
 *           DJ crews · venue teams · sponsorship teams
 *
 * Rules:
 *   - A user can be in multiple groups simultaneously
 *   - Each group has its own storefront, analytics, releases, calendar
 *   - Group assets are separate from solo assets
 *   - Split ownership is defined at the group level
 *   - A member can hold different roles in different groups
 *   - Leaving a group preserves solo identity completely
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type GroupType =
  | 'rap-group'
  | 'band'
  | 'producer-collective'
  | 'dj-crew'
  | 'label'
  | 'venue-team'
  | 'sponsor-team'
  | 'collective';

export type GroupRole =
  | 'founder'       // created the group, full control
  | 'admin'         // manages group settings, can add/remove members
  | 'member'        // standard group member
  | 'featured'      // credited contributor, no management access
  | 'producer'      // contributes beats to the group vault
  | 'engineer'      // mixing/mastering credits
  | 'manager'       // booking/business management
  | 'label-rep';    // label representative (read-only oversight)

export interface SplitOwnership {
  memberId:   string;
  percentage: number;   // 0–100, all splits must sum to 100
  splitType:  'equal' | 'custom' | 'role-based';
}

export interface GroupMember {
  userId:     string;
  role:       GroupRole;
  joinedAt:   string;
  splits:     SplitOwnership[];
  active:     boolean;
  displayName?: string;
}

export interface GroupAsset {
  assetId:    string;
  assetType:  'release' | 'beat' | 'nft' | 'ticket' | 'sponsorship' | 'event';
  title:      string;
  ownedBy:    string;   // groupId
  splits:     SplitOwnership[];
  createdAt:  string;
}

export interface Group {
  groupId:     string;
  name:        string;
  slug:        string;
  type:        GroupType;
  members:     GroupMember[];
  assets:      GroupAsset[];
  defaultSplit: 'equal' | 'role-based' | 'custom';
  verified:    boolean;
  createdAt:   string;
  genres?:     string[];
  bio?:        string;
  analyticsVisible: 'all-members' | 'admins-only';
}

// ── In-Memory Store (replaced by DB in production) ───────────────────────────

const GROUPS = new Map<string, Group>();

// ── CRUD ─────────────────────────────────────────────────────────────────────

export function createGroup(params: {
  name: string;
  slug: string;
  type: GroupType;
  founderId: string;
  founderDisplayName?: string;
  defaultSplit?: Group['defaultSplit'];
  genres?: string[];
  bio?: string;
}): Group {
  const groupId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const group: Group = {
    groupId,
    name:     params.name,
    slug:     params.slug,
    type:     params.type,
    verified: false,
    createdAt: new Date().toISOString(),
    genres:   params.genres,
    bio:      params.bio,
    defaultSplit:     params.defaultSplit ?? 'equal',
    analyticsVisible: 'all-members',
    members: [{
      userId:      params.founderId,
      role:        'founder',
      joinedAt:    new Date().toISOString(),
      active:      true,
      displayName: params.founderDisplayName,
      splits:      [{ memberId: params.founderId, percentage: 100, splitType: 'custom' }],
    }],
    assets: [],
  };
  GROUPS.set(groupId, group);
  return group;
}

export function getGroup(groupId: string): Group | null {
  return GROUPS.get(groupId) ?? null;
}

export function getGroupsByMember(userId: string): Group[] {
  return [...GROUPS.values()].filter((g) =>
    g.members.some((m) => m.userId === userId && m.active)
  );
}

export function addMember(groupId: string, params: {
  userId: string;
  role: GroupRole;
  displayName?: string;
}): Group | null {
  const group = GROUPS.get(groupId);
  if (!group) return null;

  if (group.members.some((m) => m.userId === params.userId)) return group;

  const existingMemberCount = group.members.filter((m) => m.active).length;
  const equalShare = existingMemberCount > 0
    ? Math.floor(100 / (existingMemberCount + 1))
    : 100;

  group.members.push({
    userId:      params.userId,
    role:        params.role,
    joinedAt:    new Date().toISOString(),
    active:      true,
    displayName: params.displayName,
    splits:      [{ memberId: params.userId, percentage: equalShare, splitType: 'equal' }],
  });

  // Rebalance equal splits if defaultSplit is 'equal'
  if (group.defaultSplit === 'equal') {
    rebalanceEqualSplits(group);
  }

  GROUPS.set(groupId, group);
  return group;
}

export function removeMember(groupId: string, userId: string): Group | null {
  const group = GROUPS.get(groupId);
  if (!group) return null;

  const member = group.members.find((m) => m.userId === userId);
  if (member) member.active = false;

  if (group.defaultSplit === 'equal') rebalanceEqualSplits(group);

  GROUPS.set(groupId, group);
  return group;
}

export function updateSplits(groupId: string, splits: SplitOwnership[]): Group | null {
  const group = GROUPS.get(groupId);
  if (!group) return null;

  const total = splits.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(total - 100) > 0.01) return null; // splits must sum to 100

  group.members.forEach((m) => {
    const newSplit = splits.find((s) => s.memberId === m.userId);
    if (newSplit) m.splits = [newSplit];
  });
  group.defaultSplit = 'custom';

  GROUPS.set(groupId, group);
  return group;
}

export function addGroupAsset(groupId: string, asset: Omit<GroupAsset, 'ownedBy'>): Group | null {
  const group = GROUPS.get(groupId);
  if (!group) return null;
  group.assets.push({ ...asset, ownedBy: groupId });
  GROUPS.set(groupId, group);
  return group;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface GroupPayoutProjection {
  groupId:    string;
  totalPool:  number;
  currency:   string;
  payouts:    Array<{ userId: string; amount: number; percentage: number }>;
}

export function projectPayouts(groupId: string, totalPool: number, currency = 'usd'): GroupPayoutProjection | null {
  const group = GROUPS.get(groupId);
  if (!group) return null;

  const activeMembers = group.members.filter((m) => m.active);
  const payouts = activeMembers.map((m) => {
    const split = m.splits[0]?.percentage ?? 0;
    return {
      userId:     m.userId,
      amount:     Math.round((totalPool * split) / 100),
      percentage: split,
    };
  });

  return { groupId, totalPool, currency, payouts };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rebalanceEqualSplits(group: Group): void {
  const activeMembers = group.members.filter((m) => m.active);
  const count         = activeMembers.length;
  if (count === 0) return;
  const share = Math.floor(100 / count);
  const remainder = 100 - share * count;
  activeMembers.forEach((m, i) => {
    m.splits = [{ memberId: m.userId, percentage: share + (i === 0 ? remainder : 0), splitType: 'equal' }];
  });
}

export function isGroupAdmin(group: Group, userId: string): boolean {
  const member = group.members.find((m) => m.userId === userId && m.active);
  return member?.role === 'founder' || member?.role === 'admin';
}

export function canManageGroup(group: Group, userId: string): boolean {
  return isGroupAdmin(group, userId);
}

export function getGroupTypeLabel(type: GroupType): string {
  const labels: Record<GroupType, string> = {
    'rap-group':           'Rap Group',
    'band':                'Band',
    'producer-collective': 'Producer Collective',
    'dj-crew':             'DJ Crew',
    'label':               'Label',
    'venue-team':          'Venue Team',
    'sponsor-team':        'Sponsor Team',
    'collective':          'Collective',
  };
  return labels[type] ?? type;
}
