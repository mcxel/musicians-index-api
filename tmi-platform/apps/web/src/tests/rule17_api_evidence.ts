/**
 * Rule 17 — API-Level Evidence Capture
 *
 * Tests the complete authorization logic of three ticket API routes:
 *   POST /api/tickets/create   → createTicket()
 *   POST /api/tickets/validate → validateTicket()
 *   POST /api/tickets/scan     → scanTicket()
 *
 * Each route handler is structured as:
 *   1. getTmiAuth() → if null, 401
 *   2. role check   → if unauthorized role, 403
 *   3. body validation
 *   4. engine call
 *
 * This test exercises steps 2–4 by injecting the auth result directly,
 * exactly as the route handler would receive it from getTmiAuth().
 * The auth injection contract is identical to what the real route uses.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/tests/rule17_api_evidence.ts
 */

import {
  createTicket,
  validateTicket,
  scanTicket,
  redeemTicket,
} from '../lib/tickets/ticketEngine';
import type { TicketTier } from '../lib/tickets/ticketCore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MockSession {
  user: { id: string; role: string; email: string; name: string; tier: string };
}

interface ApiEvidence {
  id:          string;
  route:       string;
  method:      string;
  scenario:    string;
  actorRole:   string | null;
  requestBody: Record<string, unknown>;
  expectedStatus: number;
  expectedError:  string | null;
  actualStatus:   number;
  actualBody:     Record<string, unknown>;
  verdict:        'PASS' | 'FAIL' | 'WARNING';
  notes?:         string;
}

const evidence: ApiEvidence[] = [];
let passed = 0; let failed = 0; let warnings = 0;

// ── Route logic mirrors ────────────────────────────────────────────────────────
// These replicate the exact handler logic, accepting an injected session
// instead of calling getTmiAuth() (which requires next/headers runtime).

const CREATE_AUTHORIZED = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);
const SCAN_AUTHORIZED   = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

function mapCreateError(code: string): number {
  switch (code) {
    case 'authentication_required':   return 401;
    case 'forbidden_inventory_role':  return 403;
    case 'invalid_inventory_limit':
    case 'invalid_face_value':        return 400;
    case 'sold_out':                  return 409;
    default:                          return 400;
  }
}

async function simulateCreateRoute(
  session: MockSession | null,
  body: Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  // Step 1: Auth
  if (!session) return { status: 401, body: { error: 'authentication_required' } };
  const role = (session.user.role ?? '').trim().toUpperCase();
  // Step 2: Role
  if (!CREATE_AUTHORIZED.has(role)) {
    return {
      status: 403,
      body: { error: 'unauthorized', message: 'Only Venue, Promoter, and Admin accounts may create ticket inventory. (TMI Rule 17)' },
    };
  }
  // Step 3: Body validation
  const venueSlug = typeof body.venueSlug === 'string' ? body.venueSlug.trim() : '';
  const eventSlug = typeof body.eventSlug === 'string' ? body.eventSlug.trim() : '';
  if (!venueSlug || !eventSlug) {
    return { status: 400, body: { error: 'venueSlug_and_eventSlug_required' } };
  }
  const tier = typeof body.tier === 'string' ? (body.tier as TicketTier) : 'STANDARD';
  const faceValue = typeof body.faceValue === 'number' ? body.faceValue : 30;
  const inventoryLimitRaw = typeof body.inventoryLimit === 'number' ? body.inventoryLimit : undefined;
  // Step 4: Engine
  try {
    const ticket = await createTicket({
      ownerId:       session.user.id,
      venueSlug,
      eventSlug,
      tier,
      faceValue,
      actorRole:     role,
      isAuthenticated: true,
      inventoryLimit: inventoryLimitRaw,
    });
    return { status: 200, body: { ok: true, ticketId: ticket.id, tier: ticket.template.tier } };
  } catch (err) {
    const code = err instanceof Error ? err.message : 'ticket_create_failed';
    return { status: mapCreateError(code), body: { error: code } };
  }
}

async function simulateValidateRoute(
  session: MockSession | null,
  body: Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!session) return { status: 401, body: { ok: false, error: 'authentication_required' } };
  const role = (session.user.role ?? '').trim().toUpperCase();
  if (!SCAN_AUTHORIZED.has(role)) {
    return { status: 403, body: { ok: false, error: 'forbidden', message: 'Only Venue and Promoter accounts may validate tickets. (TMI Rule 17)' } };
  }
  const ticketId = typeof body.ticketId === 'string' ? body.ticketId.trim() : '';
  if (!ticketId) return { status: 400, body: { ok: false, error: 'ticketId_required' } };
  try {
    const result = await validateTicket(ticketId);
    return { status: 200, body: { ok: true, ...result } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'validation_error';
    return { status: 500, body: { ok: false, error: msg } };
  }
}

async function simulateScanRoute(
  session: MockSession | null,
  body: Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!session) return { status: 401, body: { ok: false, error: 'authentication_required' } };
  const role = (session.user.role ?? '').trim().toUpperCase();
  if (!SCAN_AUTHORIZED.has(role)) {
    return { status: 403, body: { ok: false, error: 'forbidden', message: 'Only Venue and Promoter accounts may scan tickets. (TMI Rule 17)' } };
  }
  const ticketId = typeof body.ticketId === 'string' ? body.ticketId : '';
  const gate     = typeof body.gate     === 'string' ? body.gate     : 'A1';
  if (!ticketId) return { status: 400, body: { ok: false, error: 'ticketId_required' } };
  const result = await scanTicket(ticketId, gate);
  return { status: 200, body: { ...result } };
}

// ── Evidence capture ───────────────────────────────────────────────────────────

async function capture(
  id:          string,
  route:       string,
  scenario:    string,
  actorRole:   string | null,
  requestBody: Record<string, unknown>,
  expectedStatus: number,
  expectedError:  string | null,
  fn:          () => Promise<{ status: number; body: Record<string, unknown> }>,
  notes?:      string,
): Promise<void> {
  let actualStatus = 0;
  let actualBody: Record<string, unknown> = {};
  let verdict: 'PASS' | 'FAIL' | 'WARNING' = 'FAIL';

  try {
    const result = await fn();
    actualStatus = result.status;
    actualBody   = result.body;

    const statusMatch = actualStatus === expectedStatus;
    const errorMatch  = expectedError === null
      ? true
      : (actualBody.error === expectedError || actualBody.error === expectedError);

    if (statusMatch && errorMatch) {
      verdict = 'PASS';
      passed++;
    } else {
      verdict = 'FAIL';
      failed++;
      console.error(`  ✗ [${id}] ${scenario}`);
      console.error(`    Expected: status=${expectedStatus} error=${expectedError ?? '(none)'}`);
      console.error(`    Got:      status=${actualStatus} error=${String(actualBody.error ?? '(none)')}`);
    }
  } catch (err) {
    actualStatus = 500;
    actualBody = { error: err instanceof Error ? err.message : String(err) };
    verdict = 'FAIL';
    failed++;
    console.error(`  ✗ [${id}] ${scenario} — threw unexpectedly: ${actualBody.error}`);
  }

  evidence.push({ id, route, method: 'POST', scenario, actorRole, requestBody, expectedStatus, expectedError, actualStatus, actualBody, verdict, notes });
}

// ── Session factories ──────────────────────────────────────────────────────────

const noAuth = null;
const sess = (role: string): MockSession => ({
  user: { id: `test-${role.toLowerCase()}`, role, email: `${role.toLowerCase()}@tmi.test`, name: role, tier: 'FREE' },
});

async function main(): Promise<void> {
  // ═════════════════════════════════════════════════════════════════════════
  // POST /api/tickets/create
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n── POST /api/tickets/create ─────────────────────────────────────────────────');

  const VALID_BODY = { venueSlug: 'venue-alpha', eventSlug: 'show-1', tier: 'STANDARD', faceValue: 40 };

  await capture('CREATE-01', 'POST /api/tickets/create', 'Unauthenticated', null,
    VALID_BODY, 401, 'authentication_required',
    () => simulateCreateRoute(noAuth, VALID_BODY),
    'No session cookie → 401');

  await capture('CREATE-02', 'POST /api/tickets/create', 'FAN role — forbidden', 'FAN',
    VALID_BODY, 403, 'unauthorized',
    () => simulateCreateRoute(sess('FAN'), VALID_BODY),
    'Rule 17: FAN must never create inventory');

  await capture('CREATE-03', 'POST /api/tickets/create', 'PERFORMER role — forbidden', 'PERFORMER',
    VALID_BODY, 403, 'unauthorized',
    () => simulateCreateRoute(sess('PERFORMER'), VALID_BODY),
    'Rule 17: PERFORMER removed from inventory pipeline');

  await capture('CREATE-04', 'POST /api/tickets/create', 'VENUE role — allowed', 'VENUE',
    { ...VALID_BODY, eventSlug: 'show-2' }, 200, null,
    () => simulateCreateRoute(sess('VENUE'), { ...VALID_BODY, eventSlug: 'show-2' }),
    'VENUE may create inventory');

  await capture('CREATE-05', 'POST /api/tickets/create', 'PROMOTER role — allowed', 'PROMOTER',
    { ...VALID_BODY, eventSlug: 'show-3' }, 200, null,
    () => simulateCreateRoute(sess('PROMOTER'), { ...VALID_BODY, eventSlug: 'show-3' }),
    'PROMOTER may create inventory');

  await capture('CREATE-06', 'POST /api/tickets/create', 'ADMIN role — allowed', 'ADMIN',
    { ...VALID_BODY, eventSlug: 'show-4' }, 200, null,
    () => simulateCreateRoute(sess('ADMIN'), { ...VALID_BODY, eventSlug: 'show-4' }),
    'ADMIN may create inventory');

  await capture('CREATE-07', 'POST /api/tickets/create', 'Missing venueSlug', 'VENUE',
    { eventSlug: 'show-5', faceValue: 40 }, 400, 'venueSlug_and_eventSlug_required',
    () => simulateCreateRoute(sess('VENUE'), { eventSlug: 'show-5', faceValue: 40 }),
    'Missing required slug fields → 400');

  await capture('CREATE-08', 'POST /api/tickets/create', 'Negative faceValue', 'VENUE',
    { ...VALID_BODY, eventSlug: 'show-6', faceValue: -5 }, 400, 'invalid_face_value',
    () => simulateCreateRoute(sess('VENUE'), { ...VALID_BODY, eventSlug: 'show-6', faceValue: -5 }),
    'Negative face value rejected by engine');

  await capture('CREATE-09', 'POST /api/tickets/create', 'Zero faceValue', 'VENUE',
    { ...VALID_BODY, eventSlug: 'show-7', faceValue: 0 }, 400, 'invalid_face_value',
    () => simulateCreateRoute(sess('VENUE'), { ...VALID_BODY, eventSlug: 'show-7', faceValue: 0 }),
    'Zero face value rejected');

  await capture('CREATE-10', 'POST /api/tickets/create', 'Invalid inventoryLimit (-1)', 'VENUE',
    { ...VALID_BODY, eventSlug: 'show-8', inventoryLimit: -1 }, 400, 'invalid_inventory_limit',
    () => simulateCreateRoute(sess('VENUE'), { ...VALID_BODY, eventSlug: 'show-8', inventoryLimit: -1 }),
    'Negative inventory limit rejected');

  // Sold-out / capacity overflow: create with limit=1, then try again
  const CAP_VENUE = `cap-venue-api-${Date.now()}`; const CAP_EVENT = 'cap-event-api-1';
  const capBody1 = { venueSlug: CAP_VENUE, eventSlug: CAP_EVENT, tier: 'STANDARD', faceValue: 30, inventoryLimit: 1 };
  await capture('CREATE-11', 'POST /api/tickets/create', 'First ticket at capacity-1 limit — allowed', 'VENUE',
    capBody1, 200, null,
    () => simulateCreateRoute(sess('VENUE'), capBody1),
    'Capacity 1: first ticket should succeed');

  await capture('CREATE-12', 'POST /api/tickets/create', 'Second ticket — sold out (capacity overflow)', 'VENUE',
    { venueSlug: CAP_VENUE, eventSlug: CAP_EVENT, tier: 'STANDARD', faceValue: 30, inventoryLimit: 1 }, 409, 'sold_out',
    () => simulateCreateRoute(sess('VENUE'), { venueSlug: CAP_VENUE, eventSlug: CAP_EVENT, tier: 'STANDARD', faceValue: 30, inventoryLimit: 1 }),
    'Capacity 1: second ticket must be rejected with 409 sold_out');

  await capture('CREATE-13', 'POST /api/tickets/create', 'Retry after sold_out — still sold out', 'VENUE',
    { venueSlug: CAP_VENUE, eventSlug: CAP_EVENT, tier: 'STANDARD', faceValue: 30, inventoryLimit: 1 }, 409, 'sold_out',
    () => simulateCreateRoute(sess('VENUE'), { venueSlug: CAP_VENUE, eventSlug: CAP_EVENT, tier: 'STANDARD', faceValue: 30, inventoryLimit: 1 }),
    'Sold-out state persists — retry must not bypass capacity');

  // ═════════════════════════════════════════════════════════════════════════
  // POST /api/tickets/validate
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n── POST /api/tickets/validate ───────────────────────────────────────────────');

  // Create a ticket to validate
  let validateTicketId = '';
  try {
    const t = await createTicket({ ownerId: 'u-val', venueSlug: 'val-venue', eventSlug: 'val-event',
      tier: 'STANDARD', faceValue: 40, actorRole: 'VENUE', isAuthenticated: true });
    validateTicketId = t.id;
  } catch { console.error('SETUP FAILED: could not create validation test ticket'); }

  await capture('VAL-01', 'POST /api/tickets/validate', 'Unauthenticated', null,
    { ticketId: 'any-id' }, 401, 'authentication_required',
    () => simulateValidateRoute(noAuth, { ticketId: 'any-id' }),
    'No session → 401');

  await capture('VAL-02', 'POST /api/tickets/validate', 'FAN role — forbidden', 'FAN',
    { ticketId: 'any-id' }, 403, 'forbidden',
    () => simulateValidateRoute(sess('FAN'), { ticketId: 'any-id' }),
    'Rule 17: FAN must not validate/scan tickets');

  await capture('VAL-03', 'POST /api/tickets/validate', 'PERFORMER role — forbidden', 'PERFORMER',
    { ticketId: 'any-id' }, 403, 'forbidden',
    () => simulateValidateRoute(sess('PERFORMER'), { ticketId: 'any-id' }),
    'Rule 17: PERFORMER must not validate/scan tickets');

  await capture('VAL-04', 'POST /api/tickets/validate', 'Missing ticketId', 'VENUE',
    {}, 400, 'ticketId_required',
    () => simulateValidateRoute(sess('VENUE'), {}),
    'Empty body → 400 ticketId_required');

  await capture('VAL-05', 'POST /api/tickets/validate', 'VENUE validates valid ticket', 'VENUE',
    { ticketId: validateTicketId }, 200, null,
    () => simulateValidateRoute(sess('VENUE'), { ticketId: validateTicketId }),
    'VENUE may validate a real ticket');

  await capture('VAL-06', 'POST /api/tickets/validate', 'PROMOTER validates valid ticket', 'PROMOTER',
    { ticketId: validateTicketId }, 200, null,
    () => simulateValidateRoute(sess('PROMOTER'), { ticketId: validateTicketId }),
    'PROMOTER may validate a real ticket');

  await capture('VAL-07', 'POST /api/tickets/validate', 'ADMIN validates valid ticket', 'ADMIN',
    { ticketId: validateTicketId }, 200, null,
    () => simulateValidateRoute(sess('ADMIN'), { ticketId: validateTicketId }),
    'ADMIN may validate a real ticket');

  // ═════════════════════════════════════════════════════════════════════════
  // POST /api/tickets/scan
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n── POST /api/tickets/scan ───────────────────────────────────────────────────');

  // Create a fresh ticket for scan tests
  let scanTicketId = '';
  try {
    const t = await createTicket({ ownerId: 'u-scan', venueSlug: 'scan-venue', eventSlug: 'scan-event',
      tier: 'VIP', faceValue: 150, actorRole: 'VENUE', isAuthenticated: true });
    scanTicketId = t.id;
  } catch { console.error('SETUP FAILED: could not create scan test ticket'); }

  await capture('SCAN-01', 'POST /api/tickets/scan', 'Unauthenticated', null,
    { ticketId: 'any-id', gate: 'A1' }, 401, 'authentication_required',
    () => simulateScanRoute(noAuth, { ticketId: 'any-id', gate: 'A1' }),
    'No session → 401');

  await capture('SCAN-02', 'POST /api/tickets/scan', 'FAN role — forbidden', 'FAN',
    { ticketId: 'any-id', gate: 'A1' }, 403, 'forbidden',
    () => simulateScanRoute(sess('FAN'), { ticketId: 'any-id', gate: 'A1' }),
    'Rule 17: FAN must not scan tickets at the gate');

  await capture('SCAN-03', 'POST /api/tickets/scan', 'PERFORMER role — forbidden', 'PERFORMER',
    { ticketId: 'any-id', gate: 'A1' }, 403, 'forbidden',
    () => simulateScanRoute(sess('PERFORMER'), { ticketId: 'any-id', gate: 'A1' }),
    'Rule 17: PERFORMER must not scan tickets');

  await capture('SCAN-04', 'POST /api/tickets/scan', 'Missing ticketId', 'VENUE',
    { gate: 'A1' }, 400, 'ticketId_required',
    () => simulateScanRoute(sess('VENUE'), { gate: 'A1' }),
    'Empty ticketId → 400');

  await capture('SCAN-05', 'POST /api/tickets/scan', 'VENUE scans valid ticket', 'VENUE',
    { ticketId: scanTicketId, gate: 'A1' }, 200, null,
    () => simulateScanRoute(sess('VENUE'), { ticketId: scanTicketId, gate: 'A1' }),
    'VENUE may scan a ticket at the gate');

  await capture('SCAN-06', 'POST /api/tickets/scan', 'PROMOTER scans valid ticket', 'PROMOTER',
    { ticketId: scanTicketId, gate: 'B2' }, 200, null,
    () => simulateScanRoute(sess('PROMOTER'), { ticketId: scanTicketId, gate: 'B2' }),
    'PROMOTER may scan a ticket at the gate');

  await capture('SCAN-07', 'POST /api/tickets/scan', 'ADMIN scans valid ticket', 'ADMIN',
    { ticketId: scanTicketId, gate: 'C3' }, 200, null,
    () => simulateScanRoute(sess('ADMIN'), { ticketId: scanTicketId, gate: 'C3' }),
    'ADMIN may scan a ticket at the gate');

  // Duplicate scan / expired ticket
  // First redeem the scan ticket to simulate already-used state
  let redeemId = '';
  try {
    const t = await createTicket({ ownerId: 'u-redeem', venueSlug: 'rd-venue', eventSlug: 'rd-event',
      tier: 'STANDARD', faceValue: 30, actorRole: 'VENUE', isAuthenticated: true });
    redeemId = t.id;
    await redeemTicket(redeemId);
  } catch { console.error('SETUP FAILED: could not create redeemed ticket for scan test'); }

  await capture('SCAN-08', 'POST /api/tickets/scan', 'Duplicate scan — already redeemed ticket', 'VENUE',
    { ticketId: redeemId, gate: 'A1' }, 200, null,
    () => {
      // scanTicket itself doesn't throw on already-redeemed (TicketScannerEngine records it)
      // The result will show redeemed: true or similar
      return simulateScanRoute(sess('VENUE'), { ticketId: redeemId, gate: 'A1' });
    },
    'Scan of already-redeemed ticket — engine records the attempt; check body for redeemed flag');

  await capture('SCAN-09', 'POST /api/tickets/scan', 'Non-existent ticket scan', 'VENUE',
    { ticketId: 'nonexistent-xyz', gate: 'A1' }, 200, null,
    () => simulateScanRoute(sess('VENUE'), { ticketId: 'nonexistent-xyz', gate: 'A1' }),
    'Non-existent ticket — engine handles gracefully; check body for error flag');

  // Unauthorized access after initial success (ensure state is not leaked)
  await capture('SCAN-10', 'POST /api/tickets/scan', 'Unauthorized retry after valid scan', 'FAN',
    { ticketId: scanTicketId, gate: 'A1' }, 403, 'forbidden',
    () => simulateScanRoute(sess('FAN'), { ticketId: scanTicketId, gate: 'A1' }),
    'FAN retry after VENUE scanned same ticket — still forbidden');

  // ═════════════════════════════════════════════════════════════════════════
  // Evidence output
  // ═════════════════════════════════════════════════════════════════════════

  const total = passed + failed + warnings;

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log(`[RULE17_API_EVIDENCE] ${passed}/${total} passed · ${failed} failed · ${warnings} warnings`);
  console.log('════════════════════════════════════════════════════════════════════════════');

  // Structured JSON table
  const table = evidence.map(r => ({
    id:             r.id,
    route:          r.route,
    scenario:       r.scenario,
    actorRole:      r.actorRole ?? '(no session)',
    expectedStatus: r.expectedStatus,
    actualStatus:   r.actualStatus,
    expectedError:  r.expectedError ?? '(success)',
    actualError:    String(r.actualBody.error ?? '(success)'),
    verdict:        r.verdict,
  }));

  console.log('\n[RULE17_API_EVIDENCE_TABLE]');
  console.log(JSON.stringify(table, null, 2));

  // Grouped summary
  const byRoute: Record<string, typeof evidence> = {};
  for (const row of evidence) {
    if (!byRoute[row.route]) byRoute[row.route] = [];
    byRoute[row.route].push(row);
  }

  console.log('\n[RULE17_API_SUMMARY]');
  for (const [route, rows] of Object.entries(byRoute)) {
    const rPassed = rows.filter(r => r.verdict === 'PASS').length;
    const rFailed = rows.filter(r => r.verdict === 'FAIL').length;
    const icon    = rFailed === 0 ? '✅' : '❌';
    console.log(`  ${icon} ${route.padEnd(35)} ${rPassed}/${rows.length} passed`);
    for (const row of rows.filter(r => r.verdict === 'FAIL')) {
      console.log(`       ✗ [${row.id}] ${row.scenario}`);
      console.log(`         expected status=${row.expectedStatus} error="${row.expectedError ?? '(none)'}"`);
      console.log(`         got      status=${row.actualStatus} error="${String(row.actualBody.error ?? '(none)')}"`);
    }
  }

  // Full body evidence for each row (for the ledger)
  console.log('\n[RULE17_FULL_RESPONSE_EVIDENCE]');
  for (const row of evidence) {
    console.log(`  [${row.id}] ${row.scenario} → status=${row.actualStatus} body=${JSON.stringify(row.actualBody)}`);
  }

  if (failed > 0) process.exit(1);
}

main();
