#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');

const urlStr = process.env.API_HEALTH_URL || 'http://localhost:3001/health';
const u = new URL(urlStr);
const client = u.protocol === 'https:' ? https : http;

const req = client.request(
  { method: 'GET', hostname: u.hostname, port: u.port, path: u.pathname + u.search, timeout: 8000 },
  (res) => {
    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ API health OK (${res.statusCode}) ${urlStr}`);
      process.exit(0);
    }
    console.error(`❌ API health FAIL (${res.statusCode}) ${urlStr}`);
    process.exit(1);
  }
);

req.on('timeout', () => { console.error(`❌ API health TIMEOUT ${urlStr}`); req.destroy(); process.exit(1); });
req.on('error', (e) => { console.error(`❌ API health ERROR ${urlStr}`, e.message); process.exit(1); });
req.end();
