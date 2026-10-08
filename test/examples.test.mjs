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
test('playground renders verse numbers without confusing them with nested verse records', async () => {
  const makeElement = () => ({textContent:'',children:[],append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;}});
  const reader=makeElement();
  const source=readFileSync(new URL('../public/client.js',import.meta.url),'utf8');
  const rendering=source.slice(source.indexOf('function node('),source.indexOf('let activeRequest;'));
  const context={reader,document:{createElement:makeElement}};
  runInNewContext(rendering,context);
  for(const path of ['/api/v1/verses/10.15','/api/v1/daily','/api/v1/random?count=2','/api/v1/batch?ids=1.6,10.15','/api/v1/verses/10.15/related','/api/v1/chapters/1']) {
    const payload=await (await handleRequest(new Request(origin+path))).json();
    context.showReader(payload);
    const cards=reader.children.filter(el=>el.className==='verse-card');
    assert.ok(cards.length>0,path);
    for(const card of cards) {
      assert.ok(card.children.some(el=>el.className==='verse-meaning' && el.textContent.length>5),path);
      assert.ok(card.children.some(el=>el.className==='english-meaning' && el.children[1].textContent.length>10),path);
    }
  }
});
