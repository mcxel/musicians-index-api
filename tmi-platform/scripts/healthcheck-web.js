#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');

const urlStr = process.env.WEB_HEALTH_URL || 'http://localhost:3000/';
const u = new URL(urlStr);
const client = u.protocol === 'https:' ? https : http;

const req = client.request(
  { method: 'GET', hostname: u.hostname, port: u.port, path: u.pathname + u.search, timeout: 8000 },
  (res) => {
    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`✅ WEB health OK (${res.statusCode}) ${urlStr}`);
      process.exit(0);
    }
    console.error(`❌ WEB health FAIL (${res.statusCode}) ${urlStr}`);
    process.exit(1);
  }
);

req.on('timeout', () => { console.error(`❌ WEB health TIMEOUT ${urlStr}`); req.destroy(); process.exit(1); });
req.on('error', (e) => { console.error(`❌ WEB health ERROR ${urlStr}`, e.message); process.exit(1); });
req.end();
