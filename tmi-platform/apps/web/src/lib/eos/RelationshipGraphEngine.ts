/**
 * EOS Layer 6 — RelationshipGraphEngine (pure in-memory).
 *
 * addEdge / removeEdge / getFollowers / getFollowing / getBandMembers / isBlocked.
 * Starts empty — no seed users, no fake friends (Rule 20).
 * Optional enforceRoles consults RelationshipRegistry (Rule 26).
 *
 * Does not persist to Prisma; product Follow/Friendship routes remain authoritative
 * until a future bridge is wired.
 */

import type {
  RelationshipEdge,
  RelationshipEdgeStatus,
  RelationshipEntityRef,
  RelationshipKind,
} from "@/core/eos/relationshipContracts";
import { isRelationshipAllowed } from "@/registries/eos/RelationshipRegistry";

export interface AddEdgeInput {
  kind: RelationshipKind;
  from: RelationshipEntityRef;
  to: RelationshipEntityRef;
  status?: RelationshipEdgeStatus;
  meta?: Record<string, unknown>;
  id?: string;
  createdAtMs?: number;
}

export interface RelationshipGraphOptions {
  /** When true (default), reject edges outside RelationshipRegistry role matrix */
  enforceRoles?: boolean;
}

function newEdgeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isActive(edge: RelationshipEdge): boolean {
  return edge.status === "ACTIVE";
}

export class RelationshipGraphEngine {
  private readonly edges = new Map<string, RelationshipEdge>();
  private readonly enforceRoles: boolean;

  constructor(options: RelationshipGraphOptions = {}) {
    this.enforceRoles = options.enforceRoles !== false;
  }

  /** Snapshot of all edges (including PENDING / REVOKED). */
  getAllEdges(): readonly RelationshipEdge[] {
    return [...this.edges.values()];
  }

  get size(): number {
    return this.edges.size;
  }

  clear(): void {
    this.edges.clear();
  }

  addEdge(input: AddEdgeInput): RelationshipEdge {
    if (!input.from.userId.trim() || !input.to.userId.trim()) {
      throw new Error("RelationshipGraphEngine: userId required on both ends");
    }
    if (input.from.userId === input.to.userId) {
      throw new Error("RelationshipGraphEngine: self-edges are not allowed");
    }
    if (
      this.enforceRoles &&
      !isRelationshipAllowed(input.kind, input.from.role, input.to.role)
    ) {
      throw new Error(
        `RelationshipGraphEngine: ${input.kind} not allowed from ${input.from.role} to ${input.to.role}`,
      );
    }

    const now = input.createdAtMs ?? Date.now();
    const edge: RelationshipEdge = {
      id: input.id ?? newEdgeId(),
      kind: input.kind,
      from: { ...input.from },
      to: { ...input.to },
      status: input.status ?? "ACTIVE",
      createdAtMs: now,
      updatedAtMs: now,
      meta: input.meta,
    };
    this.edges.set(edge.id, edge);
    return edge;
  }

  removeEdge(edgeId: string): boolean {
    return this.edges.delete(edgeId);
  }

  /** Soft-remove: mark REVOKED instead of deleting (audit-friendly). */
  revokeEdge(edgeId: string): RelationshipEdge | null {
    const edge = this.edges.get(edgeId);
    if (!edge) return null;
    const next: RelationshipEdge = {
      ...edge,
      status: "REVOKED",
      updatedAtMs: Date.now(),
    };
    this.edges.set(edgeId, next);
    return next;
  }

  getEdgesByKind(kind: RelationshipKind): RelationshipEdge[] {
    return [...this.edges.values()].filter((e) => e.kind === kind && isActive(e));
  }

  /** Users who FOLLOW `userId` (ACTIVE FOLLOW edges where to = userId). */
  getFollowers(userId: string): RelationshipEntityRef[] {
    return [...this.edges.values()]
      .filter(
        (e) =>
          e.kind === "FOLLOW" &&
          isActive(e) &&
          e.to.userId === userId &&
          !this.isBlocked(userId, e.from.userId),
      )
      .map((e) => e.from);
  }

  /** Users that `userId` FOLLOWs (ACTIVE FOLLOW edges where from = userId). */
  getFollowing(userId: string): RelationshipEntityRef[] {
    return [...this.edges.values()]
      .filter(
        (e) =>
          e.kind === "FOLLOW" &&
          isActive(e) &&
          e.from.userId === userId &&
          !this.isBlocked(userId, e.to.userId),
      )
      .map((e) => e.to);
  }

  /** ACTIVE BAND_MEMBER edges where to = bandUserId. */
  getBandMembers(bandUserId: string): RelationshipEntityRef[] {
    return [...this.edges.values()]
      .filter(
        (e) =>
          e.kind === "BAND_MEMBER" &&
          isActive(e) &&
          e.to.userId === bandUserId,
      )
      .map((e) => e.from);
  }

  /**
   * True if either direction has an ACTIVE BLOCK between a and b.
   * Empty graph → false (honest: nobody blocked).
   */
  isBlocked(aUserId: string, bUserId: string): boolean {
    for (const e of this.edges.values()) {
      if (e.kind !== "BLOCK" || !isActive(e)) continue;
      if (
        (e.from.userId === aUserId && e.to.userId === bUserId) ||
        (e.from.userId === bUserId && e.to.userId === aUserId)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * ACTIVE FRIEND edges involving userId (either end).
   * Does not invent friends — empty when none.
   */
  getFriends(userId: string): RelationshipEntityRef[] {
    const out: RelationshipEntityRef[] = [];
    const seen = new Set<string>();
    for (const e of this.edges.values()) {
      if (e.kind !== "FRIEND" || !isActive(e)) continue;
      if (this.isBlocked(e.from.userId, e.to.userId)) continue;
      let other: RelationshipEntityRef | null = null;
      if (e.from.userId === userId) other = e.to;
      else if (e.to.userId === userId) other = e.from;
      if (other && !seen.has(other.userId)) {
        seen.add(other.userId);
        out.push(other);
      }
    }
    return out;
  }

  /** True when an ACTIVE FRIEND edge links the two users. */
  areFriends(aUserId: string, bUserId: string): boolean {
    if (this.isBlocked(aUserId, bUserId)) return false;
    for (const e of this.edges.values()) {
      if (e.kind !== "FRIEND" || !isActive(e)) continue;
      if (
        (e.from.userId === aUserId && e.to.userId === bUserId) ||
        (e.from.userId === bUserId && e.to.userId === aUserId)
      ) {
        return true;
      }
    }
    return false;
  }
}

/** Shared empty graph for EOS scaffolding — callers may also `new RelationshipGraphEngine()`. */
export const RelationshipGraph = new RelationshipGraphEngine();
