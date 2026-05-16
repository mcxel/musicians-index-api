/**
 * FamilyTreeEngine
 * Manages the family graph for teen accounts: add/remove members, verify chain, guardian links.
 */

export type FamilyRelationship = "parent" | "guardian" | "sibling" | "grandparent" | "trusted-adult";
export type MemberVerificationStatus = "pending" | "verified" | "rejected" | "revoked";

export interface FamilyMember {
  userId: string;
  displayName: string;
  email: string;
  relationship: FamilyRelationship;
  verificationStatus: MemberVerificationStatus;
  addedAt: number;
  verifiedAt?: number;
  canApproveActivity: boolean;
  canViewActivity: boolean;
  receivesAlerts: boolean;
}

export interface FamilyTree {
  teenUserId: string;
  members: Map<string, FamilyMember>;
  primaryGuardianId: string | null;
  lastVerifiedAt: number;
}

export interface FamilyInvite {
  id: string;
  teenUserId: string;
  invitedEmail: string;
  relationship: FamilyRelationship;
  sentAt: number;
  expiresAt: number;
  accepted: boolean;
  token: string;
}

export interface FamilyTreeResult {
  success: boolean;
  error?: string;
}

export class FamilyTreeEngine {
  private static _instance: FamilyTreeEngine | null = null;

  private _trees: Map<string, FamilyTree> = new Map();
  private _invites: Map<string, FamilyInvite> = new Map();
  private _listeners: Set<(teenUserId: string, tree: FamilyTree) => void> = new Set();

  static getInstance(): FamilyTreeEngine {
    if (!FamilyTreeEngine._instance) {
      FamilyTreeEngine._instance = new FamilyTreeEngine();
    }
    return FamilyTreeEngine._instance;
  }

  // ── Tree initialization ────────────────────────────────────────────────────

  initTree(teenUserId: string): FamilyTree {
    if (this._trees.has(teenUserId)) return this._trees.get(teenUserId)!;
    const tree: FamilyTree = {
      teenUserId,
      members: new Map(),
      primaryGuardianId: null,
      lastVerifiedAt: Date.now(),
    };
    this._trees.set(teenUserId, tree);
    return tree;
  }

  getTree(teenUserId: string): FamilyTree | null {
    return this._trees.get(teenUserId) ?? null;
  }

  // ── Invite flow ────────────────────────────────────────────────────────────

  sendInvite(teenUserId: string, email: string, relationship: FamilyRelationship): FamilyInvite {
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const invite: FamilyInvite = {
      id: Math.random().toString(36).slice(2),
      teenUserId,
      invitedEmail: email,
      relationship,
      sentAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      accepted: false,
      token,
    };
    this._invites.set(invite.id, invite);
    return invite;
  }

  acceptInvite(token: string, guardianUserId: string, displayName: string): FamilyTreeResult {
    const invite = [...this._invites.values()].find((i) => i.token === token);
    if (!invite) return { success: false, error: "invite not found" };
    if (Date.now() > invite.expiresAt) return { success: false, error: "invite has expired" };
    if (invite.accepted) return { success: false, error: "invite already accepted" };

    invite.accepted = true;

    const tree = this.initTree(invite.teenUserId);
    const member: FamilyMember = {
      userId: guardianUserId,
      displayName,
      email: invite.invitedEmail,
      relationship: invite.relationship,
      verificationStatus: "verified",
      addedAt: Date.now(),
      verifiedAt: Date.now(),
      canApproveActivity: ["parent", "guardian"].includes(invite.relationship),
      canViewActivity: true,
      receivesAlerts: true,
    };

    tree.members.set(guardianUserId, member);
    if (!tree.primaryGuardianId && ["parent", "guardian"].includes(invite.relationship)) {
      tree.primaryGuardianId = guardianUserId;
    }
    tree.lastVerifiedAt = Date.now();
    this._emit(invite.teenUserId, tree);
    return { success: true };
  }

  // ── Member management ──────────────────────────────────────────────────────

  addMember(
    teenUserId: string,
    member: Omit<FamilyMember, "addedAt" | "verificationStatus">,
  ): FamilyTreeResult {
    const tree = this._trees.get(teenUserId);
    if (!tree) return { success: false, error: "family tree not initialized" };

    tree.members.set(member.userId, {
      ...member,
      addedAt: Date.now(),
      verificationStatus: "pending",
    });

    this._emit(teenUserId, tree);
    return { success: true };
  }

  removeMember(teenUserId: string, memberUserId: string): FamilyTreeResult {
    const tree = this._trees.get(teenUserId);
    if (!tree) return { success: false, error: "family tree not found" };
    if (!tree.members.has(memberUserId)) return { success: false, error: "member not in tree" };

    tree.members.delete(memberUserId);
    if (tree.primaryGuardianId === memberUserId) {
      const firstParent = [...tree.members.values()].find((m) =>
        ["parent", "guardian"].includes(m.relationship) && m.verificationStatus === "verified"
      );
      tree.primaryGuardianId = firstParent?.userId ?? null;
    }
    this._emit(teenUserId, tree);
    return { success: true };
  }

  verifyMember(teenUserId: string, memberUserId: string): FamilyTreeResult {
    const tree = this._trees.get(teenUserId);
    const member = tree?.members.get(memberUserId);
    if (!member) return { success: false, error: "member not found" };
    member.verificationStatus = "verified";
    member.verifiedAt = Date.now();
    tree!.lastVerifiedAt = Date.now();
    this._emit(teenUserId, tree!);
    return { success: true };
  }

  setPrimaryGuardian(teenUserId: string, guardianId: string): FamilyTreeResult {
    const tree = this._trees.get(teenUserId);
    if (!tree) return { success: false, error: "tree not found" };
    const member = tree.members.get(guardianId);
    if (!member || member.verificationStatus !== "verified") return { success: false, error: "guardian is not verified" };
    if (!["parent", "guardian"].includes(member.relationship)) return { success: false, error: "member is not a parent or guardian" };
    tree.primaryGuardianId = guardianId;
    this._emit(teenUserId, tree);
    return { success: true };
  }

  // ── Access checks ──────────────────────────────────────────────────────────

  hasVerifiedGuardian(teenUserId: string): boolean {
    const tree = this._trees.get(teenUserId);
    if (!tree) return false;
    return [...tree.members.values()].some(
      (m) => ["parent", "guardian"].includes(m.relationship) && m.verificationStatus === "verified"
    );
  }

  canApproveActivity(teenUserId: string, guardianId: string): boolean {
    const tree = this._trees.get(teenUserId);
    const member = tree?.members.get(guardianId);
    return member?.canApproveActivity === true && member.verificationStatus === "verified";
  }

  getGuardians(teenUserId: string): FamilyMember[] {
    const tree = this._trees.get(teenUserId);
    if (!tree) return [];
    return [...tree.members.values()].filter((m) =>
      ["parent", "guardian"].includes(m.relationship) && m.verificationStatus === "verified"
    );
  }

  getMembers(teenUserId: string): FamilyMember[] {
    return [...(this._trees.get(teenUserId)?.members.values() ?? [])];
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onTreeChange(cb: (teenUserId: string, tree: FamilyTree) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(teenUserId: string, tree: FamilyTree): void {
    for (const cb of this._listeners) cb(teenUserId, tree);
  }
}

export const familyTreeEngine = FamilyTreeEngine.getInstance();
