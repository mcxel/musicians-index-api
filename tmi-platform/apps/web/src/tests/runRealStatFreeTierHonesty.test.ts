/**
 * Real-Stat + FREE-default honesty certification (assembly slice).
 * Proves TieredAnalyticsEngine no longer fabricates 12.4K / $12,680 metrics,
 * and unpaid tier UI defaults resolve to free/FREE.
 */
import { getAnalyticsSnapshot } from '../lib/analytics/TieredAnalyticsEngine'
import { computeAuthoritativeTier } from '../lib/auth/resolveAuthoritativeTier'
import { roleCan, roleCannot } from '../lib/auth/RoleAuthorityMatrix'

function runRealStatFreeTierHonestyTest() {
  const results: Record<string, boolean> = {}

  const freeSnap = getAnalyticsSnapshot('free', 'sponsor')
  const goldSnap = getAnalyticsSnapshot('gold', 'advertiser')

  const values = [...freeSnap.metrics, ...goldSnap.metrics].map((m) => String(m.value))
  results['no_fake_12_4k'] = values.every((v) => !/12\.4k/i.test(v))
  results['no_fake_12680'] = values.every((v) => !/12,?680/.test(v) && !/\$18k/i.test(v))
  results['free_profile_views_honest_zero'] =
    freeSnap.metrics.find((m) => m.label === 'Profile Views')?.value === '0'
  results['gold_revenue_honest_zero'] =
    goldSnap.metrics.find((m) => m.label === 'Revenue This Month')?.value === '$0'
  results['ranking_trajectory_not_fake'] =
    goldSnap.metrics.find((m) => m.label === 'Ranking Trajectory')?.value === '—'
  results['insights_not_fabricated_copy'] = freeSnap.insights.every(
    (i) => !/peak audience|projected monthly revenue|\$18/i.test(`${i.headline} ${i.body}`),
  )

  results['missing_tier_is_free'] =
    computeAuthoritativeTier('new.user@example.com', undefined).tier === 'FREE'
  results['null_tier_is_free'] =
    computeAuthoritativeTier('new.user@example.com', null).tier === 'FREE'

  results['advertiser_can_browse_rooms'] = roleCan('ADVERTISER', 'join_rooms')
  results['advertiser_cannot_go_live'] = roleCannot('ADVERTISER', 'go_live')
  results['advertiser_cannot_manage_seating'] = roleCannot('ADVERTISER', 'manage_seating')

  const allPassed = Object.values(results).every(Boolean)
  console.log('[REAL_STAT_FREE_TIER_HONESTY]', { allPassed, results })
  if (!allPassed) {
    const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k)
    throw new Error(`[REAL_STAT_FREE_TIER_HONESTY] FAILED: ${failed.join(', ')}`)
  }
}

runRealStatFreeTierHonestyTest()
