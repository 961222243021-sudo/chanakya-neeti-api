import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, verses } from '../src/app.mjs';
const request = path => handleRequest(new Request(`http://localhost${path}`));

test('verse 10.15 has separate lines and a single-line string without newline escapes', async () => {
  const response = await request('/api/v1/verses/10.15');const payload = await response.json();const text = payload.data.text;
  assert.equal(text.lines_ta.length, 4); assert.ok(text.lines_ta.every(l => l.trim() === l && !l.includes('\n')));
  assert.equal(text.transliteration_ta, text.lines_ta.join(' '));assert.ok(!text.transliteration_ta.includes('\n'));
  assert.ok(text.meaning_ta.includes('பிரிவு')); assert.ok(!text.meaning_ta.includes('பிாிவு'));
  assert.equal(payload.meta.api_version, '1.2.0');
});
test('plain text uses actual line breaks and a readable Tamil explanation', async () => {
  const response = await request('/api/v1/verses/10.15?format=text');const body = await response.text();
  assert.ok(response.headers.get('content-type').startsWith('text/plain'));assert.ok(body.includes('\nநானாவர்ணா'));
  assert.ok(!body.includes('\\n'));assert.ok(body.includes('பிரிவு'));assert.ok(!body.includes('PDF'));
});
test('daily text format works and invalid output formats fail clearly', async () => {
  assert.ok((await request('/api/v1/daily?format=text')).headers.get('content-type').startsWith('text/plain'));
  assert.equal((await request('/api/v1/verses/10.15?format=xml')).status, 400);
  assert.equal((await request('/api/v1/daily?format=xml')).status, 400);
});
test('no public verse response or export contains provenance metadata', async () => {
  const paths = ['/api/v1/verses/10.15', '/api/v1/verses/10.15?include_raw=true', '/api/v1/daily', '/api/v1/random?count=2', '/api/v1/batch?ids=1.6,10.15', '/api/v1/verses/10.15/related', '/api/v1/chapters/1', '/api/v1/export', '/api/v1/export?format=ndjson'];
  for (const path of paths) {
    const response = await request(path);assert.equal(response.status, 200);const body = await response.text();
    for (const forbidden of ['"source"', '"sources"', '"edition_id"', 'sandhya', 'Sandhya', '"raw_text"']) {
      if (forbidden === '"raw_text"' && path.includes('include_raw=true')) continue;
      assert.ok(!body.includes(forbidden), `${path}: ${forbidden}`);
    }
  }
});
test('homepage and guide do not advertise provenance or removed routes', async () => {
  for (const path of ['/', '/docs']) {
    const body = await (await request(path)).text();
    for (const forbidden of ['source.pages', 'PDF pages', 'Sandhya', '/api/v1/sources', '/api/v1/supplementary']) assert.ok(!body.includes(forbidden), forbidden);
    assert.ok(body.includes('lines_ta'));
  }
});
test('HTML verse reader validates IDs and serves the requested verse path', async () => {
  assert.equal((await request('/read/10.15')).status, 200);assert.equal((await request('/read/13.4')).status, 404);
});
test('comma-only queries do not return the whole collection', async () => {
  assert.equal((await request('/api/v1/verses?q=,,,')).status, 400);
});
test('all records produce nonempty trimmed line arrays', async () => {
  const payload = await (await request('/api/v1/export')).json();assert.equal(payload.records.length, verses.length);
  for (const verse of payload.records) { assert.ok(verse.text.lines_ta.length > 0);assert.ok(verse.text.lines_ta.every(l => l && l === l.trim() && !l.includes('\n'))); }
});
