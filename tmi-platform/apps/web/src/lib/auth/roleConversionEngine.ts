/**
 * Role Correction & Profile Migration Runtime — Rule 26 compliant.
 * One human → one canonical TMI account → roles and profiles change safely.
 *
 * Design: additive only. Old role resources are never deleted. New role
 * resources are provisioned via the same provisionRoleResources path used
 * at signup, so every step is idempotent (upserts). Tier and entitlements
 * are independent of role; switching role never strips or grants tier.
 */

import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  provisionRoleResources,
  type ProvisionAccountType,
  type ProvisionStep,
} from "./provisionRoleResources";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConversionStatus = "OK" | "PARTIAL" | "ERROR";

export interface RoleConversionRequest {
  userId: string;
  targetRole: ProvisionAccountType;
  /** Canonical tier override. If omitted, existing tier is preserved. */
  targetTier?: string;
  /** userId of the admin performing this change — required for audit log. */
  actorId: string;
  reason?: string;
}

export interface SensitiveResourceSummary {
  activeBookings: number;
  activeCompetitions: number;
  isCurrentlyLive: boolean;
  pendingPayoutsCents: number;
}

export interface RoleConversionResult {
  ok: boolean;
  status: ConversionStatus;
  userId: string;
  previousRole: Role;
  newRole: Role;
  previousTier: string;
  newTier: string;
  sensitiveResources: SensitiveResourceSummary;
  migrationSteps: ProvisionStep[];
  auditLogId?: string;
  error?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PROVISION_TO_PRISMA: Record<ProvisionAccountType, Role> = {
  FAN: "FAN",
  PERFORMER: "PERFORMER",
  BAND: "BAND",
  VENUE: "VENUE",
  PROMOTER: "PROMOTER",
  SPONSOR: "SPONSOR",
  ADVERTISER: "ADVERTISER",
};

const VALID_TIERS = new Set([
  "FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND",
]);

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Convert a user's primary role and optionally assign a new membership tier.
 * Preserves all existing account data: wallet, messages, followers, history,
 * Memory Wall, purchases, fan-side resources if previously provisioned.
 */
export async function convertUserRole(
  req: RoleConversionRequest,
): Promise<RoleConversionResult> {
  const { userId, targetRole, targetTier, actorId, reason } = req;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      tier: true,
      displayName: true,
      name: true,
      email: true,
      isLive: true,
    },
  });

  if (!user) return makeErrorResult(userId, "user_not_found");

  const previousRole = user.role;
  const previousTier = user.tier;
  const newPrismaRole = PROVISION_TO_PRISMA[targetRole];
  const newTier = targetTier && VALID_TIERS.has(targetTier) ? targetTier : previousTier;

  // Snapshot sensitive resources for transparency — non-blocking, never prevents conversion.
  const sensitiveResources = await snapshotSensitiveResources(userId, user.isLive);

  // 1. Update primary role + active role + tier atomically.
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newPrismaRole,
      activeRole: newPrismaRole,
      tier: newTier,
      onboardingState: "INCOMPLETE",
    },
  });

  // 2. Register new role in UserRole (additive — existing roles stay).
  await prisma.userRole.upsert({
    where: { userId_role: { userId, role: newPrismaRole } },
    create: { userId, role: newPrismaRole },
    update: {},
  });

  // 3. Provision new-role resources (all upserts — idempotent, no data loss).
  const provisionResult = await provisionRoleResources(userId, targetRole);

  // 4. Write audit trail.
  let auditLogId: string | undefined;
  try {
    const log = await prisma.auditLog.create({
      data: {
        action: "USER_ROLE_CHANGED",
        actorId,
        targetId: userId,
        details: ({
          previousRole,
          newRole: newPrismaRole,
          previousTier,
          newTier,
          reason: reason ?? "admin_role_correction",
          sensitiveResources,
          provisionOk: provisionResult.ok,
        }) as any,
      },
    });
    auditLogId = log.id;

    if (newTier !== previousTier) {
      await prisma.auditLog.create({
        data: {
          action: "ADMIN_GRANT_TIER",
          actorId,
          targetId: userId,
          details: ({ previousTier, newTier, reason: reason ?? "admin_entitlement_assignment" }) as any,
        },
      });
    }
  } catch {
    // Audit failure is non-blocking — the conversion has already committed.
  }

  const hasHardErrors = provisionResult.steps.some((s) => s.status === "ERROR");
  const status: ConversionStatus = !provisionResult.ok || hasHardErrors ? "PARTIAL" : "OK";

  return {
    ok: provisionResult.ok,
    status,
    userId,
    previousRole,
    newRole: newPrismaRole,
    previousTier,
    newTier,
    sensitiveResources,
    migrationSteps: provisionResult.steps,
    auditLogId,
  };
}

/**
 * Resolve a userId from an email address. Used by admin UI when searching by email.
 */
export async function resolveUserIdFromEmail(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Preview a user's current state before conversion — no writes.
 */
export async function previewUserForConversion(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      name: true,
      role: true,
      tier: true,
      isLive: true,
      onboardingState: true,
      userRoles: { select: { role: true } },
    },
  });
  if (!user) return null;

  const sensitive = await snapshotSensitiveResources(userId, user.isLive);

  return {
    userId: user.id,
    email: user.email,
    displayName: user.displayName ?? user.name,
    currentRole: user.role,
    currentTier: user.tier,
    onboardingState: user.onboardingState,
    allRoles: user.userRoles.map((r) => r.role),
    sensitiveResources: sensitive,
  };
}

// ── Internal ──────────────────────────────────────────────────────────────────

async function snapshotSensitiveResources(
  userId: string,
  isLive: boolean,
): Promise<SensitiveResourceSummary> {
  const [activeBookings, activeCompetitions, wallet] = await Promise.all([
    prisma.bookingOffer
      .count({ where: { artistUserId: userId, status: "ACCEPTED" } })
      .catch(() => 0),
    prisma.showSubmission
      .count({ where: { userId, status: "ACCEPTED" } })
      .catch(() => 0),
    prisma.wallet
      .findUnique({ where: { userId }, select: { pendingBalance: true } })
      .catch(() => null),
  ]);

  return {
    activeBookings,
    activeCompetitions,
    isCurrentlyLive: isLive,
    pendingPayoutsCents: wallet?.pendingBalance ?? 0,
  };
}

function makeErrorResult(userId: string, error: string): RoleConversionResult {
  return {
    ok: false,
    status: "ERROR",
    userId,
    previousRole: "USER",
    newRole: "USER",
    previousTier: "FREE",
    newTier: "FREE",
    sensitiveResources: {
      activeBookings: 0,
      activeCompetitions: 0,
      isCurrentlyLive: false,
      pendingPayoutsCents: 0,
    },
    migrationSteps: [{ step: "user_lookup", status: "ERROR", error }],
    error,
  };
}
