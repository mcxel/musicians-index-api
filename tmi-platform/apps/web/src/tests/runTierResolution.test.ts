import { computeAuthoritativeTier } from '../lib/auth/resolveAuthoritativeTier'

// Honesty note: this exercises computeAuthoritativeTier — the pure decision
// logic with zero I/O — which is everything about the P0 tier-resolution
// fix that can be verified without a live database/HTTP server in this
// environment. It does NOT prove the four converged routes
// (/api/auth/signin, /api/auth/session, /api/auth/me, getTmiAuth.ts) wire
// their fetched DB value into this function correctly at runtime — that
// requires an actual authenticated request against a real database, which
// this script cannot fabricate. The code diff for those four call sites is
// the evidence for that part; this script is the evidence for the decision
// rule itself.

const FOUNDER_EMAIL = 'leeanncoats.79@gmail.com'   // real entry in FounderDiamondPassEngine
const NON_FOUNDER_EMAIL = 'random.fan@example.com' // not in the founder-passes list

function runTierResolutionTest() {
  const results: Record<string, boolean> = {}

  // 1. FREE DB tier, non-founder -> FREE
  results['free_db_stays_free'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, 'FREE').tier === 'FREE'

  // 2. DIAMOND DB tier, non-founder -> DIAMOND
  results['diamond_db_stays_diamond'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, 'DIAMOND').tier === 'DIAMOND'

  // 3. Any real mid-tier passes through unchanged (proves no role/tier
  //    conflation and no blanket escalation for ordinary paid tiers)
  results['gold_db_stays_gold'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, 'GOLD').tier === 'GOLD'

  // 4. Missing/invalid tier must resolve to FREE, never DIAMOND — this is
  //    the exact anti-pattern bf9024fd introduced and this fix reverts.
  results['missing_tier_resolves_free_not_diamond'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, undefined).tier === 'FREE'
  results['null_tier_resolves_free_not_diamond'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, null).tier === 'FREE'
  results['garbage_tier_resolves_free_not_diamond'] =
    computeAuthoritativeTier(NON_FOUNDER_EMAIL, 'not_a_real_tier').tier === 'FREE'

  // 5. Founder-pass email with a stale/non-diamond DB tier -> DIAMOND, and
  //    flags that a DB self-heal write is needed (login/session routes
  //    perform that write; this pure function only signals it).
  const founderResolved = computeAuthoritativeTier(FOUNDER_EMAIL, 'FREE')
  results['founder_email_resolves_diamond'] = founderResolved.tier === 'DIAMOND'
  results['founder_email_signals_heal_when_stale'] = founderResolved.needsFounderHeal === true

  // 6. Founder-pass email already DIAMOND in DB -> no redundant heal write
  const founderAlreadyDiamond = computeAuthoritativeTier(FOUNDER_EMAIL, 'DIAMOND')
  results['founder_already_diamond_no_redundant_heal'] =
    founderAlreadyDiamond.tier === 'DIAMOND' && founderAlreadyDiamond.needsFounderHeal === false

  // 7. Function signature has no role parameter — administrative authority
  //    cannot influence tier through this resolver by construction. (Static
  //    proof: computeAuthoritativeTier.length === 2, i.e. only (email, dbTier).)
  results['no_role_parameter_exists'] = computeAuthoritativeTier.length === 2

  // 8. Two different emails with two different DB tiers never bleed into
  //    each other — same call site, independent inputs, independent
  //    outputs (proves the function carries no hidden shared state that
  //    could leak Account A's resolution into Account B's).
  const accountA = computeAuthoritativeTier('account-a@example.com', 'FREE')
  const accountB = computeAuthoritativeTier('account-b@example.com', 'DIAMOND')
  results['account_a_b_independent'] = accountA.tier === 'FREE' && accountB.tier === 'DIAMOND'

  const allPassed = Object.values(results).every(Boolean)

  console.log('[TIER_RESOLUTION_TEST_ASSERT]', { allPassed, results })

  if (!allPassed) {
    const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k)
    throw new Error(`[TIER_RESOLUTION_TEST] FAILED: ${failed.join(', ')}`)
  }
}

runTierResolutionTest()
