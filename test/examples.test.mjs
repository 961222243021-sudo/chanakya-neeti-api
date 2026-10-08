import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { handleRequest } from '../src/app.mjs';
const origin = 'http://localhost';
const elements = new Map();
const element = key => { if (!elements.has(key)) elements.set(key, { value: '', textContent: '', children: [], replaceChildren() { this.children = []; }, append(child) { this.children.push(child); } }); return elements.get(key); };
const document = { querySelector: element, getElementById: id => element(`#${id}`), createElement: () => ({ textContent: '' }) };
const prefix = readFileSync(new URL('../public/client.js',import.meta.url), 'utf8').split('function setView')[0];
runInNewContext(prefix, { document, location: { origin }, URL, JSON });
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const fetch = input => handleRequest(new Request(String(input)));
const run = (id, suffix = '') => new AsyncFunction('fetch','URL','URLSearchParams','document','console',element(`#${id}`).textContent + suffix)(fetch,URL,URLSearchParams,document,{log(){}});
test('generated guide examples run against the actual handler', async () => {
  await run('search-example');
  const count = await run('pagination-example', '\nreturn records.length;');assert.equal(count, 319);
  const exported = await run('export-example', '\nreturn verses;');assert.equal(exported.length, 20);assert.ok(exported.every(v => v.text.english_meaning));
  await run('js-example');
  // renderVerse is asynchronous; await a complete event-loop turn.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(element('#verse').children.length, 6);
  assert.match(element('#verse').children.at(-1).textContent, /birds leaving/);
  assert.ok(element('#python-example').textContent.includes("print('\\n'.join"));
});
