#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function gitDirty() {
  // Scope to api-snapshots only — untracked root-level files must not
  // trigger a false-positive snapshot-drift failure.
  // Path is relative to tmi-platform/ (the cwd when this script runs via pre-push hook).
  const out = execSync('git status --porcelain -- api-snapshots/', { encoding: 'utf8' }).trim();
  return out.length > 0;
}

try {
  run('node ./scripts/generate-api-snapshots.js');
  if (gitDirty()) {
    console.error('\n❌ Snapshot drift detected. Commit the snapshot updates intentionally.\n');
    run('git --no-pager diff');
    process.exit(1);
  }
  console.log('\n✅ Snapshots verified (no drift).\n');
} catch (err) {
  console.error(err);
  process.exit(1);
}
