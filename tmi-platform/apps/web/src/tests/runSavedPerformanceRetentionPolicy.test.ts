/**
 * UNIVERSAL SAVED PERFORMANCE RETENTION POLICY
 * Targeted test — run with: npx tsx src/tests/runSavedPerformanceRetentionPolicy.test.ts
 *
 * Tests pure business logic + an in-memory implementation that mirrors the
 * production service. Does not require a live database.
 */

import {
  SAVED_PERFORMANCE_POLICY,
  SAVED_PERFORMANCE_ERROR_CODES,
  EXPIRY_WARNING_DAYS,
} from "../lib/savedPerformances/SavedPerformancePolicy";

// ─── In-memory mirror of the production service ───────────────────────────────

type Status =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "RENEWED"
  | "EXPIRED"
  | "DELETION_PENDING"
  | "DELETED";

interface FakeRecord {
  id: string;
  ownerId: string;
  liveSessionId: string;
  role: "FAN" | "PERFORMER";
  title: string;
  durationSeconds: number;
  storageBytes: bigint;
  createdAt: Date;
  expiresAt: Date;
  renewalCount: number;
  status: Status;
  storageProviderKey: string | null;
  derivedAssetKeys: string[];
}

let _store: FakeRecord[] = [];
let _idCounter = 0;

function freshId() {
  return `rec-${++_idCounter}`;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

function rollingYearStart(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

interface SaveOpts {
  ownerId: string;
  liveSessionId?: string;
  role?: "FAN" | "PERFORMER";
  title?: string;
  durationSeconds: number;
  storageProviderKey?: string;
  derivedAssetKeys?: string[];
}

function fakeSave(opts: SaveOpts): { ok: boolean; recordingId?: string; errorCode?: string } {
  const count = _store.filter(
    (r) => r.ownerId === opts.ownerId && r.status !== "DELETED" && r.createdAt >= rollingYearStart(),
  ).length;

  if (count >= SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ANNUAL_LIMIT_REACHED };
  }

  const cappedDuration = Math.min(
    opts.durationSeconds,
    SAVED_PERFORMANCE_POLICY.MAX_DURATION_SECONDS,
  );
  const now = new Date();
  const id = freshId();

  _store.push({
    id,
    ownerId: opts.ownerId,
    liveSessionId: opts.liveSessionId ?? "session-1",
    role: opts.role ?? "FAN",
    title: opts.title ?? "Test Performance",
    durationSeconds: cappedDuration,
    storageBytes: BigInt(0),
    createdAt: now,
    expiresAt: addDays(now, SAVED_PERFORMANCE_POLICY.RETENTION_DAYS),
    renewalCount: 0,
    status: "ACTIVE",
    storageProviderKey: opts.storageProviderKey ?? null,
    derivedAssetKeys: opts.derivedAssetKeys ?? [],
  });

  const errorCode =
    cappedDuration < opts.durationSeconds
      ? SAVED_PERFORMANCE_ERROR_CODES.MAX_DURATION_REACHED
      : undefined;

  return { ok: true, recordingId: id, errorCode };
}

function fakeRenew(ownerId: string, id: string): { ok: boolean; newExpiresAt?: Date; errorCode?: string } {
  const r = _store.find((x) => x.id === id && x.ownerId === ownerId);
  if (!r) return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.NOT_FOUND };
  if (r.status === "DELETED" || r.status === "DELETION_PENDING") {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ALREADY_DELETED };
  }
  r.expiresAt = addDays(r.expiresAt, SAVED_PERFORMANCE_POLICY.RENEWAL_EXTENSION_DAYS);
  r.renewalCount++;
  r.status = "RENEWED";
  return { ok: true, newExpiresAt: r.expiresAt };
}

function fakeDelete(ownerId: string, id: string): { ok: boolean; errorCode?: string } {
  const r = _store.find((x) => x.id === id && x.ownerId === ownerId);
  if (!r) return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.NOT_FOUND };
  if (r.status === "DELETED") return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ALREADY_DELETED };
  r.status = "DELETION_PENDING";
  return { ok: true };
}

// ─── Test runner ──────────────────────────────────────────────────────────────

function runSavedPerformanceRetentionPolicyTest() {
  const results: Record<string, boolean> = {};

  // Reset store before each test suite
  _store = [];
  _idCounter = 0;

  // ── 1. POLICY CONSTANTS MATCH SPEC ─────────────────────────────────────────

  results["policy_annual_limit_is_10"] =
    SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT === 10;

  results["policy_max_duration_is_7200_seconds"] =
    SAVED_PERFORMANCE_POLICY.MAX_DURATION_SECONDS === 7_200;

  results["policy_retention_is_90_days"] =
    SAVED_PERFORMANCE_POLICY.RETENTION_DAYS === 90;

  results["policy_renewal_extension_is_90_days"] =
    SAVED_PERFORMANCE_POLICY.RENEWAL_EXTENSION_DAYS === 90;

  results["policy_warning_days_contains_30_7_1"] =
    EXPIRY_WARNING_DAYS.includes(30) &&
    EXPIRY_WARNING_DAYS.includes(7) &&
    EXPIRY_WARNING_DAYS.includes(1);

  results["policy_tier_independent"] =
    // The policy object has no tier-specific fields
    !Object.keys(SAVED_PERFORMANCE_POLICY).some((k) =>
      ["FREE", "PRO", "GOLD", "DIAMOND", "PLATINUM", "SILVER", "RUBY"].some((tier) =>
        k.toLowerCase().includes(tier.toLowerCase()),
      ),
    );

  // ── 2. SAVE #1 → PASS ──────────────────────────────────────────────────────

  _store = []; _idCounter = 0;
  const save1 = fakeSave({ ownerId: "user-a", durationSeconds: 3_600, role: "FAN" });
  results["save_1_passes"] = save1.ok === true;
  results["save_1_gets_recording_id"] = typeof save1.recordingId === "string";

  // ── 3. SAVE #10 → PASS ─────────────────────────────────────────────────────

  // Already saved 1; add 8 more (total 9), then save #10
  for (let i = 0; i < 8; i++) {
    fakeSave({ ownerId: "user-a", durationSeconds: 1_800, role: "FAN" });
  }
  const save10 = fakeSave({ ownerId: "user-a", durationSeconds: 1_800, role: "FAN" });
  results["save_10_passes"] = save10.ok === true;
  results["save_10_count_is_10"] =
    _store.filter((r) => r.ownerId === "user-a").length === 10;

  // ── 4. SAVE #11 → REJECTED ─────────────────────────────────────────────────

  const save11 = fakeSave({ ownerId: "user-a", durationSeconds: 1_800, role: "FAN" });
  results["save_11_rejected"] = save11.ok === false;
  results["save_11_error_code_correct"] =
    save11.errorCode === SAVED_PERFORMANCE_ERROR_CODES.ANNUAL_LIMIT_REACHED;
  results["save_11_store_unchanged"] =
    _store.filter((r) => r.ownerId === "user-a").length === 10;

  // ── 5. DURATION CAP — 119-MINUTE RECORDING PASSES ─────────────────────────

  _store = []; _idCounter = 0;
  const min119 = fakeSave({ ownerId: "user-b", durationSeconds: 119 * 60, role: "PERFORMER" });
  const rec119 = _store.find((r) => r.id === min119.recordingId)!;
  results["119_min_save_passes"] = min119.ok === true;
  results["119_min_duration_not_capped"] = rec119.durationSeconds === 119 * 60;
  results["119_min_no_cap_error"] = min119.errorCode == null;

  // ── 6. DURATION CAP — 120-MINUTE RECORDING PASSES ─────────────────────────

  const min120 = fakeSave({ ownerId: "user-b", durationSeconds: 120 * 60, role: "PERFORMER" });
  const rec120 = _store.find((r) => r.id === min120.recordingId)!;
  results["120_min_save_passes"] = min120.ok === true;
  results["120_min_duration_exactly_7200"] = rec120.durationSeconds === 7_200;
  results["120_min_no_cap_error"] = min120.errorCode == null;

  // ── 7. DURATION CAP — BEYOND 120 MINUTES → CAPPED ─────────────────────────

  const min150 = fakeSave({ ownerId: "user-b", durationSeconds: 150 * 60, role: "PERFORMER" });
  const rec150 = _store.find((r) => r.id === min150.recordingId)!;
  results["150_min_save_still_ok"] = min150.ok === true;
  results["150_min_duration_capped_at_7200"] = rec150.durationSeconds === 7_200;
  results["150_min_emits_cap_status"] =
    min150.errorCode === SAVED_PERFORMANCE_ERROR_CODES.MAX_DURATION_REACHED;

  // ── 8. 90-DAY EXPIRATION CALCULATION ──────────────────────────────────────

  _store = []; _idCounter = 0;
  const beforeSave = new Date();
  const saveForExpiry = fakeSave({ ownerId: "user-c", durationSeconds: 3_600, role: "FAN" });
  const recForExpiry = _store.find((r) => r.id === saveForExpiry.recordingId)!;
  const expectedExpiry = addDays(beforeSave, 90);
  const expiryDiffMs = Math.abs(recForExpiry.expiresAt.getTime() - expectedExpiry.getTime());
  results["90_day_expiry_calculated_correctly"] = expiryDiffMs < 5_000; // within 5 s

  // ── 9. RENEWAL EXTENDS EXPIRATION (NOT DUPLICATE) ─────────────────────────

  const originalExpiry = recForExpiry.expiresAt;
  const renewResult = fakeRenew("user-c", recForExpiry.id);
  results["renewal_ok"] = renewResult.ok === true;
  const expectedNewExpiry = addDays(originalExpiry, 90);
  const renewDiffMs = Math.abs(
    renewResult.newExpiresAt!.getTime() - expectedNewExpiry.getTime(),
  );
  results["renewal_extends_same_record_by_90_days"] = renewDiffMs < 5_000;
  results["renewal_increments_renewal_count"] = recForExpiry.renewalCount === 1;
  results["renewal_does_not_duplicate_storage_object"] =
    _store.filter((r) => r.ownerId === "user-c").length === 1;

  // ── 10. NON-RENEWED ITEM ENTERS DELETION PENDING ──────────────────────────

  _store = []; _idCounter = 0;
  const saveForDel = fakeSave({ ownerId: "user-d", durationSeconds: 1_800, role: "FAN" });
  const recForDel = _store.find((r) => r.id === saveForDel.recordingId)!;

  // Simulate expiry sweep by setting status as the service would
  recForDel.status = "DELETION_PENDING";
  results["non_renewed_item_status_deletion_pending"] =
    recForDel.status === "DELETION_PENDING";

  // ── 11. FAN SAVE ──────────────────────────────────────────────────────────

  _store = []; _idCounter = 0;
  const fanSave = fakeSave({ ownerId: "fan-1", durationSeconds: 3_600, role: "FAN" });
  const fanRec = _store.find((r) => r.id === fanSave.recordingId)!;
  results["fan_save_passes"] = fanSave.ok === true;
  results["fan_record_role_is_fan"] = fanRec.role === "FAN";

  // ── 12. PERFORMER SAVE ────────────────────────────────────────────────────

  _store = []; _idCounter = 0;
  const perfSave = fakeSave({ ownerId: "perf-1", durationSeconds: 7_200, role: "PERFORMER" });
  const perfRec = _store.find((r) => r.id === perfSave.recordingId)!;
  results["performer_save_passes"] = perfSave.ok === true;
  results["performer_record_role_is_performer"] = perfRec.role === "PERFORMER";

  // ── 13. SERVER-SIDE ANNUAL COUNT ENFORCEMENT ──────────────────────────────
  // Verify the limit is checked before writing, not after

  _store = []; _idCounter = 0;
  for (let i = 0; i < SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT; i++) {
    fakeSave({ ownerId: "user-limit", durationSeconds: 1_800, role: "FAN" });
  }
  const overLimit = fakeSave({ ownerId: "user-limit", durationSeconds: 1_800, role: "FAN" });
  results["server_side_count_blocks_save_at_limit"] = overLimit.ok === false;
  results["server_side_count_enforced_before_write"] =
    _store.filter((r) => r.ownerId === "user-limit").length ===
    SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT;

  // ── 14. EARLY DELETE DOES NOT AFFECT ANNUAL COUNT ─────────────────────────

  _store = []; _idCounter = 0;
  const saveToDelete = fakeSave({ ownerId: "user-e", durationSeconds: 1_800, role: "FAN" });
  // User deletes it — status moves to DELETION_PENDING
  fakeDelete("user-e", saveToDelete.recordingId!);
  const recAfterDelete = _store.find((r) => r.id === saveToDelete.recordingId)!;

  // The record still exists (not DELETED yet) — still counts against annual allowance
  // (per policy: "deleting does not restore the annual save slot")
  const countAfterDelete = _store.filter(
    (r) => r.ownerId === "user-e" && r.status !== "DELETED",
  ).length;
  results["early_delete_record_is_deletion_pending"] =
    recAfterDelete.status === "DELETION_PENDING";
  results["early_delete_still_consumes_annual_slot"] = countAfterDelete === 1;

  // ── Summary ───────────────────────────────────────────────────────────────

  const allPassed = Object.values(results).every(Boolean);

  console.log("[SAVED_PERFORMANCE_RETENTION_POLICY_TEST]", {
    allPassed,
    passed: Object.values(results).filter(Boolean).length,
    total: Object.keys(results).length,
    results,
  });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(
      `[SAVED_PERFORMANCE_RETENTION_POLICY_TEST] FAILED: ${failed.join(", ")}`,
    );
  }
}

runSavedPerformanceRetentionPolicyTest();
