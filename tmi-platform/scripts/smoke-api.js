#!/usr/bin/env node
const { execSync } = require('child_process');
execSync('node ./scripts/healthcheck-api.js', { stdio: 'inherit' });
