#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runOk(cmd) {
  try { execSync(cmd, { stdio: 'inherit' }); return true; } catch { return false; }
}

function latestIncident() {
  const dir = path.join(process.cwd(), '_logs', 'incidents');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  if (!files.length) return null;
  return path.join(dir, files[files.length - 1]);
}

const inc = latestIncident();
console.log('🤖 Triage starting', inc ? `incident=${inc}` : '(no incident file found)');

const results = {
  ts: new Date().toISOString(),
  incident: inc || null,
  snapshotVerify: runOk('pnpm run snapshot:verify'),
  typecheck: runOk('pnpm -w typecheck'),
  gates: runOk('pnpm run gates'),
  suggestion: []
};

if (!results.snapshotVerify) results.suggestion.push('Snapshot drift: run pnpm run snapshot:api then commit changes intentionally.');
if (!results.typecheck) results.suggestion.push('Type errors: fix typecheck before deploy.');
if (!results.gates) results.suggestion.push('Import boundaries or web gates failed: fix boundary violations.');

if (!results.suggestion.length) results.suggestion.push('No repo-level failures detected. Investigate runtime logs / feature flags / env vars.');

const outDir = path.join(process.cwd(), '_logs', 'triage');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `triage-${Date.now()}.json`);
fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');

console.log(`✅ Wrote triage report: ${outFile}`);
