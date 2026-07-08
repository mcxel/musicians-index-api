/**
 * Rule 17 — Ticket Authority Enforcement
 * Pass 1 Evidence Capture
 *
 * Tests every enforcement surface in ticketEngine.ts.
 * Each case records: scenario, expected status, actual status, verdict.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json src/tests/rule17_ticket_authority.test.ts
 *
 * Successful run produces:
 *   [RULE17_EVIDENCE] All N tests passed.
 *   [RULE17_EVIDENCE_TABLE] <JSON evidence table>
 */

import {
  createTicket,
  transferTicket,
  upgradeTicket,
  redeemTicket,
} from '../lib/tickets/ticketEngine';

// ── Evidence record ───────────────────────────────────────────────────────────

type Verdict = 'PASS' | 'FAIL';

interface EvidenceRow {
  id: string;
  endpoint: string;
  scenario: string;
  role: string | null;
  expectedCode: string;
  actualCode: string;
  verdict: Verdict;
  notes?: string;
}

const evidence: EvidenceRow[] = [];
let passed = 0;
let failed = 0;

async function capture(
  id: string,
  endpoint: string,
  scenario: string,
  role: string | null,
  expectedCode: string,
  fn: () => unknown,
  notes?: string,
): Promise<void> {
  let actualCode = 'none';
  let verdict: Verdict = 'FAIL';
  try {
    await fn();
    actualCode = 'none';
    verdict = expectedCode === 'none' ? 'PASS' : 'FAIL';
  } catch (err) {
    const code = err instanceof Error ? err.message : String(err);
    actualCode = (err as Error & { code?: string }).code ?? code;
    verdict = actualCode === expectedCode ? 'PASS' : 'FAIL';
  }

  if (verdict === 'PASS') passed++;
  else {
    failed++;
    console.error(`  ✗ [${id}] ${scenario} — expected "${expectedCode}", got "${actualCode}"`);
  }

  evidence.push({ id, endpoint, scenario, role, expectedCode, actualCode, verdict, notes });
}

async function main(): Promise<void> {
  // ───────────────────────────────────────────────────────────────────────────
  // createTicket() — authorization enforcement
  // ───────────────────────────────────────────────────────────────────────────

  console.log('\n── createTicket() ──────────────────────────────────────────────────────────');

  // Unauthenticated
  await capture(
    'CT-01', 'createTicket()', 'Unauthenticated caller', null,
    'authentication_required',
    () => createTicket({
      ownerId: 'u1', venueSlug: 'venue-a', eventSlug: 'event-1',
      tier: 'STANDARD', faceValue: 40,
      actorRole: undefined, isAuthenticated: false,
    }),
    'isAuthenticated = false should throw authentication_required',
  );

  // Fan role
  await capture(
    'CT-02', 'createTicket()', 'FAN role (forbidden)', 'FAN',
    'forbidden_inventory_role',
    () => createTicket({
      ownerId: 'u2', venueSlug: 'venue-a', eventSlug: 'event-1',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'FAN', isAuthenticated: true,
    }),
    'FAN must never create ticket inventory',
  );

  // Performer role
  await capture(
    'CT-03', 'createTicket()', 'PERFORMER role (forbidden)', 'PERFORMER',
    'forbidden_inventory_role',
    () => createTicket({
      ownerId: 'u3', venueSlug: 'venue-a', eventSlug: 'event-1',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'PERFORMER', isAuthenticated: true,
    }),
    'PERFORMER must never create ticket inventory (Rule 17)',
  );

  // Venue role
  await capture(
    'CT-04', 'createTicket()', 'VENUE role (allowed)', 'VENUE',
    'none',
    () => createTicket({
      ownerId: 'u4', venueSlug: 'venue-a', eventSlug: 'event-2',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true, inventoryLimit: 10,
    }),
    'VENUE may create ticket inventory',
  );

  // Promoter role
  await capture(
    'CT-05', 'createTicket()', 'PROMOTER role (allowed)', 'PROMOTER',
    'none',
    () => createTicket({
      ownerId: 'u5', venueSlug: 'venue-b', eventSlug: 'event-3',
      tier: 'VIP', faceValue: 150,
      actorRole: 'PROMOTER', isAuthenticated: true, inventoryLimit: 5,
    }),
    'PROMOTER may create ticket inventory',
  );

  // Admin role
  await capture(
    'CT-06', 'createTicket()', 'ADMIN role (allowed)', 'ADMIN',
    'none',
    () => createTicket({
      ownerId: 'u6', venueSlug: 'venue-c', eventSlug: 'event-4',
      tier: 'BACKSTAGE', faceValue: 250,
      actorRole: 'ADMIN', isAuthenticated: true,
    }),
    'ADMIN may create ticket inventory',
  );

  // Case-insensitive role normalization
  await capture(
    'CT-07', 'createTicket()', 'Lowercase "venue" role (should pass)', 'venue',
    'none',
    () => createTicket({
      ownerId: 'u7', venueSlug: 'venue-d', eventSlug: 'event-5',
      tier: 'STANDARD', faceValue: 30,
      actorRole: 'venue', isAuthenticated: true,
    }),
    'Role matching must be case-insensitive',
  );

  // Invalid face value
  await capture(
    'CT-08', 'createTicket()', 'Negative face value (bad payload)', 'VENUE',
    'invalid_face_value',
    () => createTicket({
      ownerId: 'u8', venueSlug: 'venue-a', eventSlug: 'event-6',
      tier: 'STANDARD', faceValue: -10,
      actorRole: 'VENUE', isAuthenticated: true,
    }),
    'Negative face value must be rejected regardless of role',
  );

  // Zero face value
  await capture(
    'CT-09', 'createTicket()', 'Zero face value (bad payload)', 'VENUE',
    'invalid_face_value',
    () => createTicket({
      ownerId: 'u9', venueSlug: 'venue-a', eventSlug: 'event-7',
      tier: 'STANDARD', faceValue: 0,
      actorRole: 'VENUE', isAuthenticated: true,
    }),
    'Zero face value must be rejected',
  );

  // Invalid inventory limit
  await capture(
    'CT-10', 'createTicket()', 'Invalid inventory limit (-1)', 'VENUE',
    'invalid_inventory_limit',
    () => createTicket({
      ownerId: 'u10', venueSlug: 'venue-a', eventSlug: 'event-8',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true, inventoryLimit: -1,
    }),
    'Negative inventory limit must be rejected',
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Capacity / sold-out enforcement
  // ───────────────────────────────────────────────────────────────────────────

  console.log('\n── Inventory capacity enforcement ───────────────────────────────────────────');

  // Set up: create capacity-1 event
  const CAP_VENUE = `venue-cap-${Date.now()}`;
  const CAP_EVENT = 'cap-event-1';

  await capture(
    'CAP-01', 'createTicket()', 'First ticket within capacity (allowed)', 'VENUE',
    'none',
    () => createTicket({
      ownerId: 'buyer1', venueSlug: CAP_VENUE, eventSlug: CAP_EVENT,
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true, inventoryLimit: 2,
    }),
    'First ticket should succeed when capacity is 2',
  );

  await capture(
    'CAP-02', 'createTicket()', 'Second ticket at limit (allowed)', 'VENUE',
    'none',
    () => createTicket({
      ownerId: 'buyer2', venueSlug: CAP_VENUE, eventSlug: CAP_EVENT,
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true, inventoryLimit: 2,
    }),
    'Second ticket at capacity limit should succeed',
  );

  await capture(
    'CAP-03', 'createTicket()', 'Third ticket beyond capacity (sold out)', 'VENUE',
    'sold_out',
    () => createTicket({
      ownerId: 'buyer3', venueSlug: CAP_VENUE, eventSlug: CAP_EVENT,
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true, inventoryLimit: 2,
    }),
    'Third ticket must throw sold_out when capacity is 2',
  );

  // ───────────────────────────────────────────────────────────────────────────
  // transferTicket() — ownership enforcement
  // ───────────────────────────────────────────────────────────────────────────

  console.log('\n── transferTicket() ─────────────────────────────────────────────────────────');

  // Create a ticket to transfer
  let transferTicketId = '';
  try {
    const t = await createTicket({
      ownerId: 'owner-alice', venueSlug: 'venue-x', eventSlug: 'event-x',
      tier: 'STANDARD', faceValue: 50,
      actorRole: 'VENUE', isAuthenticated: true,
    });
    transferTicketId = t.id;
  } catch {
    console.error('SETUP FAILED: Could not create test ticket for transfer tests');
  }

  await capture(
    'TF-01', 'transferTicket()', 'Owner transfers own ticket (allowed)', 'owner-alice',
    'none',
    () => {
      if (!transferTicketId) throw new Error('test_setup_failed');
      // Transfer from alice to bob
      return transferTicket(transferTicketId, 'owner-bob', 'owner-alice');
    },
    'Current owner should be able to transfer their ticket',
  );

  // After alice transferred to bob, alice is no longer the owner
  await capture(
    'TF-02', 'transferTicket()', 'Non-owner attempts transfer (forbidden)', 'impersonator',
    'forbidden_not_owner',
    () => {
      if (!transferTicketId) throw new Error('test_setup_failed');
      // alice tries to transfer again even though she no longer owns it
      return transferTicket(transferTicketId, 'owner-charlie', 'owner-alice');
    },
    'Non-owner must not be able to transfer a ticket they no longer own',
  );

  await capture(
    'TF-03', 'transferTicket()', 'Non-existent ticket (not found)', null,
    'ticket_not_found',
    () => transferTicket('nonexistent-id', 'some-user', 'some-actor'),
    'Transfer of nonexistent ticket must throw ticket_not_found',
  );

  // ───────────────────────────────────────────────────────────────────────────
  // upgradeTicket() — authority enforcement
  // ───────────────────────────────────────────────────────────────────────────

  console.log('\n── upgradeTicket() ──────────────────────────────────────────────────────────');

  // Create a ticket to upgrade
  let upgradeTicketId = '';
  try {
    const t = await createTicket({
      ownerId: 'upgrade-owner', venueSlug: 'venue-y', eventSlug: 'event-y',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true,
    });
    upgradeTicketId = t.id;
  } catch {
    console.error('SETUP FAILED: Could not create test ticket for upgrade tests');
  }

  await capture(
    'UG-01', 'upgradeTicket()', 'Unauthenticated upgrade attempt', null,
    'authentication_required',
    () => {
      if (!upgradeTicketId) throw new Error('test_setup_failed');
      return upgradeTicket(upgradeTicketId, 'VIP', '', false);
    },
    'isAuthenticated = false must throw authentication_required',
  );

  await capture(
    'UG-02', 'upgradeTicket()', 'FAN attempts tier upgrade (forbidden)', 'FAN',
    'forbidden_inventory_role',
    () => {
      if (!upgradeTicketId) throw new Error('test_setup_failed');
      return upgradeTicket(upgradeTicketId, 'VIP', 'FAN', true);
    },
    'FAN must not be able to upgrade ticket tiers',
  );

  await capture(
    'UG-03', 'upgradeTicket()', 'PERFORMER attempts tier upgrade (forbidden)', 'PERFORMER',
    'forbidden_inventory_role',
    () => {
      if (!upgradeTicketId) throw new Error('test_setup_failed');
      return upgradeTicket(upgradeTicketId, 'VIP', 'PERFORMER', true);
    },
    'PERFORMER must not be able to upgrade ticket tiers',
  );

  await capture(
    'UG-04', 'upgradeTicket()', 'VENUE upgrades ticket tier (allowed)', 'VENUE',
    'none',
    () => {
      if (!upgradeTicketId) throw new Error('test_setup_failed');
      return upgradeTicket(upgradeTicketId, 'VIP', 'VENUE', true);
    },
    'VENUE may upgrade a ticket tier',
  );

  await capture(
    'UG-05', 'upgradeTicket()', 'Non-existent ticket upgrade', 'VENUE',
    'ticket_not_found',
    () => upgradeTicket('nonexistent-id', 'VIP', 'VENUE', true),
    'Upgrade of nonexistent ticket must throw ticket_not_found',
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Duplicate scan / redeemed ticket
  // ───────────────────────────────────────────────────────────────────────────

  console.log('\n── Redeemed ticket enforcement ──────────────────────────────────────────────');

  let redeemTicketId = '';
  try {
    const t = await createTicket({
      ownerId: 'redeem-owner', venueSlug: 'venue-z', eventSlug: 'event-z',
      tier: 'STANDARD', faceValue: 40,
      actorRole: 'VENUE', isAuthenticated: true,
    });
    redeemTicketId = t.id;
  } catch {
    console.error('SETUP FAILED: Could not create ticket for redeem test');
  }

  await capture(
    'RD-01', 'redeemTicket()', 'First redeem succeeds', null,
    'none',
    () => {
      if (!redeemTicketId) throw new Error('test_setup_failed');
      return redeemTicket(redeemTicketId);
    },
    'First redemption must succeed',
  );

  await capture(
    'RD-02', 'redeemTicket()', 'Duplicate redeem (already redeemed)', null,
    'ticket_already_redeemed',
    () => {
      if (!redeemTicketId) throw new Error('test_setup_failed');
      return redeemTicket(redeemTicketId);
    },
    'Second redemption of same ticket must throw ticket_already_redeemed',
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Evidence output
  // ───────────────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const allPassed = failed === 0;

  console.log('\n────────────────────────────────────────────────────────────────────────────');
  console.log(`[RULE17_EVIDENCE] ${passed}/${total} tests passed.${allPassed ? ' All clear.' : ` ${failed} FAILED.`}`);
  console.log('────────────────────────────────────────────────────────────────────────────');

  // Structured table for the ledger
  const table = evidence.map(r => ({
    id:       r.id,
    endpoint: r.endpoint,
    scenario: r.scenario,
    role:     r.role ?? '(none)',
    expected: r.expectedCode,
    actual:   r.actualCode,
    verdict:  r.verdict,
  }));

  console.log('\n[RULE17_EVIDENCE_TABLE]');
  console.log(JSON.stringify(table, null, 2));

  // Human-readable summary grouped by endpoint
  const byEndpoint: Record<string, EvidenceRow[]> = {};
  for (const row of evidence) {
    if (!byEndpoint[row.endpoint]) byEndpoint[row.endpoint] = [];
    byEndpoint[row.endpoint].push(row);
  }

  console.log('\n[RULE17_SUMMARY]');
  for (const [ep, rows] of Object.entries(byEndpoint)) {
    const epPassed = rows.filter(r => r.verdict === 'PASS').length;
    const epFailed = rows.filter(r => r.verdict === 'FAIL').length;
    const epIcon = epFailed === 0 ? '✅' : '❌';
    console.log(`  ${epIcon} ${ep.padEnd(20)} ${epPassed}/${rows.length} passed`);
    for (const row of rows.filter(r => r.verdict === 'FAIL')) {
      console.log(`       ✗ [${row.id}] ${row.scenario}`);
      console.log(`         expected "${row.expectedCode}" → got "${row.actualCode}"`);
    }
  }

  if (!allPassed) {
    process.exit(1);
  }
}

main();
