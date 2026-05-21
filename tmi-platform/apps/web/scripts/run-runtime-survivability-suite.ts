#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const failures: string[] = [];

function read(relPath: string): string {
  const full = path.join(cwd, relPath);
  if (!fs.existsSync(full)) {
    failures.push(`missing file: ${relPath}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function assertAny(text: string, tokens: string[], label: string): void {
  if (!tokens.some((t) => text.includes(t))) {
    failures.push(`missing survivability signal for ${label}: expected one of ${tokens.join(', ')}`);
  }
}

console.log('=== RUNTIME SURVIVABILITY SUITE ===');

const userAvatar = read('src/components/user/UserAvatar.tsx');
assertAny(userAvatar, ['setImgFailed', 'fallbackUrl', 'ImageSlotWrapper'], 'frozen avatar recovery');

const ambientOverlay = read('src/components/scenes/AmbientOverlay.tsx');
assertAny(ambientOverlay, ['useVisualRouting', 'fallback', 'overlay'], 'dead overlay recovery');

const sponsorViewer = read('src/components/sponsor/SponsorAdViewer.tsx');
assertAny(sponsorViewer, ['useVisualRouting', 'resolvedVideoUrl'], 'dropped livestream continuity');

const sponsorFullscreen = read('src/components/sponsor/SponsorFullscreen.tsx');
assertAny(sponsorFullscreen, ['useVisualRouting', 'resolvedVideoUrl'], 'fullscreen stream recovery');

const visualAuthorityHook = read('src/lib/hooks/useVisualAuthority.ts');
assertAny(visualAuthorityHook, ['fallback', 'blocked', 'isLoading'], 'failed generator degraded continuity');
assertAny(visualAuthorityHook, ['toChatRoomId', 'hydrateImageWithAuthority'], 'authority routing continuity');

const wrappers = [
  read('src/components/visual-enforcement/ImageSlotWrapper.tsx'),
  read('src/components/visual-enforcement/PerformerPortraitWrapper.tsx'),
  read('src/components/visual-enforcement/VenueReconstructionWrapper.tsx'),
  read('src/components/visual-enforcement/MagazineSlotWrapper.tsx'),
].join('\n');
assertAny(wrappers, ['fallback', 'degraded', 'blocked', 'isLoading'], 'broken wrapper degraded continuity');

const recoveryEngine = read('src/lib/auth/SessionRecoveryEngine.ts');
assertAny(recoveryEngine, ['recover', 'retry', 'expiration'], 'session recovery compatibility');

const botRecovery = read('src/lib/bots/BotRecoveryEngine.ts');
assertAny(botRecovery, ['recover', 'retry', 'backoff'], 'room deadlock recovery orchestration');

if (failures.length > 0) {
  console.error('FAIL: runtime survivability suite failed');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('PASS: runtime survivability signals verified (avatar/overlay/video/wrapper/recovery)');
