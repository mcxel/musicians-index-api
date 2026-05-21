import { listActiveGeneratorLeases, sweepExpiredGeneratorLeases } from '@/lib/ai-visuals/VisualAuthorityGateway';

function main() {
  sweepExpiredGeneratorLeases();
  const leases = listActiveGeneratorLeases();
  const now = Date.now();
  const stale = leases.filter((lease) => now - lease.generatorHeartbeat > 7_500);

  if (stale.length > 0) {
    console.error(`FAIL: stale generator heartbeats detected (${stale.length})`);
    for (const lease of stale.slice(0, 50)) {
      console.error(`  ${lease.generatorId} room=${lease.roomId ?? 'global'} domain=${lease.domain}`);
    }
    process.exit(1);
  }

  console.log('PASS: generator heartbeats valid');
  console.log(JSON.stringify({ activeLeases: leases.length }, null, 2));
}

main();
