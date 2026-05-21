/* Dev-only tickets API (no Nest). Run with: pnpm run dev:tickets-api */
// Auto-load .env for developer convenience
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
} catch (e) {
  // noop if dotenv not installed
}
const http = require('http')
const crypto = require('crypto')

const PORT = Number(process.env.PORT || 4000)
const ENABLED = String(process.env.DEV_TICKETS || '').toLowerCase() === 'true'

// In-memory store
// tokenHash -> { tokenHash, status, lastCheckedInAt }
const store = new Map()

function json(res, statusCode, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(body)
}

function bad(res, msg, extra = {}) {
  return json(res, 400, { ok: false, error: msg, ...extra })
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function ensureSeed(token) {
  const h = hashToken(token)
  if (!store.has(h)) {
    store.set(h, { tokenHash: h, status: 'ISSUED', lastCheckedInAt: null })
  }
  return store.get(h)
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  if (!ENABLED) {
    return json(res, 503, {
      ok: false,
      error: 'DEV_TICKETS is not enabled. Set DEV_TICKETS=true in .env and restart.',
    })
  }

  // Only POST endpoints
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' })
  }

  try {
    if (req.url === '/api/tickets/verify') {
      const body = await readJson(req)
      const token = String(body.token || '')
      if (!token) return bad(res, 'Missing token')

      const t = ensureSeed(token)
      const valid = t.status === 'ISSUED'

      return json(res, 200, {
        ok: true,
        tokenStatus: t.status,
        valid,
        message: valid ? 'Ticket valid' : 'Ticket not valid',
      })
    }

    if (req.url === '/api/tickets/checkin') {
      const body = await readJson(req)
      const token = String(body.token || '')
      if (!token) return bad(res, 'Missing token')

      const t = ensureSeed(token)

      if (t.status !== 'ISSUED') {
        return json(res, 409, {
          ok: false,
          error: 'Ticket already used or invalid',
          tokenStatus: t.status,
          lastCheckedInAt: t.lastCheckedInAt,
        })
      }

      t.status = 'CHECKED_IN'
      t.lastCheckedInAt = new Date().toISOString()
      store.set(t.tokenHash, t)

      return json(res, 200, {
        ok: true,
        tokenStatus: t.status,
        checkedInAt: t.lastCheckedInAt,
        message: 'Checked in',
      })
    }

    return json(res, 404, { ok: false, error: 'Not found' })
  } catch (e) {
    return bad(res, e?.message || 'Request failed')
  }
})

server.listen(PORT, () => {
  console.log(`[dev-tickets-api] listening on http://localhost:${PORT}`)
  console.log(`[dev-tickets-api] DEV_TICKETS=${process.env.DEV_TICKETS}`)
})
