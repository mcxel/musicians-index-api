#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) { return execSync(cmd, { encoding: 'utf8' }).trim(); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

const sha = sh('git rev-parse HEAD');
const branch = sh('git rev-parse --abbrev-ref HEAD');
const changes = sh('git --no-pager log -1 --pretty=%B');

const dir = path.join(process.cwd(), '_logs', 'releases');
ensureDir(dir);

const file = path.join(dir, `release-${sha.slice(0, 8)}.json`);
fs.writeFileSync(file, JSON.stringify({ ts: new Date().toISOString(), branch, sha, lastCommitMessage: changes }, null, 2), 'utf8');

console.log(`✅ Wrote release notes: ${file}`);
