import { listRuntimeAuthorityClaims, listRuntimeAuthorityConflicts } from '@/lib/runtime/RuntimeAuthorityRegistry';
import { getVisualAuthorityStats, listActiveGeneratorLeases } from '@/lib/ai-visuals/VisualAuthorityGateway';

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function main() {
  const claims = listRuntimeAuthorityClaims();
  const conflicts = listRuntimeAuthorityConflicts(500);
  const stats = getVisualAuthorityStats();
  const leases = listActiveGeneratorLeases();

  const duplicateClaims = claims
    .map((claim) => `${claim.roomId}::${claim.domain}`)
    .filter((key, idx, arr) => arr.indexOf(key) !== idx);

  if (duplicateClaims.length > 0) {
    fail(`Duplicate authority claims found: ${duplicateClaims.slice(0, 10).join(', ')}`);
  }

  if (conflicts.length > 0) {
    console.warn(`WARN: ${conflicts.length} authority conflicts observed`);
  }

  if (stats.blockedCount > 200) {
    fail(`Blocked visual count too high: ${stats.blockedCount}`);
  }

  console.log('PASS: visual authority validated');
  console.log(JSON.stringify({
    claims: claims.length,
    conflicts: conflicts.length,
    blocked: stats.blockedCount,
    leases: leases.length,
  }, null, 2));
}

main();
