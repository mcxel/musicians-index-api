const http = require('http');

const endpoints = [
  { name: 'upload', method: 'POST', path: '/api/media/upload', body: { fileName: 'test.jpg', mimeType: 'image/jpeg', category: 'beat' } },
  { name: 'library', method: 'GET', path: '/api/media/library' },
  { name: 'secure-link', method: 'POST', path: '/api/media/secure-link', body: { assetId: 'test', scope: 'preview' } },
  { name: 'access', method: 'GET', path: '/api/media/access/invalid-token' },
  { name: 'convert', method: 'POST', path: '/api/media/convert', body: { assetId: 'test', targetFormat: 'webp' } },
  { name: 'watermark', method: 'POST', path: '/api/media/watermark', body: { assetId: 'test', mode: 'preview' } },
  { name: 'audit-logs', method: 'GET', path: '/api/media/audit-logs' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint.path,
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve({ name: endpoint.name, code: res.statusCode });
      res.on('data', () => {});
    });

    req.on('error', () => {
      resolve({ name: endpoint.name, code: 'ERROR' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name: endpoint.name, code: 'TIMEOUT' });
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Media Endpoint Smoke Tests\n');
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    const status = result.code === 401 || result.code === 403 || result.code === 200 || result.code === 201 ? '✅' : '❌';
    console.log(`${status} ${result.name.padEnd(15)} → ${result.code}`);
  }
}

runTests();
