import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import functionEntry from '../api/index.js';

test('explicit Vercel Function serves homepage and nested API paths', async () => {
  for (const path of ['/', '/docs', '/api/v1/verses/1.6', '/health', '/client.js', '/style.css']) {
    const response = await functionEntry.fetch(new Request(`https://example.vercel.app${path}`));
    assert.equal(response.status, 200, path);
    if (path === '/') { const html = await response.text(); assert.ok(html.includes('About this API')); assert.ok(html.includes('copy-endpoint')); }
    if (path === '/api/v1/verses/1.6') assert.equal((await response.json()).data.id, '1.6');
  }
});
test('Vercel configuration includes data, homepage and catch-all routing', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(config.outputDirectory, 'public');
  assert.equal(config.framework, null);
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/api/index' }]);
  assert.ok(config.functions['api/index.js'].includeFiles.includes('data/**'));
  assert.ok(config.functions['api/index.js'].includeFiles.includes('public/**'));
  assert.ok(existsSync(new URL('../public/index.html', import.meta.url)));
  assert.equal(existsSync(new URL('../server.mjs', import.meta.url)), false);
});
