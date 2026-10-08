import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

test('real HTTP adapter serves docs search export errors and HEAD', async () => {
  process.env.PORT = '0';
  const { default: server } = await import('../server.mjs');
  if (!server.listening) await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${origin}/health`); assert.equal(health.status, 200); assert.equal((await health.json()).data.status, 'ok');
    const spec = await fetch(`${origin}/openapi.json`); assert.equal((await spec.json()).openapi, '3.1.0');
    const docs = await fetch(`${origin}/docs`); assert.ok((await docs.text()).includes('Shyam'));
    const search = await fetch(`${origin}/api/v1/verses?q=${encodeURIComponent('சேமி')}`); assert.equal(search.status, 200); assert.ok((await search.json()).data.pagination.total > 0);
    const exp = await fetch(`${origin}/api/v1/export?format=ndjson&chapter=1`); assert.equal((await exp.text()).trim().split('\n').length, 16);
    const head = await fetch(`${origin}/api/v1/verses/1.6`, { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
    const post = await fetch(`${origin}/api/v1/verses`, { method: 'POST' }); assert.equal(post.status, 405);
  } finally { await new Promise(resolve => server.close(resolve)); delete process.env.PORT; }
});
