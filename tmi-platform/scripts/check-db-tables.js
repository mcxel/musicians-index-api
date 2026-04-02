#!/usr/bin/env node
'use strict';

// Manually parse packages/db/.env to bypass dotenvx encryption handling
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', 'packages', 'db', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const { Pool } = require('../apps/api/node_modules/pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
)
  .then((r) => {
    console.log('DB TABLE COUNT:', r.rows.length);
    r.rows.forEach((t) => console.log(' -', t.table_name));
    // Check for critical tables
    const names = r.rows.map((t) => t.table_name);
    const critical = ['User', 'Session', 'Account', 'Wallet', 'Notification'];
    // Prisma lowercases table names unless @map is used
    const criticalLower = critical.map(c => c.toLowerCase());
    const missing = criticalLower.filter(c => !names.map(n => n.toLowerCase()).includes(c));
    if (missing.length === 0) {
      console.log('\nSTATUS: SCHEMA PUSH COMPLETE - all critical tables present');
    } else {
      console.log('\nSTATUS: SCHEMA PUSH INCOMPLETE - missing tables:', missing.join(', '));
    }
    pool.end();
  })
  .catch((e) => {
    console.error('DB ERROR:', e.message);
    pool.end();
    process.exit(1);
  });
