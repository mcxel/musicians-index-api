import { getAssetLineageDiagnostics, findOrphanLineageNodes } from '@/lib/runtime/lineage/AssetLineageGraph';

function main() {
  const diagnostics = getAssetLineageDiagnostics();
  const orphans = findOrphanLineageNodes();

  if (orphans.length > 100) {
    console.error(`FAIL: orphan lineage nodes too high (${orphans.length})`);
    process.exit(1);
  }

  console.log('PASS: runtime lineage graph healthy');
  console.log(JSON.stringify({
    nodeCount: diagnostics.nodeCount,
    edgeCount: diagnostics.edgeCount,
    orphanCount: diagnostics.orphanCount,
  }, null, 2));
}

main();
