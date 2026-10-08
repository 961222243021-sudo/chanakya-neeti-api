import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../src/app.mjs';
const request = path => handleRequest(new Request(`http://localhost${path}`));
test('all public records have distinct nonempty English explanations', async () => {
  const { records } = await (await request('/api/v1/export')).json();
  assert.equal(records.length, 319);
  assert.equal(new Set(records.map(v => v.text.english_meaning)).size, 319);
  for (const v of records) {
    assert.ok(v.text.english_meaning.length >= 40, v.id);
    assert.ok(!v.text.english_meaning.includes('\n'), v.id);
  }
});
test('English meaning appears in every verse response shape', async () => {
  for (const path of ['/api/v1/verses/10.15','/api/v1/daily','/api/v1/random','/api/v1/batch?ids=10.15','/api/v1/verses/10.15/related','/api/v1/chapters/10','/api/v1/verses','/api/v1/export?format=ndjson']) {
    const response = await request(path);assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('"english_meaning"'), path);
  }
});
test('plain English relates verse 10.15 to separation and is searchable', async () => {
  const { data } = await (await request('/api/v1/verses/10.15')).json();
  assert.match(data.text.english_meaning, /birds leaving/);
  const payload = await (await request('/api/v1/verses?q=moving%20natural&limit=100')).json();
  assert.ok(payload.data.results.some(v => v.id === '10.15'));
  const text = await (await request('/api/v1/verses/10.15?format=text')).text();
  assert.ok(text.includes(data.text.english_meaning));
});
test('guide covers all endpoints without loading a specification', async () => {
  const html = await (await request('/docs')).text();
  for (const path of ['/api/v1/verses/{id}', '/api/v1/verses/{id}/related', '/api/v1/chapters/{chapter}', '/api/v1/batch', '/api/v1/topics', '/api/v1/daily', '/api/v1/random', '/api/v1/export', '/api/v1/quality', '/health']) assert.ok(html.includes(path), path);
  for (const id of ['quickstart','fields','parameters','code','pagination','errors']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(!/openapi/i.test(html));
  const client = await (await request('/client.js')).text();assert.ok(!/openapi/i.test(client));
  assert.ok(client.includes('verse.text.english_meaning'));
});
test('homepage image is served intact with the correct type', async () => {
  const response = await request('/chanakya-modern.png');
  assert.equal(response.status, 200);assert.equal(response.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(new URL('../public/chanakya-modern.png',import.meta.url)));
});
