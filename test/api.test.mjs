import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, verses } from '../src/app.mjs';
const request = (path, options = {}) => handleRequest(new Request(`http://localhost${path}`, options));
const data = async path => { const r = await request(path); assert.equal(r.status, 200); return (await r.json()).data; };

test('metadata credits Shyam and exposes edition record count', async () => {
  const d = await data('/api/v1'); assert.equal(d.developed_by, 'Shyam'); assert.equal(d.records, 319);
});
test('lookup contains clean Unicode Tamil without internal metadata', async () => {
  const d = await data('/api/v1/verses/1.6'); assert.equal(d.id, '1.6'); assert.equal(d.source, undefined); assert.equal(d.quality, undefined);
  assert.ok(d.text.meaning_ta.includes('சேமி')); assert.ok(!('raw_text' in d));
});
test('raw text is explicitly opt in', async () => { assert.ok((await data('/api/v1/verses/1.6?include_raw=true')).raw_text.includes('Ά')); });
test('edition numbering gaps return 404 without invented content', async () => {
  for (const id of ['13.4', '13.5', '13.6', '13.7', '13.11']) assert.equal((await request(`/api/v1/verses/${id}`)).status, 404);
});
test('chapters retain exact counts and numbering', async () => {
  const d = await data('/api/v1/chapters/13?limit=100'); assert.deepEqual(d.chapter.missing_within_observed_range, [4, 5, 6, 7, 11]);
  assert.equal(d.pagination.total, d.chapter.count); assert.ok(d.results.every(r => r.chapter === 13));
});
test('Tamil search ranks and finds source text', async () => {
  const d = await data(`/api/v1/verses?q=${encodeURIComponent('சேமி')}&limit=100`); assert.ok(d.pagination.total > 0);
  assert.ok(d.results.some(r => r.id === '1.6'));
});
test('English topic search works', async () => { assert.ok((await data('/api/v1/verses?q=money')).pagination.total > 0); });
test('combined filters and pagination', async () => {
  const d = await data('/api/v1/verses?chapter=1&topic=money&limit=2&page=1');
  assert.ok(d.results.length <= 2 && d.results.length > 0); assert.ok(d.results.every(r => r.chapter === 1 && r.topics.includes('money')));
});
test('empty reviewed filter is honest', async () => { assert.equal((await data('/api/v1/verses?review=reviewed')).pagination.total, 0); });
test('daily result is deterministic and date validated', async () => {
  const a = await data('/api/v1/daily?date=2026-10-08'); const b = await data('/api/v1/daily?date=2026-10-08'); assert.deepEqual(a, b);
  assert.equal(a.timezone, 'Asia/Kolkata'); assert.equal((await request('/api/v1/daily?date=2026-02-30')).status, 400);
});
test('daily filters never leak outside selected chapter', async () => { assert.equal((await data('/api/v1/daily?chapter=3')).verse.chapter, 3); });
test('random is unique constrained and uncached', async () => {
  const response = await request('/api/v1/random?count=10&chapter=1'); assert.equal(response.headers.get('cache-control'), 'no-store');
  const d = (await response.json()).data; assert.equal(new Set(d.map(r => r.id)).size, 10); assert.ok(d.every(r => r.chapter === 1));
});
test('batch preserves requested ordering', async () => { assert.deepEqual((await data('/api/v1/batch?ids=2.1,1.6')).map(v => v.id), ['2.1', '1.6']); });
test('batch fails clearly on missing IDs', async () => { assert.equal((await request('/api/v1/batch?ids=1.6,13.4')).status, 404); });
test('related results explain heuristic and exclude source', async () => {
  const d = await data('/api/v1/verses/1.6/related'); assert.equal(d.method, 'shared_keyword_topics'); assert.ok(d.results.length > 0);
  assert.ok(d.results.every(r => r.verse.id !== '1.6' && r.shared_topics.length > 0));
});
test('strict parameter validation rejects ambiguity', async () => {
  for (const suffix of ['limit=101', 'limit=1.2', 'chapter=18', 'topic=invalid', 'page=0', 'include_raw=yes', 'q=', 'match=bad&q=money', 'limit=1&limit=2', 'unknown=true']) {
    assert.equal((await request(`/api/v1/verses?${suffix}`)).status, 400, suffix);
  }
});
test('export JSON and NDJSON preserve record totals', async () => {
  const json = await request('/api/v1/export'); const d = await json.json(); assert.equal(d.records.length, 319); assert.ok(json.headers.get('content-disposition').includes('attachment'));
  const ndjson = await request('/api/v1/export?format=ndjson&chapter=1'); const lines = (await ndjson.text()).trim().split('\n').map(JSON.parse);
  assert.equal(lines.length, 16); assert.ok(lines.every(r => r.chapter === 1));
});
test('OpenAPI is a raw spec rather than an API envelope', async () => {
  const r = await request('/openapi.json'); const spec = await r.json(); assert.equal(spec.openapi, '3.1.0'); assert.ok(spec.paths['/api/v1/verses']);
  assert.ok(spec.components.schemas.Verse);
});
test('docs and local assets need no CDN', async () => {
  const r = await request('/docs'); assert.equal(r.status, 200); const html = await r.text(); assert.ok(html.includes('Developed by')); assert.ok(html.includes('Shyam'));
  assert.ok(r.headers.get('content-security-policy').includes("script-src 'self'"));
  for (const path of ['/client.js', '/style.css']) assert.equal((await request(path)).status, 200);
});
test('CORS preflight and HEAD', async () => {
  const r = await request('/api/v1/verses', { method: 'OPTIONS' }); assert.equal(r.status, 204); assert.ok(r.headers.get('access-control-allow-headers').includes('x-api-key'));
  const h = await request('/api/v1/verses/1.6', { method: 'HEAD' }); assert.equal(h.status, 200); assert.equal(await h.text(), '');
});
test('ETag conditional GET supports weak comparison', async () => {
  const r = await request('/api/v1/verses/1.6'); const etag = r.headers.get('etag'); assert.ok(etag);
  const cached = await request('/api/v1/verses/1.6', { headers: { 'if-none-match': `W/${etag}` } }); assert.equal(cached.status, 304);
});
test('writes blocked with structured error and no-store', async () => {
  const r = await request('/api/v1/verses', { method: 'POST' }); assert.equal(r.status, 405); assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal((await r.json()).error.code, 'METHOD_NOT_ALLOWED');
});
test('optional API key rejects and never publicly caches protected data', async () => {
  process.env.API_KEY = 'test-key';
  try {
    assert.equal((await request('/api/v1/verses')).status, 401);
    const r = await request('/api/v1/verses', { headers: { 'x-api-key': 'test-key' } }); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.equal((await request('/openapi.json')).status, 200);
  } finally { delete process.env.API_KEY; }
});
test('configured CORS only echoes allowed origins', async () => {
  process.env.CORS_ORIGINS = 'https://example.com';
  try {
    const a = await request('/health', { headers: { origin: 'https://example.com' } }); assert.equal(a.headers.get('access-control-allow-origin'), 'https://example.com');
    const b = await request('/health', { headers: { origin: 'https://bad.example' } }); assert.equal(b.headers.get('access-control-allow-origin'), null);
  } finally { delete process.env.CORS_ORIGINS; }
});
test('public provenance routes are not exposed', async () => {
  for (const path of ['/api/v1/sources', '/api/v1/supplementary', '/data/sources.json']) assert.equal((await request(path)).status, 404);
});
