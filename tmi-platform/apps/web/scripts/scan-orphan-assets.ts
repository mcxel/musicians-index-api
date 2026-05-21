import { findOrphanLineageNodes } from '@/lib/runtime/lineage/AssetLineageGraph';

function main() {
  const orphans = findOrphanLineageNodes();

  if (orphans.length > 0) {
    console.warn(`WARN: orphan assets detected (${orphans.length})`);
    for (const orphan of orphans.slice(0, 100)) {
      console.warn(`  node=${orphan.nodeId} asset=${orphan.assetId} type=${orphan.type}`);
    }
  } else {
    console.log('PASS: no orphan assets found');
  }
}

main();
