/**
 * ContributorCreditEngine.ts
 *
 * TMI Contributor Credit Runtime
 *
 * Tracks who contributed what to every asset (release, beat, visual, event, NFT, game session).
 * Credits feed into: reputation scores, collaboration history, split eligibility, royalty routing.
 *
 * Credit roles:
 *   primary artist · featured artist · producer · beat producer
 *   songwriter · engineer · mastering engineer · visual designer
 *   director · venue partner · sponsor · label rep · group affiliation
 *
 * Rules:
 *   - Every asset has at least one primary credit (createdBy)
 *   - Credits are append-only (revoked = false, not deleted)
 *   - Collaboration history is indexed by userId for profile/reputation lookups
 *   - Credit weight is used by the reputation engine (not payouts — use RoyaltySplitEngine for that)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreditRole =
  | 'primary-artist'
  | 'featured-artist'
  | 'producer'
  | 'beat-producer'
  | 'songwriter'
  | 'engineer'
  | 'mastering-engineer'
  | 'visual-designer'
  | 'director'
  | 'choreographer'
  | 'venue-partner'
  | 'sponsor'
  | 'label-rep'
  | 'group-affiliation'
  | 'collaborator';

export type AssetCategory =
  | 'release'       // song / album / EP
  | 'beat'          // standalone beat
  | 'visual'        // cover art / video / design
  | 'event'         // live performance / show / cypher
  | 'nft'           // collectible / token
  | 'game-session'  // battle / cypher / weekly game
  | 'campaign';     // sponsor / ad campaign

export interface ContributorCredit {
  creditId:    string;
  assetId:     string;
  assetCategory: AssetCategory;
  userId:      string;
  displayName: string;
  role:        CreditRole;
  creditWeight: number;         // 0–100; primary=100, featured≈60, producer≈80, engineer≈40 etc.
  groupId?:    string;          // if credited as part of a group
  customLabel?: string;         // e.g. "Additional Vocals", "Drum Programming"
  addedAt:     string;
  revoked:     boolean;
  revokedAt?:  string;
}

export interface AssetCreditSheet {
  assetId:      string;
  assetCategory: AssetCategory;
  assetTitle:   string;
  credits:      ContributorCredit[];
  createdBy:    string;          // userId of the person who registered the asset
  createdAt:    string;
}

export interface CollaborationSummary {
  userId:          string;
  totalCredits:    number;
  creditsByRole:   Record<CreditRole, number>;
  collaboratorIds: string[];                // other userIds worked with
  assetIds:        string[];
  reputationScore: number;                  // derived from creditWeight × recency
}

// ── Default credit weights by role ───────────────────────────────────────────

const DEFAULT_WEIGHTS: Record<CreditRole, number> = {
  'primary-artist':     100,
  'producer':           85,
  'beat-producer':      85,
  'featured-artist':    65,
  'songwriter':         75,
  'engineer':           45,
  'mastering-engineer': 35,
  'visual-designer':    50,
  'director':           60,
  'choreographer':      40,
  'venue-partner':      30,
  'sponsor':            25,
  'label-rep':          20,
  'group-affiliation':  55,
  'collaborator':       50,
};

// ── Human-readable labels ─────────────────────────────────────────────────────

export const CREDIT_ROLE_LABELS: Record<CreditRole, string> = {
  'primary-artist':     'Primary Artist',
  'featured-artist':    'Feat.',
  'producer':           'Produced by',
  'beat-producer':      'Beat by',
  'songwriter':         'Written by',
  'engineer':           'Mixed by',
  'mastering-engineer': 'Mastered by',
  'visual-designer':    'Art by',
  'director':           'Directed by',
  'choreographer':      'Choreography by',
  'venue-partner':      'Venue Partner',
  'sponsor':            'Sponsored by',
  'label-rep':          'Label',
  'group-affiliation':  'Group',
  'collaborator':       'Collab',
};

// ── In-Memory Stores ──────────────────────────────────────────────────────────

const CREDIT_SHEETS = new Map<string, AssetCreditSheet>();
const USER_CREDIT_INDEX = new Map<string, string[]>(); // userId → assetId[]

// ── Core CRUD ─────────────────────────────────────────────────────────────────

export function registerAsset(params: {
  assetId:      string;
  assetCategory: AssetCategory;
  assetTitle:   string;
  createdBy:    string;
  createdByName: string;
  initialRole?: CreditRole;
}): AssetCreditSheet {
  if (CREDIT_SHEETS.has(params.assetId)) {
    return CREDIT_SHEETS.get(params.assetId)!;
  }

  const role = params.initialRole ?? 'primary-artist';
  const sheet: AssetCreditSheet = {
    assetId:       params.assetId,
    assetCategory: params.assetCategory,
    assetTitle:    params.assetTitle,
    createdBy:     params.createdBy,
    createdAt:     new Date().toISOString(),
    credits: [{
      creditId:      `cred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      assetId:       params.assetId,
      assetCategory: params.assetCategory,
      userId:        params.createdBy,
      displayName:   params.createdByName,
      role,
      creditWeight:  DEFAULT_WEIGHTS[role],
      addedAt:       new Date().toISOString(),
      revoked:       false,
    }],
  };

  CREDIT_SHEETS.set(params.assetId, sheet);
  _indexUser(params.createdBy, params.assetId);
  return sheet;
}

export function addCredit(assetId: string, params: {
  userId:       string;
  displayName:  string;
  role:         CreditRole;
  groupId?:     string;
  customLabel?: string;
  weightOverride?: number;
}): AssetCreditSheet | null {
  const sheet = CREDIT_SHEETS.get(assetId);
  if (!sheet) return null;

  // Deduplicate: same user + same role = no-op (return existing)
  const exists = sheet.credits.find(
    (c) => c.userId === params.userId && c.role === params.role && !c.revoked
  );
  if (exists) return sheet;

  const credit: ContributorCredit = {
    creditId:      `cred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    assetId,
    assetCategory: sheet.assetCategory,
    userId:        params.userId,
    displayName:   params.displayName,
    role:          params.role,
    creditWeight:  params.weightOverride ?? DEFAULT_WEIGHTS[params.role],
    groupId:       params.groupId,
    customLabel:   params.customLabel,
    addedAt:       new Date().toISOString(),
    revoked:       false,
  };

  sheet.credits.push(credit);
  CREDIT_SHEETS.set(assetId, sheet);
  _indexUser(params.userId, assetId);
  return sheet;
}

export function revokeCredit(assetId: string, creditId: string): AssetCreditSheet | null {
  const sheet = CREDIT_SHEETS.get(assetId);
  if (!sheet) return null;

  const credit = sheet.credits.find((c) => c.creditId === creditId);
  if (credit && !credit.revoked) {
    credit.revoked   = true;
    credit.revokedAt = new Date().toISOString();
  }

  CREDIT_SHEETS.set(assetId, sheet);
  return sheet;
}

export function getCreditSheet(assetId: string): AssetCreditSheet | null {
  return CREDIT_SHEETS.get(assetId) ?? null;
}

export function getActiveCredits(assetId: string): ContributorCredit[] {
  return (CREDIT_SHEETS.get(assetId)?.credits ?? []).filter((c) => !c.revoked);
}

// ── User-level credit history ─────────────────────────────────────────────────

export function getUserCredits(userId: string): ContributorCredit[] {
  const assetIds = USER_CREDIT_INDEX.get(userId) ?? [];
  const result: ContributorCredit[] = [];
  for (const assetId of assetIds) {
    const sheet = CREDIT_SHEETS.get(assetId);
    if (!sheet) continue;
    const mine = sheet.credits.filter((c) => c.userId === userId && !c.revoked);
    result.push(...mine);
  }
  return result;
}

export function getCollaborationSummary(userId: string): CollaborationSummary {
  const credits = getUserCredits(userId);

  const creditsByRole = {} as Record<CreditRole, number>;
  const collaboratorSet = new Set<string>();
  const assetSet = new Set<string>();
  let reputationScore = 0;

  for (const credit of credits) {
    creditsByRole[credit.role] = (creditsByRole[credit.role] ?? 0) + 1;
    assetSet.add(credit.assetId);

    // Other contributors on the same asset count as collaborators
    const sheet = CREDIT_SHEETS.get(credit.assetId);
    if (sheet) {
      for (const c of sheet.credits) {
        if (c.userId !== userId && !c.revoked) collaboratorSet.add(c.userId);
      }
    }

    // Recency decay: credits in last 90 days = full weight, older = 50%
    const daysOld = (Date.now() - new Date(credit.addedAt).getTime()) / 86_400_000;
    const recencyMultiplier = daysOld <= 90 ? 1 : 0.5;
    reputationScore += credit.creditWeight * recencyMultiplier;
  }

  return {
    userId,
    totalCredits:    credits.length,
    creditsByRole,
    collaboratorIds: [...collaboratorSet],
    assetIds:        [...assetSet],
    reputationScore: Math.round(reputationScore),
  };
}

// ── Formatted display helpers ─────────────────────────────────────────────────

export interface CreditLine {
  label:   string;   // "Produced by", "Feat.", etc.
  names:   string;   // "Jay Paul Sanchez, Bernt Music"
  role:    CreditRole;
}

export function formatCreditLines(assetId: string): CreditLine[] {
  const credits = getActiveCredits(assetId);
  const grouped = new Map<CreditRole, string[]>();

  const order: CreditRole[] = [
    'primary-artist', 'featured-artist', 'producer', 'beat-producer',
    'songwriter', 'engineer', 'mastering-engineer', 'visual-designer',
    'director', 'choreographer', 'group-affiliation',
    'venue-partner', 'sponsor', 'label-rep', 'collaborator',
  ];

  for (const credit of credits) {
    const name = credit.customLabel
      ? `${credit.displayName} (${credit.customLabel})`
      : credit.displayName;
    if (!grouped.has(credit.role)) grouped.set(credit.role, []);
    grouped.get(credit.role)!.push(name);
  }

  const lines: CreditLine[] = [];
  for (const role of order) {
    const names = grouped.get(role);
    if (names && names.length > 0) {
      lines.push({
        label: CREDIT_ROLE_LABELS[role],
        names: names.join(', '),
        role,
      });
    }
  }
  return lines;
}

// ── Collaboration graph (for reputation engine) ───────────────────────────────

export interface CollaborationEdge {
  userA: string;
  userB: string;
  sharedAssets: string[];
  strength: number; // count of shared assets
}

export function getCollaborationEdges(userId: string): CollaborationEdge[] {
  const assetIds = USER_CREDIT_INDEX.get(userId) ?? [];
  const edgeMap  = new Map<string, CollaborationEdge>();

  for (const assetId of assetIds) {
    const sheet = CREDIT_SHEETS.get(assetId);
    if (!sheet) continue;
    for (const credit of sheet.credits) {
      if (credit.userId === userId || credit.revoked) continue;
      const key = [userId, credit.userId].sort().join('::');
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { userA: userId, userB: credit.userId, sharedAssets: [], strength: 0 });
      }
      const edge = edgeMap.get(key)!;
      if (!edge.sharedAssets.includes(assetId)) {
        edge.sharedAssets.push(assetId);
        edge.strength += 1;
      }
    }
  }

  return [...edgeMap.values()].sort((a, b) => b.strength - a.strength);
}

// ── Bulk helpers for seed/import ──────────────────────────────────────────────

export function bulkRegisterCredits(entries: Array<{
  assetId:       string;
  assetCategory: AssetCategory;
  assetTitle:    string;
  credits: Array<{
    userId:       string;
    displayName:  string;
    role:         CreditRole;
    groupId?:     string;
    customLabel?: string;
  }>;
}>): void {
  for (const entry of entries) {
    const [primary, ...rest] = entry.credits;
    if (!primary) continue;

    registerAsset({
      assetId:       entry.assetId,
      assetCategory: entry.assetCategory,
      assetTitle:    entry.assetTitle,
      createdBy:     primary.userId,
      createdByName: primary.displayName,
      initialRole:   primary.role,
    });

    for (const c of rest) {
      addCredit(entry.assetId, c);
    }
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _indexUser(userId: string, assetId: string): void {
  if (!USER_CREDIT_INDEX.has(userId)) USER_CREDIT_INDEX.set(userId, []);
  const list = USER_CREDIT_INDEX.get(userId)!;
  if (!list.includes(assetId)) list.push(assetId);
}
