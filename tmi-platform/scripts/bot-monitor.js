#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const interval = Number(process.env.MONITOR_INTERVAL_MS || 60000);

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function runOk(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeIncident(kind, details) {
  const dir = path.join(process.cwd(), '_logs', 'incidents');
  ensureDir(dir);
  const file = path.join(dir, `incident-${kind}-${stamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(details, null, 2), 'utf8');
  console.error(`\n🚨 Incident recorded: ${file}\n`);
}

console.log(`🤖 Monitor started. interval=${interval}ms`);

setInterval(() => {
  const okApi = runOk('node ./scripts/healthcheck-api.js');
  const okWeb = runOk('node ./scripts/healthcheck-web.js');

  if (!okApi || !okWeb) {
    writeIncident('health-fail', {
      ts: new Date().toISOString(),
      okApi,
      okWeb,
      apiUrl: process.env.API_HEALTH_URL || 'http://localhost:3001/health',
      webUrl: process.env.WEB_HEALTH_URL || 'http://localhost:3000/',
      suggestedActions: [
        'Check latest release tag',
        'If new deploy, rollback: pnpm run rollback:to-tag -Tag <tag>',
        'Disable failing module via feature flag kill switch'
      ]
    });
  }
}, interval);
