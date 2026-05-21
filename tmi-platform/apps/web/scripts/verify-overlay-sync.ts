import { getOverlayResolverDiagnostics } from '@/lib/runtime/overlay/OverlayConflictResolver';

function main() {
  const diag = getOverlayResolverDiagnostics();
  const riskyRooms = diag.rooms.filter((room) => room.stale > 5);

  if (riskyRooms.length > 0) {
    console.error('FAIL: overlay desync detected');
    for (const room of riskyRooms) {
      console.error(`  room=${room.roomId} stale=${room.stale} active=${room.active}`);
    }
    process.exit(1);
  }

  console.log('PASS: overlay sync verified');
  console.log(JSON.stringify({ roomCount: diag.roomCount, totalOverlays: diag.totalOverlays }, null, 2));
}

main();
